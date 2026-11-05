import { API_BASE, PAGE_LOOKUP_BASE } from '../config.js?v=cloud2';
import { PAGE_PROVIDERS } from './page-providers.js?v=1';
import { EGRESS_ENDPOINTS } from './probes.js?v=1';
import { isMockIP } from './mock-mode.js?v=1';

export const scenarios = { clean: '干净家宽', proxy: '机房加代理', partial: '部分来源失败', 'rate-limit': '限流（429）', timeout: '来源超时' };
const V4 = '203.0.113.10';
const V6 = '2001:db8::10';
const routes = ['proxycheck','ipapi','ip2location','dbip','abuseipdb','ipqs','ipregistry','ipdata','ipapiis','ipinfo',
  'greynoise','crowdsec','virustotal','scamalytics','vpnapi','iphub','getipintel','radar'];
const api = new URL(API_BASE).origin;
const lookups = new Set([api, location.origin, ...(PAGE_LOOKUP_BASE ? [new URL(PAGE_LOOKUP_BASE).origin] : [])]);
const traceHosts = new Set(EGRESS_ENDPOINTS.filter(endpoint => ['cloudflare','one'].includes(endpoint.id)).map(endpoint => new URL(endpoint.url).hostname));
const response = body => ({ body });
const failure = (status, error) => ({ status, body: { error, errorCode: status === 429 ? 'caller-rate-limit' : 'mock-source-failure' }, headers: status === 429 ? { 'Retry-After': '1' } : {} });

function problem(id, scenario) {
  if (scenario === 'partial' && ['ipqs','ipapico'].includes(id)) return failure(503, '来源暂时不可用（模拟模式）');
  if (scenario === 'partial' && id === 'ipwhois') return { networkError: true };
  if (scenario === 'rate-limit' && ['ipqs','ipapiis','iplocate','ipok','sources'].includes(id)) return failure(429, '限流（模拟模式）');
  if (scenario === 'timeout' && ['ipqs','ipwhois'].includes(id)) return { hang: true };
  return null;
}

function profile(ip, scenario) {
  const proxy = scenario === 'proxy';
  return {
    ip, country: 'JP', city: '模拟城市', region: '模拟地区', lat: 35.68, lon: 139.76, timezone: 'Asia/Tokyo',
    asn: proxy ? 64497 : 64496, org: proxy ? 'Example Datacenter' : 'Example Broadband',
    hostname: proxy ? 'proxy.hosting.example' : 'customer.ftth.example',
    usageType: proxy ? 'hosting' : 'residential', companyType: proxy ? 'hosting' : 'residential', asnType: proxy ? 'hosting' : 'isp',
    risk: proxy ? 78 : 0,
    flags: { vpn: proxy, proxy, hosting: proxy, tor: false, relay: false, abuser: false, crawler: false, mobile: false, bogon: false },
  };
}

