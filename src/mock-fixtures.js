/**
 * Hand-written answers for the local ?mock=1 mode, loaded only through mock.js. install() replaces window.fetch, so no
 * data request leaves the browser. Everything is made up: documentation addresses (RFC 5737, RFC 3849), documentation
 * AS numbers (RFC 5398) and .example domains. A request with no fixture gets a 404 and a console warning.
 */
import { API_BASE } from '../config.js';
import { cidrContains, zoneOffset } from './util.js';

const DOCUMENTATION = ['192.0.2.0/24', '198.51.100.0/24', '203.0.113.0/24', '2001:db8::/32'];
const accepts = ip => DOCUMENTATION.some(range => cidrContains(range, ip));
const daysAgo = days => new Date(Date.now() - days * 864e5).toISOString();
const prefixOf = ip => ip.includes(':') ? '2001:db8::/32' : ip.replace(/\.\d+$/, '.0/24');

// ---------- networks ----------

const HOME = {
  country: 'US', region: 'California', city: 'San Jose', lat: 37.34, lon: -121.89, tz: 'America/Los_Angeles', colo: 'SJC',
  asn: 64500, asName: 'EXAMPLE-BROADBAND', org: 'Example Broadband', domain: 'broadband.example', rir: 'ARIN', whois: 'whois.arin.net', registered: '2004-03-15T00:00:00Z',
  usage: 'residential', company: 'residential', asnType: 'isp', connection: 'Cable/DSL', peering: 'Cable/DSL/ISP', v4ips: 2097152,
  risk: 4, botShare: 0.06, seen: { sharers: 1, lookers: 2, lookups: 5 },
  flags: { vpn: false, proxy: false, tor: false, hosting: false, relay: false, abuser: false, crawler: false, mobile: false, bogon: false },
  hostname: ip => `cpe-${ip.replace(/[.:]/g, '-')}.dyn.broadband.example`,
  extras: {
    proxycheck: { devices: { address: 1, subnet: 30 } },
    abuseipdb: { risk: 0, reports: 0 },
    ipqs: { risk: 6, connectionType: 'Residential', abuseVelocity: 'none', activeVpn: false, activeTor: false },
    ipinfo: { asnType: 'isp', anycast: false, resProxy: false, satellite: false },
    greynoise: { noise: false, riot: false, classification: 'unseen' },
    crowdsec: { reputation: 'unknown', behaviors: [] },
    virustotal: { vtMalicious: 0, vtSuspicious: 0, vtReputation: 0 },
    scamalytics: { risk: 8, riskLabel: 'low' },
    getipintel: { probability: 0.01, risk: 1 },
  },
  otx: [], sfs: { appears: 0, frequency: 0 }, shodan: null, dnsbl: {}, lists: null,
  resolver: { ip: '192.0.2.53', country: 'US', asn: 'AS64500 Example Broadband', geo: 'US - Example Broadband' },
  tcp: { avg_score_os_class: { Windows: 0.93, Linux: 0.21 }, perfect_score: 0.93, os_mismatch: false, relay: { ua_os: 'Windows', flagged: false, probability: 0.02 } },
  browser: { zone: 'America/Los_Angeles', languages: ['en-US', 'en'] },
};

