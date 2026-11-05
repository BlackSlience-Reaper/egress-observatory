/** Fill each URL after its store listing is published. */
export const HELPER_STORES = {chrome:null,edge:null,firefox:null};

export function helperStore() {
  const brands = navigator.userAgentData?.brands?.map(item=>item.brand) || [];
  const ua = navigator.userAgent;
  let browser;
  if(brands.includes('Microsoft Edge') || /Edg\//.test(ua))browser='edge';
  else if(/Firefox\//.test(ua))browser='firefox';
  else if(brands.some(brand=>['Chromium','Google Chrome','Brave','Opera','Vivaldi'].includes(brand)) || /Chrome\/|Chromium\//.test(ua))browser='chrome';
  const url = HELPER_STORES[browser];
  return url ? {url,label:({edge:'Edge 加载项',chrome:'Chrome 网上应用店',firefox:'Firefox 附加组件'})[browser]} : null;
}
