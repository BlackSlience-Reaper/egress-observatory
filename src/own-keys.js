/**
 * Visitors' own API keys, for the providers that allow direct browser calls.
 * A key stays in this browser and goes only to its provider, never to the Egress API,
 * and it stays out of results, share links and exported reports.
 */
import { esc, text, bool, num } from './util.js';
import { mock } from './mock.js?v=1';

const STORE = 'egress-own-keys';
const KEY_FORMAT = /^[A-Za-z0-9_.:-]{8,200}$/;
const NO_FLAGS = () => ({ vpn: null, proxy: null, tor: null, relay: null, hosting: null, abuser: null, crawler: null, mobile: null, bogon: null });

function usage(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return null;
  if (/^(isp|fixed line isp|residential|cable\/dsl\/isp|dsl|res)$/.test(raw) || raw === 'isp/mob' || raw.includes('fixed line')) return raw.includes('mob') ? 'mobile' : 'residential';
  if (/(^mob$|mobile|wireless|cellular)/.test(raw)) return 'mobile';
  if (/(^dch$|data ?center|hosting|web hosting|transit|^cdn$|content delivery|^ses$|search engine|cloud)/.test(raw)) return 'hosting';
  if (/(^com$|^org$|business|commercial|corporate|organization|enterprise)/.test(raw)) return 'business';
  if (/(^edu$|^lib$|education|university|college|school|library|^edu)/.test(raw)) return 'education';
  if (/(^gov$|^mil$|government|military)/.test(raw)) return 'government';
  return null;
}

function ipinfoCurrent(data) {
  const geo = data.geo || {}; const as = data.as || {}; const anon = data.anonymous || {};
  const hosting = bool(data.is_hosting); const mobile = bool(data.is_mobile);
  // A residential-proxy hit is still a proxy; keep it separately so the page can name it.
  const resProxy = bool(anon.is_res_proxy);
  return {
    country: geo.country_code, region: text(geo.region), city: text(geo.city), lat: num(geo.latitude), lon: num(geo.longitude),
    timezone: text(geo.timezone), asn: as.asn, org: text(as.name), hostname: text(data.hostname),
    networkType: hosting === true ? 'hosting' : mobile === true ? 'mobile' : null,
    usageType: hosting === true ? 'hosting' : mobile === true ? 'mobile' : null, companyType: usage(data.company?.type || as.type),
    flags: {
      ...NO_FLAGS(), vpn: bool(anon.is_vpn), proxy: anon.is_proxy === true || resProxy === true ? true : bool(anon.is_proxy), tor: bool(anon.is_tor), relay: bool(anon.is_relay),
      hosting, mobile,
    },
    asnType: text(as.type), resProxy: resProxy === true, anycast: data.is_anycast === true, satellite: data.is_satellite === true,
  };
}

function ipinfoLegacy(data) {
  const [lat, lon] = String(data.loc || '').split(',').map(Number);
  const companyType = text(data.company?.type);
  const privacy = data.privacy || {};
  return {
    country: data.country, region: text(data.region), city: text(data.city), lat: Number.isFinite(lat) ? lat : null, lon: Number.isFinite(lon) ? lon : null,
    timezone: text(data.timezone), asn: data.asn?.asn || data.org, org: text(data.company?.name) || text(data.org)?.replace(/^AS\d+\s+/i, '') || null, hostname: text(data.hostname),
    networkType: { isp: 'isp', hosting: 'hosting', business: 'business', education: 'education' }[companyType] || null,
    usageType: privacy.hosting === true ? 'hosting' : null, companyType: usage(companyType || data.asn?.type),
    flags: { ...NO_FLAGS(), vpn: bool(privacy.vpn), proxy: bool(privacy.proxy), tor: bool(privacy.tor), relay: bool(privacy.relay), hosting: bool(privacy.hosting), bogon: bool(data.bogon) },
    asnType: text(data.asn?.type), privacyService: text(privacy.service), anycast: data.anycast === true,
  };
}

const q = encodeURIComponent;

