const isLocal = ['127.0.0.1', 'localhost', '[::1]'].includes(location.hostname);
const requested = new URLSearchParams(location.search).get('mock');
export const mockMode = isLocal && requested && requested !== '0' ? requested : '';

export const isMockIP = ip => (/^(?:192\.0\.2|198\.51\.100|203\.0\.113)\.(?:0|[1-9]\d{0,2})$/.test(ip)
  && Number(ip.split('.').at(-1)) <= 255) || /^2001:db8:/i.test(ip);
