(() => {
  const version = chrome.runtime.getManifest().version;
  const requests = new Set();
  const publish = data => window.postMessage({channel:'egress-browser-helper',...data},location.origin);
  // After the extension reloads or updates, Chrome leaves this script in open tabs but cuts it off: runtime calls
  // then throw instead of rejecting, and the new version's script only arrives when the page reloads.
  const STALE = '插件已重新加载或更新，请刷新本页';
  const live = () => Boolean(chrome.runtime?.id);
  const send = message => { try { return chrome.runtime.sendMessage(message); } catch (error) { return Promise.reject(error); } };
  const drop = () => { for (const requestId of requests) publish({kind:'error',requestId,error:STALE}); requests.clear(); };
  window.addEventListener('message', event => {
    if (event.source !== window || event.origin !== location.origin || event.data?.channel !== 'egress-browser-client') return;
    const {kind,requestId,ip,provider,skip,only} = event.data;
    if (!live()) { if (['discover','lookup'].includes(kind) && typeof requestId === 'string') publish({kind:'error',requestId,error:STALE}); drop(); return; }
    if (kind === 'discover') return publish({kind:'ready',requestId,version});
    if (kind === 'cancel') { send({kind,requestId}).catch(()=>{}); return; }
    if (kind === 'focus' && typeof requestId === 'string' && typeof provider === 'string') { send({kind,requestId,provider}).catch(()=>{}); return; }
    if (kind !== 'lookup' || typeof requestId !== 'string' || typeof ip !== 'string') return;
    requests.add(requestId);
    send({kind,requestId,ip,skip,only}).then(report => {if(!report?.started){requests.delete(requestId);publish({kind:'report',requestId,report});}}).catch(()=>{requests.delete(requestId);publish({kind:'error',requestId,error:live() ? '插件连接中断，请重新加载扩展并刷新页面' : STALE});});
  });
  // Each source as soon as it answers, and pages waiting on a human check.
  chrome.runtime.onMessage.addListener(message => {
    if (message?.channel === 'egress-browser-partial' && typeof message.requestId === 'string') publish({kind:'partial',requestId:message.requestId,report:message.report});
    if (message?.channel === 'egress-browser-complete' && typeof message.requestId === 'string') {requests.delete(message.requestId);publish({kind:'report',requestId:message.requestId,report:message.report});}
  });
  // A query running when the extension goes away would otherwise wait on its manual checks forever.
  setInterval(() => { if (requests.size && !live()) drop(); }, 2000);
  publish({kind:'ready',version});
  window.addEventListener('pagehide',()=>{if(live())for(const requestId of requests)send({kind:'cancel',requestId}).catch(()=>{});});
})();
