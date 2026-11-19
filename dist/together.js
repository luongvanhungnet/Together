const tutorial={n:4,walls:[],start:[0,5],goal:[11,15],par:2};
const originalStages=[tutorial,LEVELS[0],LEVELS[3],LEVELS[4],LEVELS[2],...EXTRA_LEVELS,...BONUS];
const stages = [...originalStages, ...EASY_LEVELS]
  .map((board, id) => ({...board, id}))
  .sort((a,b) => a.par-b.par || a.id-b.id);
function campaignId(index){return stages[index].id}
function difficulty(board){return board.par<=10?'Easy':board.par<=30?'Normal':'Hard'}
function step(pos,d,g){let [dx,dy]=[[0,-1],[1,0],[0,1],[-1,0]][d],r=[...pos];let order=r.map((_,i)=>i).sort((a,b)=>(r[b]%g.n*dx+Math.floor(r[b]/g.n)*dy)-(r[a]%g.n*dx+Math.floor(r[a]/g.n)*dy));for(let i of order)while(true){let x=r[i]%g.n+dx,y=Math.floor(r[i]/g.n)+dy,q=y*g.n+x;if(x<0||y<0||x>=g.n||y>=g.n||g.walls.includes(q)||r.includes(q))break;r[i]=q}return r}
function same(a,b){return a.join(',')===b.join(',')}
function solve(start,g){let queue=[start],seen=new Set([start.join(',')]),prev=new Map(),goal=null;for(let h=0;h<queue.length;h++){let s=queue[h];if(same(s,g.goal)){goal=s.join(',');break}for(let d=0;d<4;d++){let t=step(s,d,g),k=t.join(',');if(!seen.has(k)){seen.add(k);prev.set(k,[s.join(','),d]);queue.push(t)}}}if(goal===null)return null;let path=[];while(prev.has(goal)){let [old,d]=prev.get(goal);path.push(d);goal=old}return path.reverse()}
const $=s=>document.querySelector(s),names=['Learn in two moves','A small problem','The long way around','No easy way home','Everything is connected','Crossed paths','The holding pattern','Thread the needle','A little cooperation','Wrong turn, right idea','The waiting room','Perfect interference','Three-body problem','The narrow escape','Almost together','The last detour','Tangled intentions','The long goodbye','A beautiful mistake','One final wrong turn','Dinner for four','Bone to pick','Full house'];
function read(key,fallback){try{let v=JSON.parse(localStorage.getItem(key));return v&&typeof v==='object'&&!Array.isArray(v)?v:fallback}catch{return fallback}}
let storageOK=true;function write(key,value){try{localStorage.setItem(key,JSON.stringify(value))}catch{storageOK=false}}
let best=read('together-best',{}),dailyBest=read('together-daily-best',{}),saves=read('together-saves-v1',{}),level=0,mode='campaign',day='',p=[],history=[],won=false,hints=0;
let redoStack=[];
let records=read('together-records-v1',{}),dailyCompletions=read('together-streak-days-v1',{}),recorded=false,hintContext=null;
function dateSerial(date){return Math.floor(Date.parse(date+'T00:00:00Z')/86400000)}
function streakStats(today=todayKey()){let dates=Object.keys(dailyCompletions).filter(d=>validDay(d)&&dailyCompletions[d]===true&&d<=today).map(dateSerial).sort((a,b)=>a-b),longest=0,run=0,previous=null;for(let d of dates){run=d===previous+1?run+1:1;longest=Math.max(longest,run);previous=d}let set=new Set(dates),d=dateSerial(today),current=0;if(!set.has(d))d--;while(set.has(d)){current++;d--}return{current,longest,total:dates.length}}
function recordFinish(){let key=saveKey(),r=records[key]||{};if(!recorded){r.completions=(r.completions||0)+1;if(hints===0)r.noHintCompletions=(r.noHintCompletions||0)+1;recorded=true}if(hints===0)r.bestNoHints=Math.min(Number.isFinite(r.bestNoHints)?r.bestNoHints:Infinity,history.length);records[key]=r;write('together-records-v1',records);if(mode==='daily'&&day===todayKey()){dailyCompletions[day]=true;write('together-streak-days-v1',dailyCompletions)}}
function clearHint(){hintContext=null;$('#reveal-hint').hidden=true;$('#hint-message').textContent='';placePieces()}
function drawRecords(){let r=records[saveKey()]||{},moves=mode==='daily'?dailyBest[day]?.moves:best[campaignId(level)],medal=Number.isFinite(r.bestNoHints),s=streakStats();$('#personal-best').textContent='Best moves: '+(Number.isFinite(moves)?moves:'—');$('#hint-free-best').textContent='Best without hints: '+(medal?r.bestNoHints+' moves':'—');$('#medal').textContent=medal?'🏅 Hint-free medal earned':'◇ Hint-free medal to earn';$('#completion-record').textContent=`${r.completions||0} recorded finishes · ${r.noHintCompletions||0} without hints`;$('#run-status').textContent=hints===0?'Hint-free run · medal available':'Assisted run · restart for a hint-free medal';$('#hint-button').textContent='Gentle hint';$('#streak').textContent=`${s.current} day streak · best ${s.longest}`;$('#streak-note').textContent=`${s.total} daily challenges completed on their day. Only today’s puzzle extends your streak.`;let medals=stages.filter((_,i)=>Number.isFinite(records['c:'+campaignId(i)]?.bestNoHints)).length;$('#medal-total').textContent=`${medals} / ${stages.length} hint-free medals`;}
function gentleChoice(pos,d,g){let next=step(pos,d,g),changed=pos.map((v,i)=>i).filter(i=>vChanged(i));function vChanged(i){return pos[i]!==next[i]}let distance=(v,t)=>Math.abs(v%g.n-t%g.n)+Math.abs(Math.floor(v/g.n)-Math.floor(t/g.n));return changed.sort((a,b)=>{let value=i=>(next[i]===g.goal[i]?100:0)+distance(pos[i],g.goal[i])-distance(next[i],g.goal[i]);return value(b)-value(a)})[0]}
function hint(){if(won)return;if(hintContext&&hintContext.key===saveKey()&&same(hintContext.position,p))return;let path=solve(p,game());if(!path||!path.length){$('#hint-message').textContent=path===null?'No route from here. Undo or restart to find another path.':'All animals are fed.';return}let piece=gentleChoice(p,path[0],game());hintContext={key:saveKey(),position:[...p],direction:path[0],piece,revealed:false};hints++;persist();draw();$('#hint-message').textContent=`Focus on the ${pairAt(piece).food.toLowerCase()} and its ${pairAt(piece).animal.toLowerCase()}. Think about how walls and other foods can stop it. Want a direction? Reveal the next move below.`;$('#reveal-hint').hidden=false;$('#notice').textContent='Gentle hint used. You can still earn stars.'}
function revealHint(){if(won||!hintContext||hintContext.key!==saveKey()||!same(hintContext.position,p))return;if(!hintContext.revealed){hintContext.revealed=true;hints++;persist()}$('#hint-message').textContent='Try '+['↑ up','→ right','↓ down','← left'][hintContext.direction]+'. All pieces slide together.';draw();$('#reveal-hint').hidden=true}