const CLOUD = {
  country: 'DE', region: 'Hesse', city: 'Frankfurt am Main', lat: 50.11, lon: 8.68, tz: 'Europe/Berlin', colo: 'FRA',
  asn: 64510, asName: 'EXAMPLE-CLOUD', org: 'Example Cloud GmbH', domain: 'cloud.example', rir: 'RIPE', whois: 'whois.ripe.net', registered: '2021-06-01T00:00:00Z',
  usage: 'hosting', company: 'hosting', asnType: 'hosting', connection: 'Hosting', peering: 'Content', v4ips: 65536,
  risk: 82, botShare: 0.71, seen: { sharers: 37, lookers: 52, lookups: 140 },
  flags: { vpn: false, proxy: true, tor: false, hosting: true, relay: false, abuser: true, crawler: false, mobile: false, bogon: false },
  hostname: ip => `vps-${ip.replace(/[.:]/g, '-')}.cloud.example`,
  extras: {
    proxycheck: { devices: { address: 10, subnet: 1520 } },
    abuseipdb: { risk: 86, reports: 142, lastReported: daysAgo(2), block: { prefix: '198.51.100.0/24', reported: 18, maxScore: 100 } },
    ipqs: { risk: 90, connectionType: 'Data Center', abuseVelocity: 'high', activeVpn: false, activeTor: false },
    ipinfo: { asnType: 'hosting', anycast: false, resProxy: false, satellite: false },
    greynoise: { noise: true, riot: false, classification: 'malicious', name: 'unknown' },
    crowdsec: { reputation: 'malicious', behaviors: ['http:bruteforce', 'ssh:bruteforce'] },
    virustotal: { vtMalicious: 7, vtSuspicious: 2, vtReputation: -12 },
    scamalytics: { risk: 88, riskLabel: 'very high' },
    getipintel: { probability: 0.99, risk: 99 },
  },
  otx: ['Example scanner campaign', 'Example open proxy feed', 'Example brute force feed'],
  sfs: { appears: 12, frequency: 5, confidence: 62, lastseen: daysAgo(3) },
  shodan: { ports: [22, 443, 1080, 3128], tags: ['proxy', 'cloud'], vulns: [], hostnames: ['vps.cloud.example'] },
  dnsbl: { 'bl.spamcop.net': '127.0.0.2', 'dnsbl.dronebl.org': '127.0.0.9', 'rbl.interserver.net': '127.0.0.2' },
  lists: /blocklist_de|greensnow|socks_proxy|sslproxies|datacenter\/ipv4/,
  resolver: { ip: '198.51.100.53', country: 'CN', asn: 'AS64511 Example Resolver', geo: 'CN - Example Resolver' },
  tcp: { avg_score_os_class: { Linux: 0.91, Windows: 0.18 }, perfect_score: 0.91, os_mismatch: true, relay: { ua_os: 'Windows', flagged: true, probability: 0.93 } },
  browser: { zone: 'Asia/Shanghai', languages: ['zh-CN', 'zh'] },
};

// ---------- scenarios ----------
// Each has its own address because answers are cached in localStorage per IP. A fault is an HTTP status, 'network'
// (the browser gets no response), 'html' (200 but not JSON) or 'hang' (no answer until the caller's own timeout).