function pageReport(provider, p, scenario) {
  const time = Date.now();
  const ids = Object.keys(PAGE_PROVIDERS).filter(id => id !== 'ipsuper');
  if (provider === 'sources') return { ip: p.ip, time, sources: Object.fromEntries(ids.map(id => {
    const failed = problem(id, scenario);
    return [id, failed ? { status: 'error', error: failed.hang ? '来源超时（模拟模式）' : failed.body?.error || '来源连接失败（模拟模式）' }
      : { status: 'ok', time, ms: 80, data: { ...p, tz: p.timezone, flags: { ...p.flags } } }];
  })) };
  if (provider === 'ipinfo') return { ip: p.ip, time, text: `${p.ip}\nSummary\nCompany ${p.org}\nASN AS${p.asn} - ${p.org}\nAS Type ${p.asnType}\nCompany Type ${p.companyType}\nUsage Type ${p.usageType}\nCity ${p.city}\nLocation Japan JP\nTimezone ${p.timezone}\nAnonymization\n${['VPN','Proxy','Tor','Relay','Hosting'].map((label, i) => `${label} ${p.flags[['vpn','proxy','tor','relay','hosting'][i]] ? 'Detected' : 'Not detected'}`).join('\n')}\nResidential Proxy Not detected` };
  if (provider === 'ipsuper') {
    const names = { ipinfo:'IPinfo', ip2location:'IP2Location', ipregistry:'IPRegistry', ipapi:'IP-API', ipdata:'IPData', abuseipdb:'AbuseIPDB', dbip:'DBIP', proxycheck:'Proxycheck', ipqs:'IPQualityScore', ipapiis:'ipapi.is', iplocate:'IPLocate', geoiplookup:'GeoIPLookup', iphub:'IPHub', ipquery:'IPQuery', blackbox:'Blackbox v3 beta', scamalytics:'Scamalytics' };
    const entries = Object.entries(names).filter(([id]) => !problem(id, scenario));
    const type = p.usageType === 'hosting' ? '机房' : '家宽';
    return { ip: p.ip, time, headers: entries.map(([, name]) => name), rows: { '使用类型': entries.map(() => type), '公司类型': entries.map(() => type) },
      riskFlags: Object.fromEntries(entries.map(([, name]) => [name, { ...p.flags }])), riskPercent: Object.fromEntries(entries.map(([, name]) => [name, p.risk])) };
  }
  if (provider === 'getipintel') return { ip: p.ip, probability: p.flags.proxy ? 0.95 : 0.01, risk: p.risk };
  return null;
}