function todayKey(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Bangkok',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)}
function validDay(v){return /^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!isNaN(Date.parse(v))&&new Date(v+'T00:00:00Z').toISOString().slice(0,10)===v}
function dailyBoard(date){let serial=Math.floor(Date.parse(date+'T00:00:00Z')/86400000);return DAILY_LEVELS[((serial%DAILY_LEVELS.length)+DAILY_LEVELS.length)%DAILY_LEVELS.length]}
function game(){return mode==='daily'?dailyBoard(day):stages[level]}
function saveKey(){return mode==='daily'?(challengeRun&&day===incoming.day?'challenge:'+challengeToken:'d:'+day):'c:'+campaignId(level)}
function stars(moves,par){return !Number.isFinite(moves)||moves<par?0:moves===par?3:moves<=par+Math.max(2,Math.ceil(par*.2))?2:1}
function starText(n){return '★'.repeat(n)+'☆'.repeat(3-n)}
function validPosition(v,g){return Array.isArray(v)&&v.length===g.start.length&&new Set(v).size===v.length&&v.every(x=>Number.isInteger(x)&&x>=0&&x<g.n*g.n&&!g.walls.includes(x))}
function validSave(s,g){if(!s||!validPosition(s.p,g)||!Array.isArray(s.history)||s.history.length>10000)return false;let sequence=[...s.history,s.p];if(!sequence.every(v=>validPosition(v,g)))return false;if(!same(sequence[0],g.start))return false;for(let i=1;i<sequence.length;i++){if(!validPosition(sequence[i],g)||!Array.from({length:4},(_,d)=>step(sequence[i-1],d,g)).some(t=>same(t,sequence[i])))return false}return true}
function persist(){saves[saveKey()]={p:[...p],history:history.map(x=>[...x]),redoStack,hints,recorded};write('together-saves-v1',saves);write('together-last-v1',{mode,level:campaignId(level),day});$('#save-note').textContent=storageOK?'Progress saved on this browser.':'Browser storage is unavailable. Keep this tab open to retain progress.'}
function clearDailyLink(){challengeRun=false;if(typeof window!=='undefined'&&new URLSearchParams(location.search).has('daily')){let url=new URL(location.href);url.searchParams.delete('daily');url.searchParams.delete('challenge');window.history.replaceState(null,'',url)}}
function load(i,reset=false){if(!Number.isInteger(i)||i<0||i>=stages.length)return;clearDailyLink();mode='campaign';level=i;openBoard(reset)}
function playDaily(date=todayKey(),reset=false){if(arguments.length===0)clearDailyLink();mode='daily';day=validDay(date)?date:todayKey();openBoard(reset)}
function restart(){openBoard(true)}
function openBoard(reset=false){resetChallengeShare();let g=game(),s=saves[saveKey()];if(!reset&&validSave(s,g)){p=[...s.p];history=s.history.map(x=>[...x]);hints=Number.isInteger(s.hints)&&s.hints>=0?s.hints:1;recorded=s.recorded===true}else{p=[...g.start];history=[];hints=0;recorded=false}redoStack=!reset&&Array.isArray(s?.redoStack)&&validSave({p:s.redoStack.at(0),history:[...history,p,...s.redoStack.slice(1).reverse()]},g)?s.redoStack:[];hidePreview();hintContext=null;won=same(p,g.goal);if(won)recordFinish();buildBoard();draw();persist();$('#share-panel').hidden=true;$('#reveal-hint').hidden=true;$('#hint-message').textContent='';if(won)showWin();else $('#notice').textContent=history.length?'Resumed exactly where you left off.':mode==='daily'?'Same puzzle for everyone. New puzzle at midnight Bangkok time.':g.id===0?'Try → then ↓. Every piece moves.':''}
function buildBoard(){let g=game(),pairs=pairsFor(g.start.length);$('#legend').innerHTML=pairs.map(v=>`<div class="food-pair ${v.color}"><span class="legend-icons">${foodIcon(v.foodIcon)}<span class="pair-arrow">→</span>${foodIcon(v.animalIcon)}</span><span class="pair-label">${v.food} → ${v.animal}</span></div>`).join('');$('#board').style.gridTemplateColumns=`repeat(${g.n},1fr)`;$('#board').innerHTML=Array.from({length:g.n*g.n},(_,j)=>{let t=g.goal.indexOf(j),v=pairs[t];return `<div class="tile ${g.walls.includes(j)?'wall':''}" data-cell="${j}"${v?` role="img" aria-label="${v.animal} target for ${v.food.toLowerCase()}"`:''}>${v?`<span class="target animal-target ${v.color}">${foodIcon(v.animalIcon)}<span class="icon-label">${v.animal}</span></span>`:''}</div>`}).join('')+`<div class="piece-layer" style="--n:${g.n}">${p.map((_,i)=>{let v=pairs[i];return `<span class="moving-piece ${v.color}" data-piece="${i}" role="img" aria-label="${v.food}, feed the ${v.animal.toLowerCase()}">${foodIcon(v.foodIcon)}<span class="icon-label">${v.food}</span></span>`}).join('')}</div><div id="preview-layer" aria-hidden="true" style="--n:${g.n}"></div>`;placePieces();}
function showFoodOnTarget(piece, cell){
  if(!piece.isConnected)return;
  piece.classList.add('on-target');
  const tile=$('#board').querySelector('[data-cell="'+cell+'"]');
  if(tile)tile.classList.add('shared-target');
}
function placePieces(){let g=game();$('#board').querySelectorAll('.moving-piece').forEach((el,i)=>{
  const previous=el.dataset.position;
  if(previous!==undefined&&previous!==String(p[i])){
    $('#board').querySelector('[data-cell="'+previous+'"]')?.classList.remove('shared-target');
  }
});$('#board').querySelectorAll('.moving-piece').forEach((el,i)=>{el.classList.toggle('hint-focus',hintContext?.piece===i);const destination=p[i];
const previous=el.dataset.position;
const occupied=g.goal.includes(destination);
if(previous!==String(destination)){
  clearTimeout(el.badgeTimer);
  el.classList.remove('on-target');
  el.dataset.position=destination;
  if(occupied){
    if(previous===undefined || matchMedia('(prefers-reduced-motion: reduce)').matches){
      showFoodOnTarget(el,destination);
    }else{
      el.badgeTimer=setTimeout(()=>showFoodOnTarget(el,destination),240);
    }
  }
}
el.style.transform=`translate(${(p[i]%g.n)*100}%,${Math.floor(p[i]/g.n)*100}%) translate(${(p[i]%g.n)*5}px,${Math.floor(p[i]/g.n)*5}px)`});$('#board').querySelectorAll('.tile').forEach((el,j)=>{let i=p.indexOf(j);el.classList.toggle('matched',i>=0&&g.goal[i]===j);el.classList.toggle('hint-target',hintContext!=null&&g.goal[hintContext.piece]===j)})}
function draw(){if($('#redo'))$('#redo').disabled=!redoStack.length;let g=game();const levelButtons=stages.map((s,i)=>{let n=stars(best[campaignId(i)],s.par);return `<button class="${mode==='campaign'&&i===level?'selected':''}" onclick="load(${i})" aria-label="Level ${i+1}, ${n} stars${Number.isFinite(records['c:'+campaignId(i)]?.bestNoHints)?', hint-free medal':''}" aria-pressed="${mode==='campaign'&&i===level}"><span>${i+1}${Number.isFinite(records['c:'+campaignId(i)]?.bestNoHints)?' 🏅':''}</span><small>${starText(n)}</small></button>`});
$('#levels').innerHTML=['Easy','Normal','Hard'].map(group=>{
  const buttons=levelButtons.filter((_,i)=>difficulty(stages[i])===group);
  return `<section class="level-group"><h3>${group}</h3><div class="level-grid">${buttons.join('')}</div></section>`;
}).join('');
let total=stages.reduce((n,g,i)=>n+stars(best[campaignId(i)],g.par),0),solved=stages.filter((g,i)=>stars(best[campaignId(i)],g.par)>0).length;$('#progress').textContent=`${solved} / ${stages.length} solved · ${total} / ${stages.length*3} stars`;let score=mode==='daily'?dailyBest[day]?.moves:best[campaignId(level)];$('#rating').textContent=starText(stars(score,g.par));$('#rating').setAttribute('aria-label',stars(score,g.par)+' stars earned');$('#star-guide').textContent=`★★★ ${g.par} moves · ★★ ≤${g.par+Math.max(2,Math.ceil(g.par*.2))} · ★ finish`;$('#difficulty').textContent=mode==='daily'?'DAILY CHALLENGE / '+day:difficulty(g).toUpperCase()+(g.id>=20&&g.id<23?' / FOUR-FOOD BONUS':'');$('#name').textContent=mode==='daily'?'One puzzle. Everyone together.':(names[g.id]||'Easy puzzle · '+g.par+' moves');$('#moves').textContent=history.length;$('#daily-button').classList.toggle('selected',mode==='daily');$('#daily-date').textContent=todayKey()+' · resets 00:00 Bangkok';$('#share-button').hidden=mode!=='daily'||!won;placePieces();drawRecords();renderReturnPlay();renderChallenge()}
function act(d,fromRedo=false){if(won||!Number.isInteger(d)||d<0||d>3)return;let q=step(p,d,game());if(same(p,q)){$('#notice').textContent='Blocked. Try another direction.';return}if(!fromRedo)redoStack=[];hidePreview();clearHint();history.push([...p]);p=q;won=same(p,game().goal);if(won){recordFinish();if(mode==='campaign'){best[campaignId(level)]=Math.min(Number.isFinite(best[campaignId(level)])?best[campaignId(level)]:Infinity,history.length);write('together-best',best)}else{let old=dailyBest[day];if(!old||history.length<old.moves||(history.length===old.moves&&hints<old.hints)){dailyBest[day]={moves:history.length,hints};write('together-daily-best',dailyBest)}}}draw();persist();$('#notice').textContent='';if(won)showWin()}
function showWin(){let n=stars(history.length,game().par);$('#notice').innerHTML=`<strong>${starText(n)} All animals fed!</strong>${hints===0?' 🏅 Hint-free!':''}`+(mode==='campaign'&&level<stages.length-1?` <button onclick="load(${level+1})">Next level →</button>`:mode==='daily'?' Your daily result is ready to share.':' You solved the collection.');$('#share-button').hidden=mode!=='daily'}
function undo(){if(!history.length)return;resetChallengeShare();hidePreview();clearHint();redoStack.push([...p]);p=history.pop();won=false;draw();persist();$('#share-panel').hidden=true;$('#notice').textContent='Move undone.'}
function shareText(){return `Together · Daily ${day}\n${starText(stars(history.length,game().par))} · ${history.length} moves\n${hints===0?'🏅 Hint-free':hints+' hint'+(hints===1?'':'s')+' used'} · No spoilers\n${location.origin}${location.pathname}?daily=${day}`}
async function shareResult(){if(mode!=='daily'||!won)return;let text=shareText();$('#share-panel').hidden=false;$('#share-text').value=text;try{await navigator.clipboard.writeText(text);$('#share-status').textContent='Result copied! Paste it wherever you like.'}catch{$('#share-status').textContent='Select and copy your result below.';$('#share-text').focus();$('#share-text').select()}}
document.addEventListener('keydown',e=>{if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;let d={ArrowUp:0,w:0,ArrowRight:1,d:1,ArrowDown:2,s:2,ArrowLeft:3,a:3};if(d[e.key]!==undefined){e.preventDefault();act(d[e.key])}if(e.key==='z')undo()});let touch=null;$('#board').addEventListener('pointerdown',e=>{touch=[e.clientX,e.clientY];$('#board').setPointerCapture(e.pointerId)});$('#board').addEventListener('pointerup',e=>{if(!touch)return;let dx=e.clientX-touch[0],dy=e.clientY-touch[1];touch=null;if(Math.max(Math.abs(dx),Math.abs(dy))<20)return;act(Math.abs(dx)>Math.abs(dy)?dx>0?1:3:dy>0?2:0)});$('#board').addEventListener('pointercancel',()=>touch=null);
document.addEventListener('visibilitychange',()=>{if(!document.hidden){$('#daily-date').textContent=todayKey()+' · resets 00:00 Bangkok';drawRecords();renderReturnPlay()}});
function redo(){
  const target=redoStack.at(-1);
  if(!target||won)return;
  const direction=[0,1,2,3].find(d=>same(step(p,d,game()),target));
  if(direction===undefined)return;
  redoStack.pop();
  act(direction,true);
}
function hidePreview(){
  const layer=$('#preview-layer');
  if(layer)layer.innerHTML='';
}
function preview(direction){
  const layer=$('#preview-layer');
  if(!layer||won)return;
  const g=game(), destinations=step(p,direction,g);
  layer.innerHTML=destinations.map((cell,i)=>{
    const pair=pairAt(i);
    return `<span class="preview-piece ${pair.color}" style="grid-area:${Math.floor(cell/g.n)+1}/${cell%g.n+1}">${foodIcon(pair.foodIcon)}</span>`;
  }).join('');
}
function setupPress(button,direction){
  let timer, held=false;
  button.addEventListener('pointerdown',e=>{
    if(!e.isPrimary||e.button!==0)return;
    held=false;
    button.setPointerCapture(e.pointerId);
    timer=setTimeout(()=>{held=true;preview(direction)},300);
  });
  function release(){clearTimeout(timer);hidePreview()}
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,release);
  button.addEventListener('contextmenu',e=>e.preventDefault());
  button.addEventListener('click',e=>{
    if(!held||e.detail===0)act(direction);
    held=false;
  });
}
if(document.querySelectorAll)document.querySelectorAll('[data-direction]').forEach(button=>setupPress(button,Number(button.dataset.direction)));
function weeklyDates(today) {
  const serial = dateSerial(today);
  const monday = serial - (serial + 3) % 7;
  return Array.from({length: serial - monday + 1}, (_, i) =>
    new Date((monday + i) * 86400000).toISOString().slice(0, 10));
}

