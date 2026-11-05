# 商店发布材料 / Store listing materials

适用于 Chrome Web Store 与 Microsoft Edge Add-ons。商店尚未发布，`src/helper-stores.js` 中的 URL 均为 `null`。开发者账号注册、付款、身份核验和提交由维护者本人完成。Firefox 打包与 AMO 提交属于独立的 [#28](https://github.com/BlackSlience-Reaper/egress-observatory/issues/28)，此处的 Chrome ZIP 不用于 AMO。

For Chrome Web Store and Microsoft Edge Add-ons. Store listings are pending; all URLs in `src/helper-stores.js` are `null`. The maintainer handles account registration, payment, identity verification and submission personally. Firefox packaging and AMO submission belong to [#28](https://github.com/BlackSlience-Reaper/egress-observatory/issues/28); do not upload this Chrome ZIP to AMO.

## 中文文案

**名称**：Egress 自动网页查询

**简短说明**（少于 132 个字符）：为 Egress 补充 18 个 IP 情报来源，逐源展示类型与风险；人机验证手动完成，临时标签自动清理。

**详细说明**：

Egress 自动网页查询为 Egress IP 质量检测页面补充公开情报。扩展随 Egress 查询访问 18 个固定来源，从匹配目标 IP 的结果页或公开 JSON 接口中读取网络归属、位置、ASN、使用类型、公司类型、VPN / 代理 / Tor 等标记，以及来源提供的风险分和信任分。

结果逐源回到发起查询的页面，补齐已有数据库记录；查询详情显示读取状态、失败原因与耗时。支持 IPv4 和 IPv6，实际字段和可用性取决于来源。

扩展使用当前浏览器会话访问来源页面，尽量复用已打开的同一目标结果页，用户原有标签保持原状。新建标签归入“Egress 自动查询”临时组，读取完成后关闭；停止等待、切换查询或离开、关闭发起页面会清理本轮创建的标签。遇到人机验证时，点击 Egress 的“去验证”并手动完成；扩展保留该标签等待，通过后继续读取。扩展不会点击、求解或绕过验证码，也不保证绕过来源的登录、额度或访问限制。

目标 IP 会发送到指定查询来源，提取结果只返回发起查询的 Egress 标签页。扩展不读取或导出 Cookie、账号凭据或 API key；来源页仍由浏览器按正常规则使用自身会话。公开 JSON 请求不带浏览器会话凭据。成功结果按来源和 IP 在内存中最多保留 128 项，在原始成功时间后 10 分钟内可复用；Service Worker 停止后缓存消失。扩展没有统计、遥测、广告追踪或数据销售。

安装后打开 https://blackslience-reaper.github.io/egress-observatory/ ，刷新页面并点击“查询”或“重新检测”。该页面也提供离线 ZIP 与安装步骤。Chrome 与 Edge 使用同一份运行代码；Firefox 支持另行准备。

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

The target IP is sent to the specified lookup providers. Extracted results return only to the Egress tab that started the query. The extension does not read or export cookies, account credentials or API keys. Provider pages retain their normal browser-managed sessions; public JSON requests omit browser session credentials. Successful results are cached by provider and IP in memory, up to 128 entries, and reused for 10 minutes from their original success timestamp. Cache data disappears when the service worker stops. The extension has no analytics, telemetry, ad tracking or data sales.

After installation, open https://blackslience-reaper.github.io/egress-observatory/ , refresh the page and start a query or rerun detection. The page also provides an offline ZIP and installation steps. Chrome and Edge use the same runtime package. Firefox support is being prepared separately.

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

## 截图清单 / Screenshot checklist

每张 1280×800 PNG，直角、满幅，无额外边框或留白，使用实际界面。拍摄前开启“隐藏 IP”，检查地址栏、标签标题、悬浮提示和报告字段，确保没有真实 IP、凭据或私人内容。示意地址只用 `203.0.113.10`，截图不得伪造来源结果或商店可用状态。

Use real UI captures, each a full-bleed 1280×800 PNG with square corners and no added padding. Enable IP masking and inspect the address bar, tab titles, tooltips and report fields for actual IPs, credentials and private content. Use only `203.0.113.10` for illustrative addresses; do not fabricate provider results or store availability.

1. **多源类型 / Multi-source types**：展示“多源 IP 类型”中的实际插件字段与插件连接状态，让用户看到扩展补齐的使用类型与公司类型。Show actual helper-supplied usage/company fields and the connected helper status.
2. **逐源查询详情 / Per-provider query details**：展开“查询详情”，展示插件、API 与服务器通道，以及成功、失败原因和耗时。Expand query details to show helper, API and server channels with real outcomes and timing.
3. **手动验证等待 / Manual verification wait**：出现真实验证等待时，展示 Egress 的“去验证”和“停止等待”入口；不拍摄验证码解题内容。Show the real pending-verification state and its verification/stop controls without capturing challenge solutions.
4. **临时查询组 / Temporary query group**：展示“Egress 自动查询”组和读取中的临时页，遮去所有真实目标地址；配合说明读取后自动关闭，用户原有标签保留。Show the temporary query group during extraction with actual target addresses hidden; explain automatic cleanup and preservation of existing tabs.
5. **安装与隐私 / Installation and privacy**：展示页面的安装步骤、离线 ZIP 与页脚隐私入口；商店上线后再拍摄实际浏览器对应商店入口。Show installation steps, the offline ZIP and the footer privacy link; capture a browser-specific store link only after its listing is live.

## 发布步骤 / Release steps

1. 在 `browser-helper/manifest.json` 提升 `version`；本次准备保留当前版本。维护者本人完成 Chrome / Edge 账号注册、付款与身份核验。Increase the manifest version for the next release. This preparation keeps the current version. Account registration, payment and identity verification are handled personally by the maintainer.
2. 在仓库根目录运行 `python browser-helper/pack.py`（macOS / Linux 可用 `python3`）。脚本仅用标准库，从 manifest 取版本，同步网站下载标签与链接、两个 README 标题和链接。网站需要新版插件时，再手动提高 `src/render.js` 的 `MIN_HELPER_VERSION` 并刷新 `render.js` → `main.js` → `index.html` 的 `?v=`。Run the packer from the repository root; it synchronizes the download link and README version references using only the Python standard library. Raise `MIN_HELPER_VERSION` by hand only when the site needs a newer helper.
3. 取得 `dist/egress-browser-helper-v<version>-chrome.zip`，分别上传到 Chrome Web Store 与 Edge Add-ons。包根目录含 `manifest.json`，不含 README、打包脚本或本文。按上方文案填写各项权限和隐私字段，上传图标与实际截图。Upload the same root-manifest ZIP to Chrome Web Store and Edge Add-ons, then enter the listing, permission and privacy information and upload the icon and actual screenshots.
4. 提交商店前，先让 `privacy.html` 在公开 URL 可访问。由维护者提交、处理审核意见并选择发布时间；本任务不执行账号或提交操作。Make the public privacy-policy URL reachable before submission. The maintainer submits, handles review feedback and chooses publication timing.
5. 将 `downloads/egress-browser-helper-v<version>.zip` 与相应源码、文档改动纳入后续发布提交，保留已有离线包（包括全部已有 1.3.x 包）；`dist/` 已忽略。离线包保留顶层 `browser-helper/`，只含运行文件、图标和 README。In the eventual release commit, include the new offline ZIP and corresponding source/docs, preserve all earlier offline packages including every existing 1.3.x ZIP, and leave `dist/` untracked.
6. 商店实际公开后，把对应 URL 填入 `src/helper-stores.js`，刷新所有引用它的 `?v=` 并沿导入链刷新到 `index.html`。Chrome 系浏览器显示 Chrome 商店，Edge 显示 Edge 加载项；未配置或未支持的浏览器保留现有离线入口。离线 ZIP 与安装说明始终可用。After publication, set each live store URL and bump its import URL and all importing modules through the HTML entry point. Keep the offline ZIP and installation instructions available.
7. 两个商店的审核与自动更新可能不同步。采用商店提供的延迟发布或逐步推送能力时，先观察实际查询与失败反馈，再扩大覆盖；Chrome 的部分推送仅在商店满足资格时可选。页面用数字版本比较提示低于最低版本的安装，仍继续读取旧版本能返回的字段。`MIN_HELPER_VERSION` 只在网站确实需要所有用户升级时手动提高。Offline ZIP 可供尚未收到商店更新的用户手动更新，商店安装的扩展仍由其商店更新。Reviews and automatic updates can arrive at different times. Use deferred publication or staged rollout where available, observe real query behavior before expanding rollout, and retain older-result compatibility. Chrome partial rollout is subject to store eligibility. `MIN_HELPER_VERSION` is raised by hand only when every user must upgrade. Store installations update through their store; the offline ZIP remains a manual fallback.

## 参考 / References

- [Chrome 商店图片规范 / Supplying images](https://developer.chrome.com/docs/webstore/images)：128×128 图标内约 96×96 图形，四周透明；截图使用 1280×800。The 128×128 store icon uses approximately 96×96 artwork with transparent padding; screenshots use 1280×800.
- [Chrome 隐私字段 / Privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy) 与 [用户数据 FAQ / User Data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)：披露本机数据处理和受限浏览活动。Disclose local data handling and the limited browsing activity required by the feature.
- [Chrome 更新与逐步推送 / Update and rollout](https://developer.chrome.com/docs/webstore/update)：按商店当时提供的资格和发布选项操作。Use rollout and publication options available to the listing at release time.
