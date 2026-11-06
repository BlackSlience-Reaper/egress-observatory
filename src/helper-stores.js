/** Fill each URL after its store listing is published, then run browser-helper/pack.py to update the READMEs. */
export const HELPER_STORES = {
  chrome: null,
  edge: null,
  firefox: null,
  opera: null,
};
const LABELS = {chrome:'Chrome 网上应用店',edge:'Edge 加载项',firefox:'Firefox 附加组件',opera:'Opera 加载项'};

export function helperBrowser() {
  const brands = navigator.userAgentData?.brands?.map(item=>item.brand) || [];
  const ua = navigator.userAgent;
  if(brands.includes('Microsoft Edge') || /Edg\//.test(ua))return 'edge';
  if(/Firefox\//.test(ua))return 'firefox';
  if(brands.includes('Opera') || /OPR\//.test(ua))return 'opera';
  if(brands.some(brand=>['Chromium','Google Chrome','Brave','Vivaldi'].includes(brand)) || /Chrome\/|Chromium\//.test(ua))return 'chrome';
  return null;
}

/** The listing for this visitor's browser. Opera can install from the Chrome Web Store until it has its own. */
export function helperStore() {
  const browser = helperBrowser();
  const id = browser === 'opera' && !HELPER_STORES.opera ? 'chrome' : browser;
  const url = HELPER_STORES[id];
  return url ? {url,label:LABELS[id]} : null;
}