function nextChallenge() {
  const unfinished = stages.findIndex((board, i) => !stars(best[campaignId(i)], board.par));
  if (unfinished >= 0) {
    const resume = saves['c:' + campaignId(unfinished)]?.history?.length > 0;
    return {index: unfinished, label: (resume ? 'Resume' : 'Play') + ' level ' + (unfinished + 1)};
  }
  const medal = stages.findIndex((_, i) => !Number.isFinite(records['c:' + campaignId(i)]?.bestNoHints));
  if (medal >= 0) return {index: medal, label: 'Try level ' + (medal + 1) + ' without hints'};
  const improve = stages.findIndex((board, i) => stars(best[campaignId(i)], board.par) < 3);
  if (improve >= 0) return {index: improve, label: 'Go for three stars on level ' + (improve + 1)};
  return null;
}

function renderReturnPlay() {
  const panel = $('#return-play');
  if (!panel) return;
  const today = todayKey();
  const dates = weeklyDates(today);
  const solved = dates.filter(date => Number.isFinite(dailyBest[date]?.moves)).length;
  $('#weekly-progress').textContent = solved >= 3
    ? 'Weekly goal complete · ' + solved + ' solved this week'
    : solved + ' / 3 daily puzzles solved this week';
  $('#weekly-meter').value = Math.min(solved, 3);
  const archive = $('#weekly-archive');
  const buttons = dates.map(date => {
    const complete = Number.isFinite(dailyBest[date]?.moves);
    const label = new Intl.DateTimeFormat('en', {weekday:'short', month:'short', day:'numeric', timeZone:'UTC'}).format(new Date(date));
    const active = mode === 'daily' && day === date;
    return '<button type="button" data-day="' + date + '" aria-pressed="' + active +
      '"><span>' + (date === today ? 'Today' : label) + '</span><small>' +
      (complete ? '✓ Solved' : 'Play') + '</small></button>';
  }).join('');
  if (archive.dataset.markup !== buttons) {
    archive.innerHTML = buttons;
    archive.dataset.markup = buttons;
  }
  const next = nextChallenge();
  const button = $('#next-challenge');
  button.hidden = !next;
  if (next) {
    button.textContent = next.label + ' →';
    button.dataset.level = next.index;
  }
}
if ($('#return-play')) {
  $('#weekly-archive').addEventListener('click', event => {
    const button = event.target.closest('[data-day]');
    if (!button) return;
    clearDailyLink();
    playDaily(button.dataset.day);
    $('#board').scrollIntoView({block:'nearest'});
  });
  $('#next-challenge').addEventListener('click', event => {
    const index = Number(event.currentTarget.dataset.level);
    const saved = saves['c:' + campaignId(index)];
    load(index, Array.isArray(saved?.p) && same(saved.p, stages[index].goal));
    $('#board').scrollIntoView({block:'nearest'});
  });
}
const challengeLog=read('together-challenge-log', {});
const challengeParams=new URLSearchParams(location.search);
const challengeDay=challengeParams.get('daily');
const challengeToken=challengeParams.get('challenge') || '';
const challengeMatch=/^([0-9]{1,5})\.([01])\.([a-f0-9]{16})$/.exec(challengeToken);
const incoming=validDay(challengeDay)&&challengeDay<=todayKey()&&challengeMatch&&
  Number(challengeMatch[1])>=dailyBoard(challengeDay).par
  ? {day:challengeDay,moves:Number(challengeMatch[1]),assisted:challengeMatch[2]==='1'} : null;