/** Each provider lists the URLs to try in order and maps a successful response to the shape the Egress API returns. */
export const OWN_KEY_PROVIDERS = {
  ipinfo: {
    name: 'IPinfo', signup: 'https://ipinfo.io/',
    // Plans with the current API get its anonymity fields; other tokens fall back to the older endpoint.
    urls: (ip, key) => [`https://api.ipinfo.io/lookup/${q(ip)}?token=${q(key)}`, `https://ipinfo.io/${q(ip)}/json?token=${q(key)}`],
    fields: data => (data.geo || data.as || data.anonymous ? ipinfoCurrent(data) : ipinfoLegacy(data)),
  },
  ipregistry: {
    name: 'IPRegistry', signup: 'https://ipregistry.co/',
    urls: (ip, key) => [`https://api.ipregistry.co/${q(ip)}?key=${q(key)}&fields=ip,connection,company,location.country.code,location.region.name,location.city,location.latitude,location.longitude,time_zone.id,security`],
    fields(data) {
      const sec = data.security || {};
      const usageType = usage(data.connection?.type);
      return {
        country: data.location?.country?.code, region: text(data.location?.region?.name), city: text(data.location?.city),
        lat: num(data.location?.latitude), lon: num(data.location?.longitude), timezone: text(data.time_zone?.id),
        asn: data.connection?.asn, org: text(data.connection?.organization) || text(data.company?.name),
        networkType: usageType === 'residential' ? 'isp' : usageType, usageType, companyType: usage(data.company?.type),
        flags: {
          ...NO_FLAGS(), vpn: bool(sec.is_vpn), proxy: bool(sec.is_proxy), tor: sec.is_tor === true || sec.is_tor_exit === true ? true : bool(sec.is_tor), relay: bool(sec.is_relay),
          hosting: sec.is_cloud_provider === true || usageType === 'hosting' ? true : null, abuser: sec.is_abuser === true || sec.is_attacker === true || sec.is_threat === true ? true : bool(sec.is_abuser),
          mobile: usageType === 'mobile' ? true : null, bogon: bool(sec.is_bogon),
        },
      };
    },
  },
  ipdata: {
    name: 'IPData', signup: 'https://ipdata.co/',
    urls: (ip, key) => [`https://api.ipdata.co/${q(ip)}?api-key=${q(key)}`],
    fields(data) {
      const threat = data.threat || {};
      const scores = threat.scores || {};
      return {
        country: data.country_code, region: text(data.region), city: text(data.city), lat: num(data.latitude), lon: num(data.longitude),
        timezone: text(data.time_zone?.name), asn: data.asn?.asn, org: text(data.asn?.name) || text(data.company?.name),
        networkType: threat.is_datacenter === true ? 'hosting' : null, usageType: threat.is_datacenter === true ? 'hosting' : null,
        companyType: usage(data.company?.type || data.asn?.type), risk: num(scores.threat_score),
        flags: {
          ...NO_FLAGS(), vpn: typeof scores.vpn_score === 'number' ? scores.vpn_score >= 70 : null, proxy: bool(threat.is_proxy), tor: bool(threat.is_tor), relay: bool(threat.is_icloud_relay),
          hosting: bool(threat.is_datacenter), abuser: threat.is_known_attacker === true || threat.is_known_abuser === true ? true : (threat.is_known_attacker === false && threat.is_known_abuser === false ? false : null),
          bogon: bool(threat.is_bogon),
        },
      };
    },
  },
  vpnapi: {
    name: 'vpnapi.io', signup: 'https://vpnapi.io/',
    urls: (ip, key) => [`https://vpnapi.io/api/${q(ip)}?key=${q(key)}`],
    fields(data) {
      const sec = data.security || {};
      return {
        country: data.location?.country_code, city: text(data.location?.city), asn: data.network?.autonomous_system_number, org: text(data.network?.autonomous_system_organization),
        flags: { ...NO_FLAGS(), vpn: bool(sec.vpn), proxy: bool(sec.proxy), tor: bool(sec.tor), relay: bool(sec.relay) },
      };
    },
  },
  ipapiis: {
    name: 'ipapi.is', signup: 'https://ipapi.is/',
    urls: (ip, key) => [`https://api.ipapi.is/?q=${q(ip)}&key=${q(key)}`],
    fields(data) {
      const company = data.company && typeof data.company === 'object' ? data.company : {};
      const as = data.asn && typeof data.asn === 'object' ? data.asn : {};
      const loc = data.location || {};
      const companyType = usage(company.type);
      const scoreOf = value => ({ 'very low': 3, low: 10, elevated: 40, high: 70, 'very high': 90 })[String(/\(([^)]+)\)/.exec(String(value || ''))?.[1] || '').toLowerCase()] ?? null;
      return {
        country: loc.country_code || data.country, region: text(loc.state || data.region), city: text(loc.city || data.city), lat: num(loc.latitude ?? data.lat), lon: num(loc.longitude ?? data.lon),
        timezone: text(loc.timezone || data.timezone), asn: as.asn ?? (typeof data.asn === 'object' ? null : data.asn), org: text(company.name) || text(as.org) || text(data.company),
        networkType: companyType === 'residential' ? 'isp' : companyType, companyType,
        usageType: data.is_datacenter === true ? 'hosting' : data.is_mobile === true ? 'mobile' : null, asnType: text(as.type), risk: scoreOf(company.abuser_score),
        flags: { ...NO_FLAGS(), vpn: bool(data.is_vpn), proxy: bool(data.is_proxy), tor: bool(data.is_tor), hosting: bool(data.is_datacenter), abuser: bool(data.is_abuser), crawler: bool(data.is_crawler), mobile: bool(data.is_mobile), bogon: bool(data.is_bogon) },
      };
    },
  },
};