const SCENARIOS = {
  clean: { label: '干净家宽', ip: '203.0.113.10', net: HOME },
  datacenter: { label: '机房加代理', ip: '198.51.100.20', v6: '2001:db8::20', net: CLOUD },
  partial: {
    label: '部分来源失败', ip: '192.0.2.30', net: HOME,
    faults: [
      [/^https:\/\/ipapi\.co\//, 500], [/^https:\/\/ipwho\.is\//, 'network'], [/^https:\/\/api\.ipquery\.io\//, 'html'],
      [/^api:\/v1\/proxycheck/, 502], [/^api:\/v1\/ipqs/, 503], [/maxmind-geo-lite/, 503], [/otx\.alienvault\.com/, 'network'],
      [/greensnow/, 404], [/uceprotect/, 'network'], [/peeringdb\.com/, 'network'], [/(?:\/v1\/page|:4188\/lookup)\/ipsuper/, 503],
    ],
  },
  ratelimit: {
    label: '限流（429）', ip: '203.0.113.40', net: HOME,
    // The local lookup service is down here too, so page lookups reach the rate-limited API route.
    faults: [[/^api:\/v1\//, 429], [/:4188\/lookup\//, 'network'], [/^https:\/\/(?:ipapi\.co|ipwho\.is|www\.iplocate\.io|ipok\.io|api\.ipquery\.io|ipinfo\.io)\//, 429]],
  },
  timeout: {
    label: '来源超时', ip: '203.0.113.50', net: HOME,
    faults: [[/^api:\/v1\/(?:ip2location|dbip)/, 'hang'], [/^https:\/\/(?:ipleak\.net|rdap\.org\/ip|ip\.guide\/\d|get\.geojs\.io|myip\.ipip\.net)/, 'hang'], [/bl\.spamcop\.net/, 'hang']],
  },
};

// ---------- answers, in the shape each upstream returns ----------

const JSON_HEADERS = { 'Content-Type': 'application/json' };
const status = (code, body, headers = {}) => new Response(JSON.stringify(body), { status: code, headers: { ...JSON_HEADERS, ...headers } });

function routes({ ip: self, v6, net }) {
  const { flags: f } = net;
  const worker = (route, ip) => ({
    status: 'success', ip, country: net.country, region: net.region, city: net.city, lat: net.lat, lon: net.lon, asn: net.asn, org: net.org, timezone: net.tz,
    hostname: net.hostname(ip), usageType: net.usage, companyType: net.company, flags: f, risk: net.risk, ...net.extras[route],
  });
  const ipinfoText = ip => [
    ip, 'Summary', `ASN AS${net.asn} — ${net.org}`, `Company ${net.org}`, `AS Type ${net.asnType}`, `Company Type ${net.company}`, `Usage Type ${net.usage}`,
    `City ${net.city}`, `State ${net.region}`, `Location ${net.city}, ${net.region}, ${net.country}`, `Timezone ${net.tz}`, `Range ${prefixOf(ip)}`,
    ...[['VPN', f.vpn], ['Proxy', f.proxy], ['Tor', f.tor], ['Relay', f.relay], ['Hosting', f.hosting], ['Residential Proxy', false]].map(([name, on]) => `${name} ${on ? 'Detected' : 'Not detected'}`),
  ].join('\n');
  const typeWord = { residential: '家宽', hosting: '机房' }[net.usage];
  const pages = {
    ipinfo: ip => ({ ip, time: Date.now(), text: ipinfoText(ip) }),
    ipsuper: ip => ({
      ip, time: Date.now(), headers: ['IPInfo', 'IP2Location', 'IP-API', 'DBIP', 'AbuseIPDB', 'IPQualityScore'],
      rows: { 使用类型: Array(6).fill(typeWord), 公司类型: Array(6).fill(typeWord) },
      riskPercent: { IPQualityScore: net.extras.ipqs.risk, Scamalytics: net.extras.scamalytics.risk, AbuseIPDB: net.extras.abuseipdb.risk },
      riskFlags: { IPInfo: { hosting: f.hosting, proxy: f.proxy, vpn: f.vpn, tor: f.tor } },
    }),
    sources: ip => ({
      ip, time: Date.now(),
      sources: {
        iphub: { status: 'ok', time: Date.now(), ms: 2100, data: { usageType: net.usage, flags: { proxy: f.proxy, hosting: f.hosting } } },
        scamalytics: { status: 'ok', time: Date.now(), ms: 2600, data: { risk: net.extras.scamalytics.risk, riskLabel: net.extras.scamalytics.riskLabel, flags: { proxy: f.proxy } } },
        ipregistry: { status: 'error', error: '网页未返回字段' },
        ipqs: { status: 'challenge', error: '网页要求人机验证' },
        greynoise: { status: 'skip', error: '本轮无需读取' },
      },
    }),
    getipintel: ip => ({ ip, probability: net.extras.getipintel.probability, risk: net.extras.getipintel.risk }),
  };
  const relay = ip => ({
    ip, version: 'fixture', classification: net.usage, confidence: 0.9, evidence: ['手写 fixture'], asn: { number: net.asn, name: net.org, network: prefixOf(ip).split('/')[0], cidr: Number(prefixOf(ip).split('/')[1]) },
    rdns: { hostname: net.hostname(ip) },
    signals: { proxy: f.proxy, tor: f.tor, bogon: false, vpnasn: f.vpn, goodvpn: false, hosting: f.hosting, cloud: f.hosting, mobileasn: false, spamhaus: false, sfs_listed: net.sfs.appears > 0, ic3_listed: false },
  });
  const rdapEntities = [
    { roles: ['registrant'], vcardArray: ['vcard', [['fn', {}, 'text', net.org], ['kind', {}, 'text', 'org'], ['adr', { label: `1 Example Way\n${net.city}\n${net.country}` }, 'text', []]]] },
    { roles: ['abuse'], vcardArray: ['vcard', [['fn', {}, 'text', 'Abuse Desk'], ['email', {}, 'text', `abuse@${net.domain}`]]] },
  ];
  const decode = decodeURIComponent;

  return [
    // Egress: what each site sees as this browser's address.
    [/^https:\/\/api4\.ipify\.org/, () => ({ ip: self })],
    [/^https:\/\/api6\.ipify\.org/, () => { if (!v6) throw new TypeError('Failed to fetch'); return { ip: v6 }; }],
    [/^https:\/\/(?:www\.cloudflare\.com|1\.1\.1\.1)\/cdn-cgi\/trace/, () => `ip=${self}\nloc=${net.country}\ncolo=${net.colo}\nhttp=http/2\ntls=TLSv1.3\nwarp=off\ngateway=off\n`],
    [/^https:\/\/api\.ip\.sb\/ip$/, () => self],
    [/^https:\/\/ipinfo\.io\/json/, () => ({ ip: self })],
    [/^https:\/\/myip\.ipip\.net\/json/, () => ({ data: { ip: self } })],

    // The site's own API.
    [/^api:\/health$/, () => ({
      service: 'egress-observatory-api', seen: true,
      routes: ['proxycheck', 'ipapi', 'ip2location', 'dbip', 'abuseipdb', 'ipqs', 'ipregistry', 'ipdata', 'ipapiis', 'ipinfo', 'greynoise', 'crowdsec', 'virustotal', 'scamalytics', 'vpnapi', 'iphub', 'getipintel', 'radar'],
    })],
    [/^api:\/v1\/seen\?ip=([^&]+)/, ([, ip]) => ({ status: 'success', ip: decode(ip), callerKnown: true, windowDays: 30, ...net.seen })],
    [/^api:\/v1\/radar\?asn=/, () => ({ bot: net.botShare, human: 1 - net.botShare, window: '7d' })],
    [/^api:\/v1\/page\/(\w+)\?ip=(.+)$/, ([, page, ip]) => pages[page]?.(decode(ip))],
    [/^http:\/\/127\.0\.0\.1:4188\/lookup\/(\w+)$/, ([, page], init) => pages[page]?.(JSON.parse(init.body).ip)],
    [/^api:\/v1\/(\w+)\?ip=(.+)$/, ([, route, ip]) => worker(route, decode(ip))],

    // Geolocation and type databases queried directly.
    [/^https:\/\/ip\.net\.coffee\/api\/ip\/lookup\/(.+)$/, ([, ip]) => ({
      ip: decode(ip), company_type: net.asnType, is_datacenter: f.hosting, is_mobile: false, isResidential: net.usage === 'residential',
      geo_sources: [{ src: 'maxmind', city: net.city, country_code: net.country, registered_country_code: net.country }, { src: 'ipinfo', city: net.city, country_code: net.country, registered_country_code: net.country }],
    })],
    [/^https:\/\/api\.ipquery\.io\/([^?]+)/, ([, ip]) => ({
      ip: decode(ip), isp: { asn: `AS${net.asn}`, org: net.org, isp: net.org },
      location: { country_code: net.country, state: net.region, city: net.city, latitude: net.lat, longitude: net.lon, timezone: net.tz },
      risk: { is_vpn: f.vpn, is_proxy: f.proxy, is_tor: f.tor, is_datacenter: f.hosting, is_mobile: false, risk_score: net.risk },
    })],
    [/^https:\/\/ipwho\.is\/(.+)$/, ([, ip]) => ({
      success: true, ip: decode(ip), country_code: net.country, region: net.region, city: net.city, latitude: net.lat, longitude: net.lon,
      timezone: { id: net.tz }, connection: { asn: net.asn, org: net.org, isp: net.org, domain: net.domain },
    })],
    [/^https:\/\/api\.ip\.sb\/geoip\/(.+)$/, ([, ip]) => ({ ip: decode(ip), country_code: net.country, region: net.region, city: net.city, latitude: net.lat, longitude: net.lon, timezone: net.tz, asn: net.asn, isp: net.org, organization: net.org })],
    [/^https:\/\/ipleak\.net\/json\/(.+)$/, ([, ip]) => ({
      ip: decode(ip), country_code: net.country, region_name: net.region, city_name: net.city, latitude: net.lat, longitude: net.lon, time_zone: net.tz,
      as_number: net.asn, isp_name: net.org, registered_country_code: net.country, reverse: net.hostname(decode(ip)), as_network: prefixOf(decode(ip)),
    })],
    [/^https:\/\/get\.geojs\.io\/v1\/ip\/geo\/(.+)\.json$/, ([, ip]) => ({ ip: decode(ip), country_code: net.country, region: net.region, city: net.city, latitude: String(net.lat), longitude: String(net.lon), timezone: net.tz, asn: net.asn, organization_name: net.org })],
    [/^https:\/\/ipapi\.co\/(.+)\/json\/$/, ([, ip]) => ({ ip: decode(ip), country_code: net.country, region: net.region, city: net.city, latitude: net.lat, longitude: net.lon, timezone: net.tz, asn: `AS${net.asn}`, org: net.org, network: prefixOf(decode(ip)) })],
    [/^https:\/\/api\.iplocation\.net\/\?ip=(.+)$/, ([, ip]) => ({ ip: decode(ip), response_code: '200', response_message: 'OK', country_code2: net.country, isp: net.org })],
    [/^https:\/\/free\.freeipapi\.com\/api\/v1\/json\/(.+)$/, ([, ip]) => ({ ipAddress: decode(ip), countryCode: net.country, regionName: net.region, cityName: net.city, latitude: net.lat, longitude: net.lon, timeZones: [net.tz], asn: String(net.asn), asnOrganization: net.org, isProxy: f.proxy })],
    [/^https:\/\/www\.iplocate\.io\/api\/lookup\/(.+)$/, ([, ip]) => ({
      ip: decode(ip), country_code: net.country, subdivision: net.region, city: net.city, latitude: net.lat, longitude: net.lon, time_zone: net.tz, is_anycast: false,
      asn: { asn: `AS${net.asn}`, name: net.org, type: net.asnType }, company: { name: net.org, type: net.asnType },
      privacy: { is_vpn: f.vpn, is_proxy: f.proxy, is_tor: f.tor, is_icloud_relay: f.relay, is_hosting: f.hosting, is_abuser: f.abuser, is_bogon: false },
    })],
    [/^https:\/\/json\.geoiplookup\.io\/(.+)$/, ([, ip]) => ({ success: true, ip: decode(ip), country_code: net.country, region: net.region, city: net.city, latitude: net.lat, longitude: net.lon, timezone_name: net.tz, asn_number: net.asn, org: net.org, isp: net.org, hostname: net.hostname(decode(ip)), connection_type: net.connection })],
    [/^https:\/\/api\.techniknews\.net\/ipgeo\/(.+)$/, ([, ip]) => ({
      status: 'success', ip: decode(ip), countryCode: net.country, regionName: net.region, city: net.city, lat: net.lat, lon: net.lon, timezone: net.tz,
      as: `AS${net.asn} ${net.org}`, org: net.org, isp: net.org, proxy: f.proxy, hosting: f.hosting, mobile: false, reverse: net.hostname(decode(ip)), cached: false,
    })],
    [/^https:\/\/blackbox\.ipinfo\.app\/api\/v3beta\/(.+)$/, ([, ip]) => relay(decode(ip))],
    [/^https:\/\/atlas\.ipinfo\.app\/api\/v2\/ip\/(.+)$/, ([, ip]) => ({
      ip: decode(ip), version: 'fixture', as_number: net.asn, as_description: net.org, cidr: prefixOf(decode(ip)), country_code: net.country,
      location: { country_code: net.country, region: net.region, city: net.city, latitude: net.lat, longitude: net.lon, source: 'baseline', confidence: 'medium', accuracy_km: 50 },
    })],
    [/^https:\/\/atlas\.ipinfo\.app\/api\/v2\/geo\/(.+)$/, ([, ip]) => ({ ip: decode(ip), evidence: [{ source: 'baseline', detail: 'DB-IP City Lite', country_code: net.country, region: net.region, city: net.city }] })],
    [/^https:\/\/ipv[46]-check-perf\.radar\.cloudflare\.com\//, () => ({ ip_address: self, country: net.country, region: net.region, city: net.city, latitude: net.lat, longitude: net.lon, asn: net.asn, colo: net.colo })],
    [/^https:\/\/ipok\.io\/api\/ip\?ip=(.+)$/, ([, ip]) => ({
      geo: { ip: decode(ip) }, sourceAttempts: [{ source: 'vpnapi.io', status: 'cached_only' }],
      sources: [{ source: 'Scamalytics', ok: true, observedAt: Date.now(), risk: net.extras.scamalytics.risk, flags: { proxy: f.proxy, vpn: f.vpn, hosting: f.hosting }, usageType: net.usage, companyType: net.company }],
    })],

    // Registries and routing.
    [/^https:\/\/rdap\.org\/ip\/(.+)$/, ([, ip]) => ({
      country: net.country, name: net.asName, handle: `NET-${net.asn}`, type: 'ASSIGNED', port43: net.whois, cidr0_cidrs: [{ v4prefix: prefixOf(decode(ip)).split('/')[0], length: 24 }],
      events: [{ eventAction: 'registration', eventDate: net.registered }, { eventAction: 'last changed', eventDate: daysAgo(200) }], entities: rdapEntities,
    })],
    [/^https:\/\/rdap\.org\/autnum\//, () => ({ country: net.country, name: net.asName, events: [{ eventAction: 'registration', eventDate: net.registered }] })],
    [/^https:\/\/ip\.guide\/AS\d+$/, () => ({ routes: { v4: [prefixOf(self)] } })],
    [/^https:\/\/ip\.guide\/(.+)$/, ([, ip]) => ({
      ip: decode(ip), network: { cidr: prefixOf(decode(ip)), autonomous_system: { asn: net.asn, name: net.asName, organization: net.org, country: net.country, rir: net.rir } },
      location: { country: net.country, city: net.city, latitude: net.lat, longitude: net.lon, timezone: net.tz },
    })],
    [/stat\.ripe\.net\/data\/maxmind-geo-lite\//, () => ({ data: { located_resources: [{ locations: [{ country: net.country, city: net.city, latitude: net.lat, longitude: net.lon }] }] } })],
    [/stat\.ripe\.net\/data\/rir-stats-country\/data\.json\?resource=([^&]+)/, ([, ip]) => ({ data: { located_resources: [{ resource: prefixOf(decode(ip)), location: net.country }] } })],
    [/stat\.ripe\.net\/data\/prefix-overview\/data\.json\?resource=([^&]+)/, ([, ip]) => ({ data: { announced: true, resource: prefixOf(decode(ip)), asns: [{ asn: net.asn, holder: `${net.asName} - ${net.org}` }] } })],
    [/stat\.ripe\.net\/data\/as-overview\//, () => ({ data: { holder: `${net.asName} - ${net.org}` } })],
    [/stat\.ripe\.net\/data\/routing-status\//, () => ({ data: { announced_space: { v4: { ips: net.v4ips, prefixes: 12 }, v6: { prefixes: 2 } }, visibility: { v4: { ris_peers_seeing: 320 } } } })],
    [/stat\.ripe\.net\/data\/rpki-validation\//, () => ({ data: { status: 'valid' } })],
    [/stat\.ripe\.net\/data\/announced-prefixes\//, () => ({ data: { prefixes: [{ prefix: prefixOf(self) }] } })],
    [/^https:\/\/www\.peeringdb\.com\/api\/net\?asn=/, () => ({ data: [{ name: net.org, info_type: net.peering, info_types: [net.peering], info_traffic: '10-20Gbps', info_ratio: 'Balanced', info_scope: 'Regional', website: `https://${net.domain}/`, created: net.registered }] })],

    // Threat feeds.
    [/^https:\/\/otx\.alienvault\.com\//, () => ({ pulse_info: { count: net.otx.length, pulses: net.otx.map(name => ({ name })) }, validation: [], false_positive: [] })],
    [/^https:\/\/internetdb\.shodan\.io\//, () => net.shodan || status(404, { detail: 'No information available' })],
    [/^https:\/\/api\.stopforumspam\.org\//, () => ({ success: 1, ip: net.sfs })],
    [/^https:\/\/onionoo\.torproject\.org\//, () => ({ relays: [] })],
    [/^https:\/\/(?:dns\.google\/resolve|cloudflare-dns\.com\/dns-query)\?name=([^&]+)&type=(A|PTR)/, ([, name, type]) => {
      if (type === 'PTR') return { Status: 0, Answer: [{ type: 12, data: `${net.hostname(self)}.` }] };
      const listing = Object.entries(net.dnsbl).find(([zone]) => name.endsWith(zone));
      return listing ? { Status: 0, Answer: [{ type: 1, data: listing[1] }] } : { Status: 3 };
    }],
    // 198.51.100.200 keeps every list non-empty: it is a listed neighbour of the datacenter address and unrelated to the others.
    [/^https:\/\/raw\.githubusercontent\.com\//, (match, init, url) => `# 手写 fixture\n198.51.100.200\n${net.lists?.test(url) ? `${self}\n` : ''}`],

    // Live probes that go through fetch.
    [/^https:\/\/\d\.[0-9a-f]+\.bash\.ws\//, () => ''],
    [/^https:\/\/bash\.ws\/dnsleak\/test\//, () => [{ type: 'dns', ip: net.resolver.ip, country: net.resolver.country, asn: net.resolver.asn }, { type: 'ip', ip: self }]],
    [/^https:\/\/[a-z0-9]+\.edns\.ip-api\.com\/json/, () => ({ dns: { ip: net.resolver.ip, geo: net.resolver.geo } })],
    [/^https:\/\/tcpip\.incolumitas\.com\/classify/, () => ({ lookup_ip: self, ...net.tcp })],
  ];
}

// ---------- window.fetch ----------

/** Resolves after `ms`, or never for Infinity; rejects like a real fetch when the caller's signal aborts. */
function pause(ms, signal) {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) { reject(signal.reason); return; }
    const timer = ms === Infinity ? null : setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(timer); reject(signal.reason); }, { once: true });
  });
}

function fixtureFetch(scenario) {
  const table = routes(scenario);
  return async (input, init = {}) => {
    const url = String(input?.url ?? input);
    const key = url.startsWith(API_BASE) ? `api:${url.slice(API_BASE.length)}` : url;
    // A little latency, so pending states and rescoring show as they do for real.
    await pause(40 + Math.random() * 200, init.signal);

    const fault = scenario.faults?.find(([pattern]) => pattern.test(key))?.[1];
    if (fault === 'hang') await pause(Infinity, init.signal);
    if (fault === 'network') throw new TypeError('Failed to fetch');
    if (fault === 'html') return new Response('<html>模拟的错误页面</html>', { headers: { 'Content-Type': 'text/html' } });
    if (fault === 429) return status(429, { error: '模拟的频率限制', errorCode: 'caller-rate-limit', retryAfterSeconds: 60 }, { 'Retry-After': '60' });
    if (fault) return status(fault, { error: `模拟的 HTTP ${fault}` });

    for (const [pattern, answer] of table) {
      const match = key.match(pattern);
      if (!match) continue;
      const body = answer(match, init, url);
      if (body === undefined) break;
      if (body instanceof Response) return body;
      return typeof body === 'string' ? new Response(body) : new Response(JSON.stringify(body), { headers: JSON_HEADERS });
    }
    console.warn('[mock] 这个请求没有 fixture：', url);
    return status(404, { error: '这个请求没有 fixture' });
  };
}

// ---------- page ----------

function showBanner(current) {
  const bar = document.createElement('div');
  bar.className = 'mock-banner';
  bar.setAttribute('role', 'status');
  const links = Object.entries(SCENARIOS).map(([id, { label }]) => `<a href="?mock=1&amp;scenario=${id}"${id === current ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  bar.innerHTML = `<strong>模拟模式</strong><span>所有数据来自本地 fixture，不是真实检测；WebRTC、人机验证和 Chrome 插件没有运行。</span><nav aria-label="模拟场景">${links}</nav>`;
  document.querySelector('.topbar').before(bar);
  document.title = `【模拟】${document.title}`;
}

// A copy kept from an earlier load would hide this load's failures and outlive fixture edits. Real addresses never get here.
function forgetCopies() {
  for (const key of Object.keys(localStorage)) {
    if (key.startsWith('egress-src:') && accepts(key.split(':').slice(2).join(':'))) localStorage.removeItem(key);
  }
}

export function install() {
  const requested = new URLSearchParams(location.search).get('scenario');
  const id = Object.hasOwn(SCENARIOS, requested) ? requested : 'clean';
  const { browser } = SCENARIOS[id].net;
  window.fetch = fixtureFetch(SCENARIOS[id]);
  forgetCopies();
  showBanner(id);
  return {
    // Fixtures use documentation addresses, which the real checks refuse as non-public; mock mode accepts only those.
    accepts,
    // The browser's own zone and languages come from the scenario too, so it scores the same on every machine.
    env: { tz: { zone: browser.zone, offset: zoneOffset(browser.zone) }, lang: { languages: browser.languages } },
    webrtc: { status: 'ok', supported: false, srflx: [], leak: false, summary: '模拟模式：没有运行 WebRTC 实测' },
    captcha: { status: 'error', error: '模拟模式：没有加载验证脚本，本项不计分' },
    flag: code => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 15"><rect width="20" height="15" fill="#3a3f4b"/><text x="10" y="11" font-size="8" font-family="sans-serif" text-anchor="middle" fill="#fff">${code}</text></svg>`)}`,
  };
}