let challengeRun=Boolean(incoming);

function trackChallenge(){
  const now=todayKey();
  if(incoming){
    challengeLog[challengeToken] ||= {opened:now};
  }
  for(const entry of Object.values(challengeLog)){
    const elapsed=dateSerial(now)-dateSerial(entry.opened);
    if(entry.finished&&now>entry.finished&&elapsed<=7)entry.returned=true;
  }
  write('together-challenge-log',challengeLog);
}

function renderChallenge(){
  const panel=$('#friend-challenge');
  if(!panel)return;
  const receiving=challengeRun&&mode==='daily'&&day===incoming.day;
  panel.hidden=!receiving&&!(mode==='daily'&&won);
  $('#challenge-copy').hidden=mode!=='daily'||!won;
  $('#challenge-rematch').hidden=!receiving||!won;
  let message=receiving?'Finish this puzzle to reveal your friend’s score.':'Send this exact puzzle to a friend.';
  if(receiving&&won){
    const entry=challengeLog[challengeToken];
    if(!entry.finished){entry.finished=todayKey();write('together-challenge-log',challengeLog)}
    const theirs=incoming.moves, yours=history.length;
    const verdict=yours===theirs?'Tie.':yours<theirs?'You used fewer moves.':'Your friend used fewer moves.';
    message='You: '+yours+' moves '+starText(stars(yours,game().par))+
      (hints?' (with hints). ':' (hint-free). ')+'Friend: '+theirs+' moves '+
      starText(stars(theirs,game().par))+(incoming.assisted?' (with hints). ':' (hint-free). ')+verdict;
  }
  $('#challenge-message').textContent=message;
}

async function copyChallenge(){
  if(mode!=='daily'||!won)return;
  const nonce=Array.from(crypto.getRandomValues(new Uint8Array(8)),v=>v.toString(16).padStart(2,'0')).join('');
  const url=new URL(location.origin+location.pathname);
  url.searchParams.set('daily',day);
  url.searchParams.set('challenge',history.length+'.'+Number(hints>0)+'.'+nonce);
  const field=$('#challenge-link');
  field.hidden=false;
  field.value=url.href;
  try{await navigator.clipboard.writeText(url.href);$('#challenge-status').textContent='Challenge link copied.'}
  catch{field.focus();field.select();$('#challenge-status').textContent='Copy the challenge link below.'}
}
function challengeRematch(){
  if(challengeRun&&won&&mode==='daily'&&day===incoming.day)restart();
}
function resetChallengeShare(){
  const field=$('#challenge-link');
  if(field){field.hidden=true;field.value='';$('#challenge-status').textContent=''}
}
trackChallenge();
let requestedDay=new URLSearchParams(location.search).get('daily'),last=read('together-last-v1',{});if(validDay(requestedDay))playDaily(requestedDay);else if(last.mode==='daily')playDaily();else load(Math.max(0,stages.findIndex(board=>board.id===last.level)));
