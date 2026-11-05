import { fixture, scenarios } from './mock-fixtures.js?v=1';

export function installMock(requested) {
  const scenario = Object.hasOwn(scenarios, requested) ? requested : 'clean';
  window.fetch = async (input, init = {}) => {
    const request = input instanceof Request ? input : null;
    const url = new URL(request ? request.url : input, location.href);
    const signal = init.signal === undefined ? request?.signal : init.signal;
    signal?.throwIfAborted();
    const body = init.body === undefined && request ? await request.clone().text() : init.body;
    const response = fixture(url, body, scenario);
    if (!response) {
      console.warn('[mock] 未匹配请求，已阻止联网：', url.href);
      throw new TypeError('Failed to fetch');
    }
    if (response.networkError) throw new TypeError('Failed to fetch');
    await new Promise((resolve, reject) => {
      let timer;
      const abort = () => { clearTimeout(timer); reject(signal.reason); };
      const finish = () => { signal?.removeEventListener('abort', abort); resolve(); };
      if (signal?.aborted) { reject(signal.reason); return; }
      signal?.addEventListener('abort', abort, { once: true });
      // A hanging source is released only by the caller's cancellation or deadline.
      if (!response.hang) timer = setTimeout(finish, response.delay ?? 80);
    });
    return new Response(typeof response.body === 'string' ? response.body : JSON.stringify(response.body), {
      status: response.status || 200,
      headers: { 'Content-Type': typeof response.body === 'string' ? 'text/plain; charset=utf-8' : 'application/json', ...response.headers },
    });
  };
  const banner = document.createElement('aside');
  banner.className = 'mock-banner card';
  banner.setAttribute('aria-label', '模拟模式');
  const title = document.createElement('strong');
  title.textContent = '模拟数据 / mock mode';
  const label = document.createElement('label');
  label.textContent = '场景 ';
  const select = document.createElement('select');
  for (const [name, text] of Object.entries(scenarios)) select.add(new Option(text, name, false, name === scenario));
  select.addEventListener('change', () => {
    const url = new URL(location.href);
    url.searchParams.set('mock', select.value);
    location.assign(url);
  });
  label.append(select);
  const note = document.createElement('span');
  note.textContent = '全部数据来自本地 fixture；WebRTC、验证码和 Chrome 插件查询已跳过。仅接受文档保留地址。';
  banner.append(title, label, note);
  document.getElementById('main').prepend(banner);
  return scenario;
}
