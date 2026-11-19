(async function startTogether(){
  const gameScript=document.currentScript.dataset.game;
  function launch(){
    const script=document.createElement('script');
    script.src=gameScript;
    document.body.append(script);
  }
  if(!document.body.hasAttribute('data-local-server')){launch();return;}

  const $=id=>document.getElementById(id);
  const keys=['together-best','together-challenge-log','together-daily-best','together-last-v1',
    'together-records-v1','together-saves-v1','together-streak-days-v1','together-wallet-v1'];
  const status=text=>{$('account-status').textContent=text;};
  $('account-panel').hidden=false;
  function cached(username){
    try{return JSON.parse(localStorage.getItem('account-save:'+username));}
    catch{return null;}
  }
  function guestProgress(){
    const data={};
    for(const key of keys){
      try{
        const value=JSON.parse(localStorage.getItem(key));
        if(value&&typeof value==='object'&&!Array.isArray(value))data[key]=value;
      }catch{}
    }
    return data;
  }
  async function api(path,method='GET',data){
    const response=await fetch('/api/'+path,{
      method, credentials:'same-origin',
      headers:data?{'Content-Type':'application/json'}:undefined,
      body:data?JSON.stringify(data):undefined
    });
    const result=await response.json();
    if(!response.ok)throw Object.assign(new Error(result.error),{status:response.status});
    return result;
  }
  let username,revision,progress,pending=false,conflict=false,timer,inFlight,generation=0;
  function cache(){
    try{
      localStorage.setItem('account-save:'+username,JSON.stringify({revision,progress,pending}));
      return true;
    }catch{return false;}
  }
  function showConflict(show){
    conflict=show;
    $('account-use-server').hidden=!show;
    $('account-use-local').hidden=!show;
  }
  async function flush(){
    if(!username||!pending||conflict)return;
    if(inFlight)return inFlight;
    const sent=generation;
    inFlight=(async()=>{
      try{
        const result=await api('progress','PUT',{revision,progress});
        revision=result.revision;
        pending=generation!==sent;
        cache();
        status(pending?'Saving…':'Progress synced.');
      }catch(error){
        if(error.status===409)showConflict(true);
        status(error.status===409?'A newer save exists. Choose which version to keep.':
          'Sync failed. Your changes are queued in this browser.');
      }finally{
        inFlight=null;
        if(pending&&generation!==sent&&!conflict)schedule();
      }
    })();
    return inFlight;
  }
  function schedule(){
    clearTimeout(timer);
    timer=setTimeout(flush,350);
  }
  function attach(result){
    username=result.username;
    revision=result.revision;
    progress=result.progress;
    const saved=cached(username);
    if(saved?.pending){
      progress=saved.progress;
      revision=saved.revision;
      pending=true;
      showConflict(saved.revision!==result.revision);
    }
    $('account-form').hidden=true;
    $('account-controls').hidden=false;
    $('account-name').textContent='Signed in as '+username;
    status(conflict?'A newer save exists. Choose which version to keep.':'Account save loaded.');
    window.togetherAccountStore={
      getItem(key){return JSON.stringify(progress[key]??null);},
      setItem(key,raw){
        if(raw===JSON.stringify(progress[key]))return;
        progress[key]=JSON.parse(raw);
        pending=true;
        generation++;
        if(!cache())status('Browser storage is unavailable. Keep this tab open until synced.');
        schedule();
      }
    };
    if(pending&&!conflict)schedule();
  }
  $('account-form').addEventListener('submit',async event=>{
    event.preventDefault();
    const action=event.submitter?.value==='register'?'register':'login';
    const buttons=Array.from(event.currentTarget.querySelectorAll('button'));
    buttons.forEach(button=>button.disabled=true);
    try{
      const result=await api(action,'POST',{username:$('account-username').value,password:$('account-password').value});
      if(action==='register'&&$('account-import').checked){
        const data=guestProgress();
        if(Object.keys(data).length){
          try{await api('progress','PUT',{revision:result.revision,progress:data});}
          catch{
            try{localStorage.setItem('account-save:'+result.username,JSON.stringify({revision:result.revision,progress:data,pending:true}));}
            catch{status('Account created, but guest progress could not be imported.');return;}
          }
        }
      }
      location.reload();
    }catch(error){status(error.message||'Could not sign in.');}
    finally{buttons.forEach(button=>button.disabled=false);}
  });
  $('account-sync').addEventListener('click',async ()=>{
    if(conflict)return;
    if(pending){await flush();return;}
    try{
      const latest=await api('progress');
      if(pending){await flush();return;}
      if(latest.revision!==revision)location.reload();
      else status('Progress is up to date.');
    }catch(error){status(error.message);}
  });
  $('account-use-server').addEventListener('click',()=>{
    if(!confirm('Discard unsynced changes and load the server save?'))return;
    localStorage.removeItem('account-save:'+username);
    location.reload();
  });
  $('account-use-local').addEventListener('click',async ()=>{
    if(!confirm('Replace the server save with this browser’s version?'))return;
    try{
      revision=(await api('progress')).revision;
      showConflict(false);
      await flush();
    }catch(error){status(error.message);}
  });
  $('account-logout').addEventListener('click',async ()=>{
    try{
      await flush();
      if(pending){status('Sync your changes or resolve the save conflict before signing out.');return;}
      await api('logout','POST');
      location.reload();
    }catch(error){status(error.message);}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)void flush();});
  try{attach(await api('progress'));}
  catch(error){status(error.status===401?'Play as a guest or sign in to sync.':'Account server unavailable. Playing as a guest.');}
  launch();
})();