// Storage access throws in private modes and outside browsers, so a missing store simply means no keys.
const read = name => {
  try { const value = JSON.parse(globalThis[name].getItem(STORE)); return value && typeof value === 'object' ? value : {}; } catch { return {}; }
};
const write = (name, keys) => {
  try { if (Object.keys(keys).length) globalThis[name].setItem(STORE, JSON.stringify(keys)); else globalThis[name].removeItem(STORE); } catch { /* Storage disabled: the key cannot be kept. */ }
};
const allKeys = () => ({ ...read('localStorage'), ...read('sessionStorage') });

export function keyFor(id) {
  // Mock mode answers from fixtures: a real key has no fixture, and its URL would end up in the console warning.
  if (mock) return null;
  const key = allKeys()[id];
  return OWN_KEY_PROVIDERS[id] && typeof key === 'string' && KEY_FORMAT.test(key) ? key : null;
}

/** Tries the provider's URLs in order; a rate limit or a network failure ends the attempt, a refusal tries the next URL. */
export async function ownKeyResponse(id, key, ip, get, matches) {
  let result = null;
  for (const url of OWN_KEY_PROVIDERS[id].urls(ip, key)) {
    result = await get(url);
    if (result.ok && matches(result.data)) break;
    if (!result.ok && (result.status === 0 || result.status === 429)) break;
  }
  return result;
}

export function setupOwnKeys(onChange) {
  if (mock) { document.getElementById('own-keys')?.remove(); return; }
  const form = document.getElementById('own-key-form');
  const fields = document.getElementById('own-key-fields');
  const remember = document.getElementById('own-key-remember');
  const status = document.getElementById('own-key-status');
  if (!form || !fields || !remember || !status) return;
  // Inputs are drawn empty: a saved key is never written back into the page.
  const draw = () => {
    fields.innerHTML = Object.entries(OWN_KEY_PROVIDERS).map(([id, provider]) => `<div class="own-key">
      <label for="own-key-${esc(id)}">${esc(provider.name)}</label>
      <input id="own-key-${esc(id)}" type="password" data-own-key="${esc(id)}" autocomplete="off" spellcheck="false" placeholder="${keyFor(id) ? '已保存（不显示）' : '未填写'}">
      <a href="${esc(provider.signup)}" target="_blank" rel="noopener noreferrer">获取 key ↗</a>
    </div>`).join('');
    remember.checked = Object.keys(read('localStorage')).length > 0;
  };
  draw();
  form.addEventListener('submit', event => {
    event.preventDefault();
    const keys = allKeys();
    for (const input of fields.querySelectorAll('[data-own-key]')) {
      const value = input.value.trim();
      if (!value) continue;
      if (!KEY_FORMAT.test(value)) { status.textContent = `${OWN_KEY_PROVIDERS[input.dataset.ownKey].name} 的 key 格式不正确，没有保存。`; return; }
      keys[input.dataset.ownKey] = value;
    }
    write(remember.checked ? 'localStorage' : 'sessionStorage', keys);
    write(remember.checked ? 'sessionStorage' : 'localStorage', {});
    const count = Object.keys(OWN_KEY_PROVIDERS).filter(keyFor).length;
    draw();
    status.textContent = `已启用 ${count} 个 key，${remember.checked ? '保存在这个浏览器' : '关闭标签页后清除'}。`;
    onChange();
  });
  document.getElementById('own-key-clear')?.addEventListener('click', () => {
    write('localStorage', {}); write('sessionStorage', {});
    draw();
    status.textContent = '已清除所有 key。';
    onChange();
  });
}
