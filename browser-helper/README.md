# Egress 浏览器扩展 v1.3.4

[隐私政策 / Privacy policy](https://blackslience-reaper.github.io/egress-observatory/privacy.html)

## 商店安装

一键安装，之后由浏览器自动更新：

<!-- helper-stores -->
- Chrome 网上应用店：Chrome、Brave、Vivaldi、Arc 等 Chromium 浏览器，待上架
- Microsoft Edge 加载项：Edge，待上架
- Firefox 附加组件：Firefox 140 及以上桌面版，待上架
- Opera 加载项：Opera，待上架；也可借助 Opera 的“Install Chrome Extensions”扩展从 Chrome 网上应用店安装
<!-- /helper-stores -->

## 离线安装

适用于 Chrome、Edge 等 Chromium 浏览器，供访问不了 Chrome 网上应用店或想先审查代码时使用：[下载 ZIP](https://blackslience-reaper.github.io/egress-observatory/downloads/egress-browser-helper-v1.3.4.zip)。

解压后，在 `chrome://extensions`（Edge 为 `edge://extensions`）开启开发者模式，加载 `browser-helper` 文件夹。离线安装不会自动更新：更新时替换原目录文件并点“重新加载”，再刷新 Egress 页面。点击“查询”或“重新检测”触发读取。

Firefox 正式版只能长期安装签名过的扩展，请从 Firefox 附加组件安装。开发调试时，在 `about:debugging` 的“此 Firefox”中点“临时载入附加组件”，选择 `pack.py` 生成的 `dist/egress-browser-helper-v<版本>-firefox.zip`；重启 Firefox 后失效。

## 说明

覆盖 18 个来源：IPSuper、IPinfo、IP2Location、IPRegistry、ip-api.com、IPData、AbuseIPDB、DB-IP、Proxycheck、IPQualityScore、ipapi.is、IPLocate、GeoIPLookup、IPHub、IPQuery、Blackbox、Scamalytics、GreyNoise。公开接口由插件直接请求，其余读取当前浏览器会话的结果页。ipapi.is 与 IPLocate 在网站接口成功或明确限流时跳过，避免重复消耗额度。

最多同时加载 3 个来源，临时标签归入“Egress 自动查询”。遇到人机验证时保留标签并释放并发名额，Egress 显示“去验证”。插件持续等待用户手动通过，然后自动读取、回传并重新评分。等待没有固定超时；“停止等待”、切换查询或关闭 Egress 页面会取消本轮并清理标签。扩展不操作验证码。

“查询详情”按来源区分插件、API 和服务器，记录 HTTP 状态、额度、连接超时、拒绝访问、目标不匹配或字段缺失以及耗时。验证通过仍缺少可识别字段时如实报告；网页可访问不等于取得类型。已读到的有效字段按数据库合并，未知字段不作为否定结论。

权限：tabs、tabGroups 创建和清理临时标签；scripting 读取这些标签内的公开结果。host_permissions 限于上述来源。ip-api.com 的免费接口使用 HTTP。登录 Cookie 留在浏览器内，插件不向 Egress 服务复制 Cookie、账号或 API key。

成功结果按来源与 IP 在内存缓存，原始成功时间后 10 分钟内可复用，最多 128 项，扩展后台（Chrome 为 Service Worker，Firefox 为后台脚本）停止后消失。page-extract.js、page-providers.js 与站点 src/ 对应文件同步，IP 校验复用 util.js。离线安装包包含 `browser-helper/` 下的运行文件、图标与本说明。

在仓库根目录运行 `python browser-helper/pack.py`（macOS / Linux 可用 `python3`），从 manifest 读取版本，同步下载链接、标题和商店链接，生成 `downloads/` 离线 ZIP 和 `dist/` 中各浏览器的上传 ZIP：`-chrome.zip` 用于 Chrome 网上应用店、Edge 加载项与 Opera 加载项，`-firefox.zip` 用于 Firefox 附加组件。商店包的根目录直接包含 manifest，省略 README。

两种包的代码相同，`manifest.firefox.json` 以 JSON Merge Patch 改写 manifest：后台改用 `background.scripts`；本地页面匹配不带端口的 `127.0.0.1` / `localhost`，因为 Firefox 的匹配模式不认端口，后台仍只接受 4187 端口发来的消息；扩展页 CSP 去掉 Firefox 默认的 `upgrade-insecure-requests`，否则 ip-api.com 的 HTTP 接口会被升级为 HTTPS 并返回 403；另加 gecko ID、最低版本 140 和数据收集声明。维护者发布材料见仓库中的 [STORE.md](https://github.com/BlackSlience-Reaper/egress-observatory/blob/master/browser-helper/STORE.md)。

v1.3.4 修复 Cloudflare 验证页已带 403 状态加载完成、提示文字尚未显示时被误报为“拒绝访问”：插件现在继续等待，随后显示“待验证”。新增 Firefox 包，在 Firefox 159 上跑通查询、人机验证等待、临时分组与停止后清理。

v1.3.3 修复手动验证通过后来源页仍报“拒绝访问”：Cloudflare 放行后短暂显示的过渡页带 403 状态，插件现在继续等待结果页。插件行里失败的格子可以点击，单独重新读取该来源，不打断正在进行的查询。

v1.3.2 加入扩展图标和隐私政策链接，功能不变。

v1.3.1 修复 IPData 的卡片布局，读取 ASN、公司、信任分与风险徽记；信任分保留原意。IPQS 从目标结果区读取风险分、VPN、代理与 Tor，缺失字段逐项说明。插件直接返回解析异常，页面仍在加载外部资源时也会尝试读取。查询时可复用已打开的相同 IP 结果页，用户原有标签始终保留。