/** Hand-written provider shapes; all addresses and prefixes are documentation ranges. */
export function fixture(url, body, scenario) {
  let posted;
  try { posted = JSON.parse(body || '{}').ip; } catch { /* GET or a non-JSON body. */ }
  const path = decodeURIComponent(url.pathname);
  const candidate = posted || url.searchParams.get('ip') || url.searchParams.get('q') || url.searchParams.get('resource')
    || path.match(/(?:192\.0\.2|198\.51\.100|203\.0\.113)\.\d{1,3}|2001:db8:[a-f\d:]*/i)?.[0];
  const ip = candidate && isMockIP(candidate) ? candidate : V4;
  const p = profile(ip, scenario);
  const prefix = ip.includes(':') ? '2001:db8::/32' : ip.split('.').slice(0, 3).join('.') + '.0/24';
  const space = ['203.0.113.0/24', '198.51.100.0/24'];
  const host = url.hostname;
  const geo = { country_code: p.country, country: p.country, state: p.region, region: p.region, city: p.city, latitude: p.lat, longitude: p.lon, timezone: p.timezone };
  const trace = `ip=${V4}\nloc=JP\ncolo=NRT\nwarp=off\ngateway=off\nhttp=http/2\ntls=TLSv1.3\n`;

  if (url.origin === api) {
    if (path === '/health') return response({ service: 'egress-observatory-api', routes, seen: true });
    const route = path.match(/^\/v1\/([a-z]+)$/)?.[1];
    if (route === 'seen') return response({ status: 'success', ip, callerKnown: true, sharers: 3, lookers: 5, lookups: 12, windowDays: 30 });
    if (route === 'radar') return response({ bot: p.flags.proxy ? 0.82 : 0.16, human: p.flags.proxy ? 0.18 : 0.84, window: '28d' });
    if (routes.includes(route)) return problem(route, scenario) || response({ status: 'success', ...p,
      reports: 0, lastReported: null, noise: false, riot: false, classification: 'benign', block: p.flags.proxy ? 1 : 0,
      probability: p.flags.proxy ? 0.95 : 0.01, vtMalicious: 0, vtSuspicious: 0, vtReputation: 0,
      ...(route === 'abuseipdb' ? { risk: 0 } : {}),
    });
  }
  const page = path.match(/^\/(?:v1\/page|lookup)\/(ipinfo|ipsuper|sources|getipintel)$/)?.[1];
  if (lookups.has(url.origin) && page) return problem(page, scenario) || response(pageReport(page, p, scenario));

  if (['api4.ipify.org','api6.ipify.org'].includes(host) && path === '/') return response({ ip: host.startsWith('api6') ? V6 : V4 });
  if (traceHosts.has(host) && path === '/cdn-cgi/trace') return response(trace);
  if (host === 'api.ip.sb' && path === '/ip') return response(V4);
  if (host === 'ipinfo.io' && path === '/json') return response({ ip: V4 });
  if (host === 'myip.ipip.net' && path === '/json') return response({ data: { ip: V4 } });
  if (['ipv4-check-perf.radar.cloudflare.com','ipv6-check-perf.radar.cloudflare.com'].includes(host)) return response({ ...geo, ip_address: host.startsWith('ipv6') ? V6 : V4, asn: p.asn, colo: 'NRT' });

  if (host === 'stat.ripe.net' && /^\/data\/[^/]+\/data.json$/.test(path)) {
    const data = {
      'maxmind-geo-lite': { located_resources: [{ locations: [{ country: p.country, city: p.city, latitude: p.lat, longitude: p.lon }] }] },
      'rir-stats-country': { located_resources: [{ location: p.country, resource: prefix }] },
      'prefix-overview': { announced: true, resource: prefix, asns: [{ asn: p.asn, holder: p.org }] },
      'as-overview': { holder: p.org },
      'routing-status': { announced_space: { v4: { ips: 512, prefixes: 2 }, v6: { prefixes: 1 } }, visibility: { v4: { ris_peers_seeing: 150 } } },
      'rpki-validation': { status: 'valid' },
      'announced-prefixes': { prefixes: space.map(prefix => ({ prefix })) },
    }[path.split('/')[2]];
    return data ? response({ data }) : null;
  }
  if (host === 'rdap.org' && path.startsWith('/ip/')) return response({ country: p.country, name: p.org, handle: 'EXAMPLE-NET', type: 'ALLOCATED PA',
    startAddress: ip.includes(':') ? '2001:db8::' : prefix.split('/')[0], endAddress: ip.includes(':') ? '2001:db8::ffff' : prefix.split('.').slice(0, 3).join('.') + '.255',
    cidr0_cidrs: [ip.includes(':') ? { v6prefix: '2001:db8::', length: 32 } : { v4prefix: prefix.split('/')[0], length: 24 }],
    events: [{ eventAction: 'registration', eventDate: '2000-01-01T00:00:00Z' }], entities: [{ roles: ['registrant'], vcardArray: ['vcard', [['kind', {}, 'text', 'org'], ['fn', {}, 'text', p.org]]] }] });
  if (host === 'rdap.org' && path.startsWith('/autnum/')) return response({ country: p.country, name: p.org, events: [{ eventAction: 'registration', eventDate: '2000-01-01T00:00:00Z' }] });
  if (host === 'www.peeringdb.com' && path === '/api/net') return response({ data: [{ name: p.org, info_type: p.flags.hosting ? 'Content' : 'Cable/DSL/ISP', info_scope: 'Regional', info_ratio: p.flags.hosting ? 'Heavy Outbound' : 'Heavy Inbound', website: 'https://example.com' }] });
  if (host === 'ip.guide') return response(/^\/AS\d+$/.test(path) ? { routes: { v4: space, v6: ['2001:db8::/32'] } }
    : { ip, network: { cidr: prefix, autonomous_system: { asn: p.asn, name: p.org, organization: p.org, country: p.country, rir: 'apnic' } }, location: geo });

  if (host === 'ip.net.coffee' && path.startsWith('/api/ip/lookup/')) return response({ ip, company_type: p.asnType, is_datacenter: p.flags.hosting, isResidential: !p.flags.hosting, is_mobile: false, geo_sources: [{ src: 'mock', country_code: p.country, city: p.city }] });
  if (host === 'api.ipquery.io') return response({ ip, location: geo, isp: { asn: p.asn, org: p.org }, risk: { is_vpn: p.flags.vpn, is_proxy: p.flags.proxy, is_tor: false, is_datacenter: p.flags.hosting, is_mobile: false, risk_score: p.risk } });
  if (host === 'api.ipapi.is') return problem('ipapiis', scenario) || response({ ip, location: geo, company: { name: p.org, type: p.asnType }, asn: { asn: p.asn, type: p.asnType }, is_bogon: false, is_datacenter: p.flags.hosting, is_proxy: p.flags.proxy, is_vpn: p.flags.vpn, is_tor: false, is_mobile: false, is_crawler: false, is_abuser: false });
  if (host === 'ipinfo.io' && path.endsWith('/json')) return response({ ip, country: p.country, region: p.region, city: p.city, loc: `${p.lat},${p.lon}`, timezone: p.timezone, org: `AS${p.asn} ${p.org}`, hostname: p.hostname });
  if (host === 'ipwho.is') return problem('ipwhois', scenario) || response({ ip, success: true, ...geo, timezone: { id: p.timezone }, connection: { asn: p.asn, org: p.org, isp: p.org, domain: 'example.com' } });
  if (host === 'api.ip.sb' && path.startsWith('/geoip/')) return response({ ip, ...geo, asn: p.asn, isp: p.org });
  if (host === 'ipleak.net' && path.startsWith('/json/')) return response({ ip, country_code: p.country, region_name: p.region, city_name: p.city, latitude: p.lat, longitude: p.lon, time_zone: p.timezone, as_number: p.asn, isp_name: p.org, registered_country_code: p.country, reverse: p.hostname, as_network: prefix });
  if (host === 'get.geojs.io' && path.startsWith('/v1/ip/geo/')) return response({ ip, ...geo, asn: p.asn, organization_name: p.org });
  if (host === 'ipapi.co') return problem('ipapico', scenario) || response({ ip, ...geo, asn: `AS${p.asn}`, org: p.org, network: prefix });
  if (host === 'api.iplocation.net') return response({ ip, response_code: '200', country_code2: p.country, isp: p.org });
  if (host === 'free.freeipapi.com' && path.startsWith('/api/v1/json/')) return response({ ipAddress: ip, countryCode: p.country, regionName: p.region, cityName: p.city, latitude: p.lat, longitude: p.lon, timeZones: [p.timezone], asn: p.asn, asnOrganization: p.org, isProxy: p.flags.proxy });
  if (host === 'www.iplocate.io' && path.startsWith('/api/lookup/')) return problem('iplocate', scenario) || response({ ip, ...geo, subdivision: p.region, time_zone: p.timezone, asn: { asn: p.asn, name: p.org, type: p.asnType }, company: { name: p.org, type: p.asnType }, privacy: { is_vpn: p.flags.vpn, is_proxy: p.flags.proxy, is_hosting: p.flags.hosting, is_tor: false, is_abuser: false, is_bogon: false, is_icloud_relay: false } });
  if (host === 'json.geoiplookup.io') return response({ ip, success: true, ...geo, timezone_name: p.timezone, asn_number: p.asn, org: p.org, hostname: p.hostname, connection_type: p.flags.hosting ? 'Hosting' : 'Cable/DSL' });
  if (host === 'api.techniknews.net' && path.startsWith('/ipgeo/')) return response({ status: 'success', ip, countryCode: p.country, regionName: p.region, city: p.city, lat: p.lat, lon: p.lon, timezone: p.timezone, as: `AS${p.asn}`, org: p.org, reverse: p.hostname, proxy: p.flags.proxy, hosting: p.flags.hosting, mobile: false });
  if (host === 'blackbox.ipinfo.app' && path.startsWith('/api/v3beta/')) return response({ ip, classification: p.usageType, confidence: 0.95, version: 'mock', asn: { number: p.asn, name: p.org, network: prefix.split('/')[0], cidr: Number(prefix.split('/')[1]) }, rdns: { hostname: p.hostname }, signals: { proxy: p.flags.proxy, tor: false, bogon: false, vpnasn: p.flags.vpn, goodvpn: false, hosting: p.flags.hosting, cloud: p.flags.hosting, mobileasn: false, spamhaus: false, sfs_listed: false, ic3_listed: false } });
  if (host === 'atlas.ipinfo.app' && path.startsWith('/api/v2/')) return response({ ip, as_number: p.asn, as_description: p.org, cidr: prefix, country_code: p.country, version: 'mock', location: { ...geo, source: 'baseline', confidence: 'high' }, evidence: [{ source: 'baseline', detail: 'DB-IP City Lite', ...geo }] });

  if (host === 'otx.alienvault.com' && path.startsWith('/api/v1/indicators/')) return response({ pulse_info: { count: 0, pulses: [] }, validation: [], false_positive: [] });
  if (host === 'internetdb.shodan.io') return response({ ip, ports: p.flags.proxy ? [443, 8080, 1080] : [], tags: p.flags.proxy ? ['proxy','cloud'] : [], vulns: [], hostnames: [p.hostname] });
  if (host === 'api.stopforumspam.org' && path === '/api') return response({ success: 1, ip: { appears: 0, frequency: 0, confidence: 0 } });
  if (host === 'onionoo.torproject.org' && path === '/details') return response({ relays: [] });
  if (['dns.google','cloudflare-dns.com'].includes(host) && ['/resolve','/dns-query'].includes(path)) return response(url.searchParams.get('type') === 'PTR'
    ? { Status: 0, Answer: [{ type: 12, data: p.hostname + '.' }] } : { Status: 3 });
  if (host === 'raw.githubusercontent.com') {
    const known = /^\/firehol\/blocklist-ipsets\/master\/(firehol_level[123]\.netset|(?:blocklist_de|greensnow|cybercrime|stopforumspam_7d|et_compromised|ciarmy|botscout_7d|socks_proxy_7d|sslproxies_7d|tor_exits)\.ipset|dshield_7d\.netset)$/.test(path)
      || path === '/stamparm/ipsum/master/levels/3.txt' || /^\/X4BNet\/lists_vpn\/main\/output\/(datacenter|vpn)\/ipv4.txt$/.test(path);
    if (!known) return null;
    const typeList = /\/(datacenter|vpn)\/|socks_proxy|sslproxies/.test(path);
    return response(p.flags.proxy && typeList ? space.join('\n') + '\n' : '192.0.2.200/32\n');
  }
  if (host === 'ipok.io' && path === '/api/ip') return problem('ipok', scenario) || response({ geo: { ip }, sources: ['ipqs','scamalytics','iphub','vpnapi'].filter(id => !problem(id, scenario)).map(id => ({ source: { ipqs:'IPQS', scamalytics:'Scamalytics', iphub:'IPHub', vpnapi:'vpnapi.io' }[id], ok: true, observedAt: Date.now(), flags: { ...p.flags }, risk: p.risk, usageType: p.usageType, companyType: p.companyType })) });

  if (/^\d+\.[a-f\d]+\.bash\.ws$/.test(host)) return response('mock DNS trigger');
  if (host === 'bash.ws' && /^\/dnsleak\/test\/[a-f\d]+$/.test(path)) return response([{ type: 'dns', ip: '198.51.100.53', country: p.country, asn: p.asn, org: p.org }]);
  if (host.endsWith('.edns.ip-api.com') && path === '/json') return response({ dns: { ip: '198.51.100.53', geo: 'JP - Example DNS' } });
  if (host === 'tcpip.incolumitas.com' && path === '/classify') return response({ lookup_ip: V4, avg_score_os_class: { Windows: 0.96, Linux: 0.04 }, relay: { ua_os: 'Windows', flagged: p.flags.proxy, probability: p.flags.proxy ? 0.95 : 0.01 }, os_mismatch: false, perfect_score: true });
  return null;
}
