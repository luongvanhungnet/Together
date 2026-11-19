import { createServer } from 'node:http';
import pg from 'pg';
import { randomBytes, createHash, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { readFileSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
if(!process.env.DATABASE_URL)throw new Error('Set DATABASE_URL in .env before starting Together.');
const db = new pg.Pool({connectionString:process.env.DATABASE_URL});
await db.query(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username TEXT UNIQUE NOT NULL, salt TEXT NOT NULL,
    password TEXT NOT NULL, progress JSONB NOT NULL DEFAULT '{}',
    revision INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY, account INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    expires BIGINT NOT NULL
  );
`);
const derive = promisify(scrypt);
const digest = value => createHash('sha256').update(value).digest('hex');
const sessionAge = 30 * 86400;
const saveKeys = new Set(['together-best','together-challenge-log','together-daily-best',
  'together-last-v1','together-records-v1','together-saves-v1','together-streak-days-v1','together-wallet-v1']);
const attempts = new Map();
const mime = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
function reply(res, status, value, headers={}) {
  res.writeHead(status, {'Content-Type':'application/json','Cache-Control':'no-store',...headers});
  res.end(JSON.stringify(value));
}
function fail(status,message){throw Object.assign(new Error(message),{status});}
async function body(req) {
  if(!req.headers['content-type']?.startsWith('application/json'))fail(415,'Expected JSON.');
  const chunks=[];
  let length=0;
  for await(const chunk of req){
    length+=chunk.length;
    if(length>4*1024*1024)fail(413,'Save exceeds the 4 MB limit.');
    chunks.push(chunk);
  }
  try {
    const value=JSON.parse(Buffer.concat(chunks));
    if(!value||typeof value!=='object'||Array.isArray(value))fail(400,'Expected an object.');
    return value;
  } catch {fail(400,'Invalid JSON.');}
}
function cookie(req) {
  return /(?:^|;\s*)together_session=([a-f0-9]{64})(?:;|$)/.exec(req.headers.cookie||'')?.[1];
}
async function session(req) {
  const token=cookie(req);
  if(!token)return null;
  return (await db.query('SELECT a.* FROM accounts a JOIN sessions s ON a.id=s.account WHERE s.token=$1 AND s.expires>$2',
    [digest(token),Date.now()])).rows[0];
}
function view(account) {
  return {username:account.username, revision:account.revision, progress:account.progress};
}
function cookieHeader(value,age) {
  return 'together_session='+value+'; Path=/; HttpOnly; SameSite=Strict; Max-Age='+age+
    (process.env.TOGETHER_SECURE_COOKIE==='1'?'; Secure':'');
}
async function signIn(req,res,account) {
  const token=randomBytes(32).toString('hex');
  const old=cookie(req);
  if(old)await db.query('DELETE FROM sessions WHERE token=$1',[digest(old)]);
  await db.query('DELETE FROM sessions WHERE expires<=$1',[Date.now()]);
  await db.query('INSERT INTO sessions VALUES ($1,$2,$3)',[digest(token),account.id,Date.now()+sessionAge*1000]);
  reply(res,200,view(account),{'Set-Cookie':cookieHeader(token,sessionAge)});
}
function limit(req) {
  const now=Date.now(), ip=req.socket.remoteAddress;
  for(const [address,record] of attempts)if(record.until<=now)attempts.delete(address);
  const record=attempts.get(ip)||{count:0,until:now+600000};
  if(++record.count>30)fail(429,'Too many attempts. Try again in ten minutes.');
  attempts.set(ip,record);
}
async function api(req,res,path) {
  const method=req.method;
  if(method!=='GET' && (req.headers['sec-fetch-site']==='cross-site' ||
    (req.headers.origin && new URL(req.headers.origin).host!==req.headers.host)))fail(403,'Origin rejected.');
  if(method==='POST' && ['/api/register','/api/login'].includes(path)) {
    limit(req);
    const input=await body(req);
    const username=typeof input.username==='string'?input.username.trim().toLowerCase():'';
    const password=input.password;
    if(!/^[a-z0-9_-]{3,24}$/.test(username)||typeof password!=='string'||password.length<8||password.length>128)
      fail(400,'Use a 3–24 character username and an 8–128 character password.');
    if(path==='/api/register'){
      const salt=randomBytes(16).toString('hex');
      const hash=(await derive(password,salt,64)).toString('hex');
      const created=await db.query('INSERT INTO accounts (username,salt,password) VALUES ($1,$2,$3) ON CONFLICT (username) DO NOTHING RETURNING *',[username,salt,hash]);
      if(!created.rowCount)fail(409,'That username is taken.');
      await signIn(req,res,created.rows[0]);
      return;
    }
    const account=(await db.query('SELECT * FROM accounts WHERE username=$1',[username])).rows[0];
    const hash=await derive(password,account?.salt||'missing-user-salt',64);
    if(!account||!timingSafeEqual(hash,Buffer.from(account.password,'hex')))fail(401,'Username or password is incorrect.');
    await signIn(req,res,account);
    return;
  }
  if(method==='POST'&&path==='/api/logout'){
    const token=cookie(req);
    if(token)await db.query('DELETE FROM sessions WHERE token=$1',[digest(token)]);
    reply(res,200,{}, {'Set-Cookie':cookieHeader('',0)});
    return;
  }
  if(path!=='/api/progress'||!['GET','PUT'].includes(method))fail(404,'API route not found.');
  const account=await session(req);
  if(!account)fail(401,'Sign in to sync.');
  if(method==='GET'){reply(res,200,view(account));return;}
  const {revision,progress}=await body(req);
  if(!Number.isSafeInteger(revision)||revision<0||!progress||typeof progress!=='object'||Array.isArray(progress)||
    Object.entries(progress).some(([key,value])=>!saveKeys.has(key)||!value||typeof value!=='object'||Array.isArray(value)))
    fail(400,'Invalid save data.');
  const updated=await db.query('UPDATE accounts SET progress=$1, revision=revision+1 WHERE id=$2 AND revision=$3',
    [JSON.stringify(progress),account.id,revision]);
  if(!updated.rowCount)fail(409,'A newer save exists. Choose which version to keep.');
  reply(res,200,{revision:revision+1});
}
const port=Number(process.env.PORT||4173);
createServer(async (req,res)=>{
  try{
    const path=new URL(req.url,'http://localhost').pathname;
    if(path.startsWith('/api/')){await api(req,res,path);return;}
    if(!['GET','HEAD'].includes(req.method))fail(405,'Method not allowed.');
    const file=resolve(root,'.'+decodeURIComponent(path==='/'?'/together.html':path));
    if(!file.startsWith(root.endsWith(sep)?root:root+sep)||!mime[extname(file)])fail(404,'File not found.');
    let data;
    try{if(statSync(file).isFile())data=readFileSync(file);}catch{}
    if(!data)fail(404,'File not found.');
    if(file.endsWith(sep+'together.html')){
      data=Buffer.from(data.toString().replace('<body>','<body data-local-server>'));
    }
    res.writeHead(200,{'Content-Type':mime[extname(file)],'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:data);
  }catch(error){
    if(!error.status)console.error(error);
    if(!res.headersSent)reply(res,error.status||500,{error:error.status?error.message:'Server error.'});
  }
}).listen(port,process.env.TOGETHER_HOST||'127.0.0.1',()=>console.log('Together local server · port '+port));
