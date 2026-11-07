# 商店发布材料 / Store listing materials

适用于 Chrome 网上应用店、Microsoft Edge 加载项、Firefox 附加组件（AMO）与可选的 Opera 加载项；Safari 取决于 [#29](https://github.com/BlackSlience-Reaper/egress-observatory/issues/29) 的评估结论。商店尚未发布，`src/helper-stores.js` 中的 URL 均为 `null`。开发者账号注册、付款、身份核验和提交由维护者本人完成。

For the Chrome Web Store, Microsoft Edge Add-ons, Firefox Add-ons (AMO) and, optionally, Opera add-ons; Safari depends on the outcome of [#29](https://github.com/BlackSlience-Reaper/egress-observatory/issues/29). Store listings are pending; all URLs in `src/helper-stores.js` are `null`. The maintainer handles account registration, payment, identity verification and submission personally.

| 商店 / Store | 上传包 / Upload | 覆盖 / Covers |
|---|---|---|
| Chrome 网上应用店 / Chrome Web Store | `dist/egress-browser-helper-v<version>-chrome.zip` | Chrome、Brave、Vivaldi、Arc 等 / and other Chromium browsers |
| Microsoft Edge 加载项 / Edge Add-ons | 同上 / same | Edge |
| Firefox 附加组件 / AMO | `dist/egress-browser-helper-v<version>-firefox.zip` | Firefox 140+ 桌面版 / desktop |
| Opera 加载项 / Opera add-ons（可选 / optional） | `-chrome.zip` | Opera |

## 中文文案

**名称**：Egress 自动网页查询

**简短说明**（少于 132 个字符）：为 Egress 补充 18 个 IP 情报来源，逐源展示类型与风险；人机验证手动完成，临时标签自动清理。

**详细说明**：

Egress 自动网页查询为 Egress IP 质量检测页面补充公开情报。扩展随 Egress 查询访问 18 个固定来源，从匹配目标 IP 的结果页或公开 JSON 接口中读取网络归属、位置、ASN、使用类型、公司类型、VPN / 代理 / Tor 等标记，以及来源提供的风险分和信任分。

结果逐源回到发起查询的页面，补齐已有数据库记录；查询详情显示读取状态、失败原因与耗时。支持 IPv4 和 IPv6，实际字段和可用性取决于来源。

扩展使用当前浏览器会话访问来源页面，尽量复用已打开的同一目标结果页，用户原有标签保持原状。新建标签归入“Egress 自动查询”临时组，读取完成后关闭；停止等待、切换查询或离开、关闭发起页面会清理本轮创建的标签。遇到人机验证时，点击 Egress 的“去验证”并手动完成；扩展保留该标签等待，通过后继续读取。扩展不会点击、求解或绕过验证码，也不保证绕过来源的登录、额度或访问限制。

目标 IP 会发送到指定查询来源，提取结果只返回发起查询的 Egress 标签页。扩展不读取或导出 Cookie、账号凭据或 API key；来源页仍由浏览器按正常规则使用自身会话。公开 JSON 请求不带浏览器会话凭据。成功结果按来源和 IP 在内存中最多保留 128 项，在原始成功时间后 10 分钟内可复用；扩展后台停止后缓存消失。扩展没有统计、遥测、广告追踪或数据销售。

安装后打开 https://blackslience-reaper.github.io/egress-observatory/ ，刷新页面并点击“查询”或“重新检测”。该页面也提供离线 ZIP 与安装步骤。Chrome、Edge 与 Opera 使用同一个安装包；Firefox 140 及以上桌面版使用由同一份代码生成的 Firefox 包。

**单一用途声明**：在 Egress 页面发起的公网 IP 查询中，从固定情报来源读取并返回目标 IP 的公开网络归属、类型与风险字段，以补全该页的 IP 检测结果。

### 权限说明

- `tabs`：查找并复用与目标查询 URL 匹配的已有结果页，读取查询标签的 URL 与状态，记录发起查询的 Egress 标签，按用户请求聚焦验证页，并创建和关闭扩展自己的临时查询标签。不会读取通用浏览历史或关闭用户已有标签。
- `scripting`：将随扩展一起打包的字段提取函数注入已授权的来源结果页，核对目标 IP 后读取已渲染的结果字段。扩展不下载远程脚本执行。
- `tabGroups`：设置本轮临时查询组的名称与颜色，便于用户识别；本轮标签全部关闭后临时组消失。
- `https://ipsuper.com/*`：读取目标报告中的具名数据库类型表、风险百分比与风险标记矩阵，用于补齐 Egress 中相应数据库的字段。
- `https://ipinfo.io/*`、`https://www.ip2location.io/*`、`https://ipregistry.co/*`、`https://ipdata.co/*`、`https://db-ip.com/*`：读取这些网络归属与位置网页中匹配目标 IP 的 ASN、组织、公司、位置、使用类型与已公开的风险字段；每个域名对应一个固定来源。
- `https://iphub.info/*`、`https://www.ipqualityscore.com/*`、`https://scamalytics.com/*`、`https://viz.greynoise.io/*`、`https://www.abuseipdb.com/*`、`https://proxycheck.io/*`：读取这些风险与威胁网页中匹配目标 IP 的风险分、代理 / VPN / Tor / 机房与滥用或扫描标记，以及其提供的网络归属字段；每个域名对应一个固定来源。
- `https://blackbox.ipinfo.app/*`、`https://api.ipquery.io/*`、`https://api.ipapi.is/*`、`https://www.iplocate.io/*`、`https://json.geoiplookup.io/*`、`http://ip-api.com/*`：直接请求各来源针对目标 IP 的公开 JSON，并提取其可用的类型、位置、ASN 与风险字段。请求使用 `credentials: 'omit'`。ip-api.com 的免费入口为明文 HTTP；其余固定入口为 HTTPS。当前包保留现有协议，提交时应如实披露此 HTTP 路径。

所有 host 权限均覆盖指定协议和域名的所有路径；实际入口来自包内 `page-providers.js`，权限只用于该次 IP 查询。桥接脚本仅匹配线上 Egress 项目路径和 `localhost:4187` / `127.0.0.1:4187` 本地页面，后台再核对发送方，只把报告回传给本轮发起标签。

### Chrome Web Store 隐私标签填写

按实际处理的数据披露，包括仅在本机处理的数据；不得填“完全不处理用户数据”。

- **Personally identifiable information（个人身份信息）：是**。目标公网 IP，以及访问查询服务时服务所见的连接 IP；不收集姓名、邮箱或账号信息。
- **Location（位置）：是**。来源提供的目标 IP 国家、地区、城市、经纬度与时区；不申请设备定位权限。
- **Web history（浏览活动）：是，范围有限**。为匹配和读取本轮结果而访问的来源 URL、标签 URL 与页面标题；不调用 History API，不收集无关浏览记录，也不上传通用浏览历史。
- **Website content（网站内容）：是**。来源页中匹配目标 IP 的结构化结果和公开 JSON，以及读取状态；不导出整页或截图。
- **Health information、Financial and payment information、Authentication information、Personal communications、User activity：否**。扩展不读取健康、支付、认证或私人通信内容，不采集一般点击、按键、鼠标或滚动行为。
- **Remote code：No, I am not using remote code**。提取函数与依赖均随 ZIP 提供；来源页面和 JSON 是查询对象，不作为扩展代码下载执行。
- **不在获准用途之外出售或转移用户数据：确认**。目标 IP 仅发送到实现查询所需的固定来源，字段仅回到发起页面；没有广告或数据经纪传输。
- **不为与单一用途无关的目的使用或转移数据：确认**。
- **不将数据用于信用资格或借贷决策：确认**。

扩展没有独立的数据收集服务器或统计。Egress 网站自身的接口、连接检测与共享人数估计另按隐私政策和项目 README 说明处理，不能把扩展的无统计声明扩展到整个网站。

**隐私政策 URL**：https://blackslience-reaper.github.io/egress-observatory/privacy.html

**支持与联系**：https://github.com/BlackSlience-Reaper/egress-observatory/issues

## English listing

**Name**: Egress Browser Helper

**Short description** (under 132 characters): Add 18 IP intelligence sources to Egress, inspect network and risk fields, and clean up temporary query tabs.

**Detailed description**:

Egress Browser Helper supplements the Egress IP quality page with public intelligence from 18 fixed providers. During an Egress query, it reads matching result pages or public JSON endpoints for the target IP's network ownership, location, ASN, usage and company types, VPN / proxy / Tor indicators, and available risk and trust scores.

Results return to the initiating Egress page one provider at a time and supplement existing database records. Query details show progress, failure reasons and elapsed time. IPv4 and IPv6 are supported; available fields and access depend on each provider.

The extension uses the current browser session for provider pages. An already-open matching result page may be reused without navigating or closing it. New tabs are placed in a temporary “Egress 自动查询” group where possible and closed after extraction. Stopping a wait, changing the query, leaving or closing the initiating page cleans up the job's temporary tabs. When a CAPTCHA appears, use Egress's verification link and complete it manually. The extension keeps the tab open and resumes reading afterward. It never clicks, solves or bypasses CAPTCHAs and does not bypass provider login, quota or access restrictions.

The target IP is sent to the specified lookup providers. Extracted results return only to the Egress tab that started the query. The extension does not read or export cookies, account credentials or API keys. Provider pages retain their normal browser-managed sessions; public JSON requests omit browser session credentials. Successful results are cached by provider and IP in memory, up to 128 entries, and reused for 10 minutes from their original success timestamp. Cache data disappears when the extension's background stops. The extension has no analytics, telemetry, ad tracking or data sales.

After installation, open https://blackslience-reaper.github.io/egress-observatory/ , refresh the page and start a query or rerun detection. The page also provides an offline ZIP and installation steps. Chrome, Edge and Opera use the same package; Firefox 140 and later on desktop use a Firefox package generated from the same code.

**Single-purpose statement**: Supplement a public-IP query initiated by an Egress page by reading the target IP's public network ownership, type and risk fields from fixed intelligence providers and returning them to that page.

### Permission justifications

- `tabs`: find and reuse existing result tabs matching a target lookup URL; inspect lookup-tab URLs and state; identify the initiating Egress tab; focus a challenge page when the user requests it; and create and close the extension's own temporary tabs. The extension does not read general history or close pre-existing user tabs.
- `scripting`: inject extraction functions bundled with the extension into authorized provider result pages, match the target IP, and read rendered result fields. No remote scripts are downloaded for extension execution.
- `tabGroups`: name and color the temporary query group for recognition; the group disappears after its last tab closes.
- `https://ipsuper.com/*`: read named database usage/company types, risk percentages and the indicator matrix for the target IP to supplement the corresponding Egress records.
- `https://ipinfo.io/*`, `https://www.ip2location.io/*`, `https://ipregistry.co/*`, `https://ipdata.co/*`, `https://db-ip.com/*`: read target-matched ASN, organization, company, location, usage type and available public risk fields from these network and location pages. Each host is a separate fixed provider.
- `https://iphub.info/*`, `https://www.ipqualityscore.com/*`, `https://scamalytics.com/*`, `https://viz.greynoise.io/*`, `https://www.abuseipdb.com/*`, `https://proxycheck.io/*`: read target-matched risk scores, proxy / VPN / Tor / hosting indicators, abuse or scanning observations and available network ownership fields from these risk and threat pages. Each host is a separate fixed provider.
- `https://blackbox.ipinfo.app/*`, `https://api.ipquery.io/*`, `https://api.ipapi.is/*`, `https://www.iplocate.io/*`, `https://json.geoiplookup.io/*`, `http://ip-api.com/*`: request each provider's public target-IP JSON and extract available type, location, ASN and risk fields with `credentials: 'omit'`. The free ip-api.com endpoint uses unencrypted HTTP; the other fixed lookup endpoints use HTTPS. This package retains the existing protocols, so disclose the HTTP path when submitting.

Host permissions cover all paths on each specified scheme and host, while actual destinations are fixed in the packaged `page-providers.js` and used only for the IP query. The bridge matches only the hosted Egress project path and local pages on `localhost:4187` / `127.0.0.1:4187`. The background worker also checks the sender and sends reports only to the initiating tab.

### Chrome Web Store Privacy practices answers

Disclose data handled locally as well as transmitted data. Do not claim that the extension handles no user data.

- **Personally identifiable information: Yes**. The queried public IP and the connection IP visible to lookup providers. No names, email addresses or account information are collected.
- **Location: Yes**. Provider-reported country, region, city, coordinates and time zone of the target IP. No device geolocation permission is requested.
- **Web history: Yes, narrowly scoped**. Provider URLs, tab URLs and page titles accessed to match and read current lookup results. No History API, unrelated browsing collection or general-history uploads.
- **Website content: Yes**. Target-matched structured result fields, public JSON and extraction status. No full-page exports or screenshots.
- **Health information, Financial and payment information, Authentication information, Personal communications, User activity: No**. No health, payment, authentication or private communication content is read. General clicks, keystrokes, pointer movement and scrolling are not collected.
- **Remote code: No, I am not using remote code**. All extraction functions and dependencies ship in the ZIP. Provider pages and JSON are lookup inputs, not code downloaded for extension execution.
- **Data is not sold or transferred outside approved use cases: Certify**. The target IP goes only to providers necessary for the lookup; extracted fields go only to the initiating page. No advertising or data-broker transfers.
- **Data is not used or transferred for purposes unrelated to the single purpose: Certify**.
- **Data is not used to determine creditworthiness or for lending purposes: Certify**.

The extension has no separate collection server or analytics. The Egress website's own APIs, connection checks and shared-usage estimate are covered separately in the privacy policy and project README. The extension's no-analytics statement does not describe the entire website.

**Privacy policy URL**: https://blackslience-reaper.github.io/egress-observatory/privacy.html

**Support and contact**: https://github.com/BlackSlience-Reaper/egress-observatory/issues

## Firefox 附加组件（AMO）/ Firefox Add-ons

上传 `-firefox.zip`，选择在 AMO 上公开发布（On this site）。包内是未压缩、未转译的源码，无需另交源码包。名称、摘要（250 字符以内）和说明沿用上方中英文文案；类别选“隐私与安全 / Privacy & Security”；平台只选桌面（Windows、macOS、Linux）；许可证 GPL-3.0-only；主页为 Egress 网站，支持页为 GitHub Issues，隐私政策 URL 同上。

Upload `-firefox.zip` and choose to list it on AMO (On this site). The package contains unminified, untranspiled sources, so no separate source archive is needed. Reuse the Chinese and English name, summary (250 characters or fewer) and description above; choose the Privacy & Security category, desktop platforms only (Windows, macOS, Linux), the GPL-3.0-only license, the Egress site as homepage, GitHub Issues as the support page and the same privacy policy URL.

### Firefox 包的 manifest 差异 / Firefox manifest differences

`pack.py` 用 `manifest.firefox.json`（JSON Merge Patch）改写共用的 `manifest.json`，运行代码不变：

`pack.py` applies `manifest.firefox.json` (a JSON Merge Patch) to the shared `manifest.json`; the runtime code is unchanged:

- `background.scripts` 取代 `service_worker`：Firefox 不支持扩展 Service Worker。/ `background.scripts` replaces `service_worker`, which Firefox does not support for extensions.
- 本地开发页匹配 `http://127.0.0.1/*`、`http://localhost/*`：Firefox 匹配模式不认端口，带 `:4187` 的模式匹配不到页面；后台仍只接受 4187 端口和线上 Egress 路径发来的消息。/ Local development pages match `http://127.0.0.1/*` and `http://localhost/*` because Firefox match patterns do not match a port; the background still accepts messages only from port 4187 and the hosted Egress path.
- `content_security_policy.extension_pages` 设为 `script-src 'self'`：Firefox MV3 默认 CSP 带 `upgrade-insecure-requests`，会把 ip-api.com 的 HTTP 请求升级为 HTTPS，免费接口因此返回 403。仍不加载远程代码。/ The extension-page CSP is `script-src 'self'`. Firefox's default MV3 CSP adds `upgrade-insecure-requests`, which upgrades the ip-api.com HTTP request to HTTPS, where the free endpoint returns 403. No remote code is loaded.
- `browser_specific_settings.gecko`：ID `egress-browser-helper@blackslience-reaper.github.io`（首次上架后不能更改）、`strict_min_version` 140.0（内置数据收集授权与 `tabGroups` 所需），以及下方的数据收集声明。/ The gecko ID (permanent once listed), `strict_min_version` 140.0 for built-in data consent and `tabGroups`, and the data collection declaration below.
- 删除 `minimum_chrome_version`。/ `minimum_chrome_version` is removed.

### 数据收集声明 / Data collection declaration

自 2025 年 11 月 3 日起，AMO 新提交的扩展必须在 manifest 中声明数据收集；Firefox 140 及以上在安装时显示。Mozilla 把“传输”定义为在扩展或本地浏览器之外处理的数据。扩展发送到浏览器之外的只有目标 IP（可能是用户自己的出口 IP），发给固定查询来源；读取的位置、类型和风险字段只回到同一浏览器里的 Egress 页面，网站也不把插件结果上传到 Egress 后端。因此 `required` 只填 `personallyIdentifyingInfo`，位置、浏览活动、网站内容在本地处理，不声明。提交前按 AMO 当时的定义复核；审核要求更宽的声明时，只改 `manifest.firefox.json`。

Since November 3, 2025, new AMO submissions must declare data collection in the manifest; Firefox 140 and later show it at install time. Mozilla treats data as transmitted when it is handled outside the add-on or the local browser. The only data the extension sends outside the browser is the target IP, possibly the user's own exit IP, to the fixed lookup providers. Extracted location, type and risk fields return only to the Egress page in the same browser, and the site does not upload helper results to the Egress backend. `required` therefore lists only `personallyIdentifyingInfo`; location, browsing activity and website content are handled locally and not declared. Recheck against AMO's definitions at submission time; if review asks for a broader declaration, change only `manifest.firefox.json`.

### 审核备注 / Notes to reviewers

> No build step. The files are the unminified sources in `browser-helper/` of https://github.com/BlackSlience-Reaper/egress-observatory at the release commit; `manifest.json` is produced by `browser-helper/pack.py` from `manifest.json` and `manifest.firefox.json`.
>
> To test, open https://blackslience-reaper.github.io/egress-observatory/ ; it checks the visitor's own exit IP, and any public IP can be entered in the query box. The "多源 IP 类型" section gains a "插件" row with per-provider results, and "查询详情" lists each provider's outcome. The extension acts only when that page asks: it fetches fixed public JSON endpoints, or opens fixed provider result pages in a temporary tab group, reads target-matched fields with `scripting.executeScript`, returns them to the requesting tab and closes the tabs it opened. It never interacts with CAPTCHAs; the user completes them.
>
> ip-api.com's free endpoint is HTTP only, so the extension-page CSP omits `upgrade-insecure-requests`; `script-src 'self'` still applies and no remote code is loaded. The content script also matches `127.0.0.1` and `localhost` for local development of the site; the background accepts messages there only from port 4187.

## Opera 加载项 / Opera add-ons

可选。上传 `-chrome.zip`，文案沿用英文版。上架前，站点在 Opera 中显示 Chrome 网上应用店链接，Opera 用户可借助 Opera 的“Install Chrome Extensions”扩展安装。

Optional. Upload `-chrome.zip` with the English listing. Until it is listed, the site shows Opera visitors the Chrome Web Store link, which Opera can install from with its Install Chrome Extensions add-on.

## 截图清单 / Screenshot checklist

每张 1280×800 PNG，直角、满幅，无额外边框或留白，使用实际界面。拍摄前开启“隐藏 IP”，检查地址栏、标签标题、悬浮提示和报告字段，确保没有真实 IP、凭据或私人内容。示意地址只用 `203.0.113.10`，截图不得伪造来源结果或商店可用状态。

Use real UI captures, each a full-bleed 1280×800 PNG with square corners and no added padding. Enable IP masking and inspect the address bar, tab titles, tooltips and report fields for actual IPs, credentials and private content. Use only `203.0.113.10` for illustrative addresses; do not fabricate provider results or store availability.

已拍摄（`browser-helper/store/`，不进安装包）：在 Firefox 159 中用 v1.3.4 打开线上页面，查询一个不属于维护者的公开地址并开启“隐藏 IP”，图中不显示地址。自动化浏览器会触发更多 Cloudflare 验证，所以 6 个来源停在“待验证”。

Captured (in `browser-helper/store/`, not packaged): the live page in Firefox 159 with helper v1.3.4, querying a public address that is not the maintainer's, with IP masking on and no address visible. The automated browser draws more Cloudflare challenges, so six providers wait for verification.

- [`1-multi-source-types.png`](store/1-multi-source-types.png)：对应下方 1 与 3，插件行、补齐的类型与“去验证 / 停止等待”。Items 1 and 3: the helper row, supplied types and the verification and stop controls.
- [`2-per-provider-details.png`](store/2-per-provider-details.png)：对应 2，只取插件通道的成功结果与耗时。Item 2, limited to the helper channel's results and timing.

4 需要浏览器标签栏，5 需要商店上线后在对应浏览器中拍摄，留给维护者。Item 4 needs the browser's tab strip and item 5 needs a live listing, so both remain for the maintainer.

1. **多源类型 / Multi-source types**：展示“多源 IP 类型”中的实际插件字段与插件连接状态，让用户看到扩展补齐的使用类型与公司类型。Show actual helper-supplied usage/company fields and the connected helper status.
2. **逐源查询详情 / Per-provider query details**：展开“查询详情”，展示插件、API 与服务器通道，以及成功、失败原因和耗时。Expand query details to show helper, API and server channels with real outcomes and timing.
3. **手动验证等待 / Manual verification wait**：出现真实验证等待时，展示 Egress 的“去验证”和“停止等待”入口；不拍摄验证码解题内容。Show the real pending-verification state and its verification/stop controls without capturing challenge solutions.
4. **临时查询组 / Temporary query group**：展示“Egress 自动查询”组和读取中的临时页，遮去所有真实目标地址；配合说明读取后自动关闭，用户原有标签保留。Show the temporary query group during extraction with actual target addresses hidden; explain automatic cleanup and preservation of existing tabs.
5. **安装与隐私 / Installation and privacy**：展示页面的安装步骤、离线 ZIP 与页脚隐私入口；商店上线后再拍摄实际浏览器对应商店入口。Show installation steps, the offline ZIP and the footer privacy link; capture a browser-specific store link only after its listing is live.

## 发布步骤 / Release steps

1. **改版本号 / Bump the version**：提升 `browser-helper/manifest.json` 的 `version`，各浏览器包共用。改了 `page-extract.js`、`page-providers.js` 或 `util.js` 时，`src/` 同名文件保持一致（CI 比对），并更新 `index.html` import map 里对应的 `?v=`。Raise the shared manifest version. Keep those three files identical to `src/` (CI compares them) and bump their `?v=` in the `index.html` import map.
2. **打包 / Package**：在仓库根目录运行 `python browser-helper/pack.py`（macOS / Linux 可用 `python3`）。脚本只用标准库，生成离线包 `downloads/egress-browser-helper-v<version>.zip`（顶层 `browser-helper/`，含运行文件、图标和 README）以及 `dist/` 中的 `-chrome.zip` 与 `-firefox.zip`（根目录含 manifest，不含 README），并同步 `index.html` 下载链接与两个 README 的版本号、商店列表。`dist/` 已被忽略。Run the packer from the repository root. Using only the standard library, it builds the offline ZIP and the per-browser upload ZIPs and synchronizes the download link, README versions and store lists. `dist/` is ignored.
3. **试装 / Try the packages**：Chrome 或 Edge 加载解压后的离线包；Firefox 在 `about:debugging` 临时载入 `-firefox.zip`。各在 Egress 页面查询一次，确认插件行有结果、需要人机验证的来源显示“待验证”、停止等待后临时标签关闭。Load the unpacked offline package in Chrome or Edge and the Firefox ZIP as a temporary add-on, run one Egress query in each, and check helper results, “待验证” for sources awaiting a manual check, and tab cleanup after stopping.
4. **提交各商店 / Submit**：按上表上传对应的包。首次提交按上文填写文案、权限、隐私字段，上传图标与截图；之后的更新只上传新包，文案按需修改。提交前 `privacy.html` 必须能在公开 URL 访问。由维护者提交、处理审核意见并选择发布时间。Upload the package listed for each store. The first submission needs the listing text, permission and privacy answers, icon and screenshots; later updates upload the new package and edit the listing only as needed. `privacy.html` must be reachable at its public URL first. The maintainer submits, answers review feedback and chooses publication timing.
5. **更新 ZIP / Ship the offline ZIP**：把新的离线 ZIP 与源码、文档改动一起合并到 master，保留所有旧离线包，已有下载链接继续有效。Merge the new offline ZIP with the source and doc changes and keep every earlier offline ZIP so existing links keep working.
6. **商店公开后 / After a listing goes live**：把 URL 填入 `src/helper-stores.js`，再运行一次 `pack.py` 更新 README 的商店列表；刷新 `index.html` import map 里 `helper-stores.js` 的 `?v=`。站点按访客浏览器显示对应商店，Opera 未上架时用 Chrome 网上应用店；Chromium 浏览器同时保留离线 ZIP 和步骤，Firefox 只能从商店安装。Set the live URL in `src/helper-stores.js`, rerun `pack.py` for the README store lists, and bump `helper-stores.js` in the `index.html` import map. The site offers each visitor's store, the Chrome Web Store for Opera until Opera is listed, and keeps the offline ZIP and steps for Chromium browsers.
7. **推送期间的旧版本 / Older versions during rollout**：各商店审核和自动更新到达的时间不同，访客会有一段时间装着旧版本。插件每次回报都带版本号：可选功能按 `src/render.js` 的 `HELPER_FEATURES` 判断（例如单源重试需要 1.3.3），旧版本继续提供它能返回的字段；只有所有访客都必须升级时才手动提高 `MIN_HELPER_VERSION`，页面随即提示“请更新”。新功能需要新版插件时，在 `HELPER_FEATURES` 记下首个版本，不要提高最低版本。商店提供延迟发布或逐步推送时，先观察实际查询与失败反馈再扩大范围。Stores review and update installs at different times, so visitors run older versions for a while. Every helper report carries its version: optional features are gated by `HELPER_FEATURES` in `src/render.js` (single-source retry needs 1.3.3), and older helpers keep supplying the fields they return. Raise `MIN_HELPER_VERSION` by hand only when every visitor must upgrade; the page then asks for an update. Record a new feature's first version in `HELPER_FEATURES` instead of raising the minimum. Where a store offers deferred publication or staged rollout, watch real queries and failure reports before widening it.

## 参考 / References

- [Chrome 商店图片规范 / Supplying images](https://developer.chrome.com/docs/webstore/images)：128×128 图标内约 96×96 图形，四周透明；截图使用 1280×800。The 128×128 store icon uses approximately 96×96 artwork with transparent padding; screenshots use 1280×800.
- [Chrome 隐私字段 / Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) 与 [用户数据 FAQ / User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)：披露本机数据处理和受限浏览活动。Disclose local data handling and the limited browsing activity required by the feature.
- [Chrome 更新与逐步推送 / Update and rollout](https://developer.chrome.com/docs/webstore/update)：按商店当时提供的资格和发布选项操作。Use rollout and publication options available to the listing at release time.
- [Firefox 内置数据收集授权 / Firefox built-in data consent](https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/) 与 [AMO 附加组件政策 / Add-on policies](https://extensionworkshop.com/documentation/publish/add-on-policies/)：数据收集声明的类别和“传输”的定义。Data types and the definition of transmission for the declaration.
