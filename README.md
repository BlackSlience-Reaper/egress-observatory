<div align="center">

# Egress · IP 纯净度检测

打开即检测本机出口 IP，给出一个能说清每一分扣在哪里的质量分。

[![在线使用](https://img.shields.io/badge/%E5%9C%A8%E7%BA%BF%E4%BD%BF%E7%94%A8-Egress-2563eb)](https://blackslience-reaper.github.io/egress-observatory/)
[![CI](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/ci.yml)
[![Stars](https://img.shields.io/github/stars/BlackSlience-Reaper/egress-observatory?style=flat)](https://github.com/BlackSlience-Reaper/egress-observatory/stargazers)
[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue)](LICENSE)
[![爱发电](https://img.shields.io/badge/%E7%88%B1%E5%8F%91%E7%94%B5-%E8%B5%9E%E5%8A%A9-946ce6)](https://ifdian.net/a/Harukili)

**v2.0 · 2026-11-05**

[**打开网站**](https://blackslience-reaper.github.io/egress-observatory/) · [评分规则](SCORING.md) · [数据来源](DATA-SOURCES.md) · [浏览器扩展](browser-helper/README.md) · [参与开发](CONTRIBUTING.md)

</div>

Egress 联合 20 多个 IP 数据库、16 个 DNS 黑名单、17 个威胁、代理与机房列表、同 /24 邻居和整个 ASN 的信誉，再用你当前的浏览器和网络实测 WebRTC、DNS、TCP 指纹、IPv6、Cloudflare Turnstile 与 Google reCAPTCHA。

- **多源交叉**：同一底层数据库只计一份权重，避免重复投票。
- **结果可解释**：每一项扣分都保留来源和原因。
- **边查边更新**：结果到达即重新评分，失败的来源逐个显示原因。
- **无需账号**：页面没有账号或第三方统计，导出报告在浏览器本地生成；共享人数估计只保存加盐哈希（见[隐私](#隐私)）。

> 分数是基于公开数据的估计，不代表任何网站的真实风控结论。

## 用法

- 打开页面自动识别本机出口并检测；**测本机出口** 按钮随时重新识别（切换代理节点后用它）。
- 输入任意公网 IPv4 / IPv6 查询别人的地址；此时只计算 IP 信誉，连接实测不适用。`?ip=1.2.3.4` 可直接分享。
- **隐藏 IP** 遮住页面上所有地址，方便截图；**导出报告** 生成本地 JSON，隐藏状态下 IP 一并打码。

## 检测内容

| 部分 | 内容 |
| --- | --- |
| IP 情报库 | IPinfo（权重最高）、Proxycheck、ip-api.com、IP2Location、DB-IP（经后端）；IPLocate、GeoIPLookup、TechnikNews IPgeo（主来源失败时补充）；可选 IPQualityScore、Scamalytics、IPRegistry、IPData、vpnapi.io、IPHub、GetIPIntel、AbuseIPDB（需各自 key）；IPQuery、ipapi.is、IPinfo、ipwho.is、IP.SB、ipleak（MaxMind）、GeoJS、ipapi.co、iplocation.net、FreeIPAPI、GeoLite2（RIPEstat）、Blackbox v3 beta、Cloudflare（仅本机） |
| 注册与路由 | RDAP（各 RIR）、ip.guide、Net Atlas（IPtoASN / DB-IP City Lite）、RIR 分配记录、RIPEstat 前缀 / 路由 / RPKI、PeeringDB、RDAP autnum |
| 威胁与扫描 | Shodan InternetDB（端口与代理标签）、StopForumSpam、Tor Project Onionoo、AlienVault OTX、PTR 反查；可选 GreyNoise、CrowdSec CTI、VirusTotal、AbuseIPDB |
| 黑名单 | SpamCop、Barracuda、PSBL、Mailspike、UCEPROTECT、GBUdb、NordSpam、JustSpam、SEM、SPFBL、0spam、InterServer、blocklist.de、S5H、DroneBL、dan.me.uk Tor（经 DNS-over-HTTPS） |
| 列表 | FireHOL Level 1/2/3、IPsum（≥3 个黑名单）、blocklist.de、GreenSnow、CyberCrime、ET 已入侵主机、CINS Army、BotScout、StopForumSpam 7 天、DShield 攻击网段、公开 SOCKS / HTTPS 代理、Tor 出口、X4BNet 机房段与 VPN 段（IPv4） |
| 邻居与 ASN 信誉 | 同 /24 其他地址的上榜数、整段是否被列入、同段 Tor 中继；整个 ASN 宣告空间的滥用密度与全网平均之比 |
| 多源 IP 类型 | 各库给出的使用类型（家宽 / 移动 / 商业 / 机房…）与公司类型，逐源对照 |
| ASN 画像 | 推断网络类型（运营商 / 移动 / 机房 / CDN / 骨干 / 企业 / 教育）、PeeringDB 自报、宣告规模、注册日期、RPKI、可选 Cloudflare Radar 机器流量占比、地址段租赁判断 |
| 连接实测 | 各网站看到的出口、WebRTC、DNS 解析器与 EDNS 子网、TCP/IP SYN 指纹、时区与语言、IPv6、Cloudflare WARP、Turnstile、reCAPTCHA v3 |

间接补充的来源和取舍依据见 [DATA-SOURCES.md](DATA-SOURCES.md)：TechnikNews IPgeo 只在本轮主 ip-api 查询失败后补充；Blackbox 使用公开 v3 beta 的分项分类，替换含义过宽的 Y/N 判断；Net Atlas 补充网络归属、前缀与 DB-IP City Lite 地理数据，同库按字段去重。

## 评分

评分以安全为主：IP 自身记录、邻居和 ASN 信誉权重最高；基准 92 分，正面证据最多加 10 分。完整规则见 [SCORING.md](SCORING.md)。

**ASN 交叉核对**作为低权重提示：IP 被数据库标成家宽，但宣告它的 ASN 被推断为机房或 CDN，会单独扣分并在“ASN 一致性”里说明原因；骨干网只提示、不扣分；子分配给其他公司、近期登记或由 IP 租赁平台管理的地址段标为“租赁 / 转售”。

网页中的明确 VPN、代理、Tor、机房、中继、爬虫和滥用标记进入现有加权投票，明确的 0–100 风险分进入风险评分。IPSuper 的逐库风险矩阵也会自动补充这些字段；未支持和获取失败的格子不投票。IPQS、Scamalytics、AbuseIPDB 的具名风险分用于评分，其他条形百分比保留原意。官网、Chrome、IPSuper 和 IPOK 的同库结果合并，只保留一份来源权重，返回字段时立即重新计算总分和用途评分。

## 浏览器扩展 v1.3.5（可选）

不安装也能使用：网站默认在云端读取 IPSuper 的逐库类型、风险分和风险矩阵，供所有访客自动补全。

**商店安装**（一键安装，自动更新）：

<!-- helper-stores -->
- Chrome 网上应用店：Chrome、Brave、Vivaldi、Arc 等 Chromium 浏览器，待上架
- Microsoft Edge 加载项：Edge，待上架
- Firefox 附加组件：Firefox 140 及以上桌面版，待上架
- Opera 加载项：Opera，待上架；也可借助 Opera 的“Install Chrome Extensions”扩展从 Chrome 网上应用店安装
<!-- /helper-stores -->

**离线安装**（访问不了 Chrome 网上应用店，或想先审查代码时）：[**下载 Chrome 扩展 v1.3.5（ZIP）**](https://blackslience-reaper.github.io/egress-observatory/downloads/egress-browser-helper-v1.3.5.zip)，在扩展管理页开启开发者模式后加载解压出的 `browser-helper` 文件夹，详见[安装说明](browser-helper/README.md)。离线包适用于 Chrome、Edge 等 Chromium 浏览器；Firefox 只能安装商店签名的版本。

[扩展隐私政策](https://blackslience-reaper.github.io/egress-observatory/privacy.html)

扩展使用访客当前的浏览器会话增强本机结果，覆盖 18 个来源，补齐接口缺失的字段：

- 安装后，“查询”和“重新检测”会自动建立临时标签组，最多同时打开 3 个来源查询页，逐个读取目标字段后关闭标签；每读到一个就合并进结果，不需要逐次导入。
- 不向服务器复制 Cookie。页面显示插件的逐源自动读取状态，并逐源显示失败原因。
- 遇到人机验证时点“去验证”手动完成；插件持续等待，通过后自动补充并重新评分。
- 点“停止等待”、切换查询或关闭检测页会取消本轮并清理该页发起的临时标签，其他标签保持原状。

安装包保存在仓库 `downloads/`，包含完整的 `browser-helper/` 文件夹；网页“多源 IP 类型”区也提供下载和安装说明。

维护者在仓库根目录运行 `python browser-helper/pack.py`，即可从同一份源码和 manifest 版本生成离线包和各浏览器的商店上传包，并同步页面与文档中的版本和商店链接。商店文案、权限披露和发布步骤见 [STORE.md](browser-helper/STORE.md)。

## 自动代码审查

[OpenAI PR Review](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/openai-review.yml) 在具备仓库写权限的触发者更新同仓库非草稿 PR 时自动运行，固定使用 `gpt-6-astra`、Medium 推理强度，并以 `github-actions[bot]` 发布绑定实际 head commit 的 GitHub Review。新提交会取消旧运行，过期、已关闭或已转为草稿的 PR 不发布报告；审查只发表意见，不批准或合并 PR。

仓库管理员在 [Actions Secrets](https://github.com/BlackSlience-Reaper/egress-observatory/settings/secrets/actions) 配置专用的 `OPENAI_API_KEY` 后生效，调用计入该 key 所属 OpenAI API 项目。缺少密钥时工作流摘要会明确显示待配置并跳过审查。维护者也可在工作流页面点击 **Run workflow**，输入 PR 编号手动运行；fork PR 使用这个维护者入口。

审查规则保存在 [`.github/codex/review.md`](.github/codex/review.md)，从默认分支读取。审查 job 对代码只读、禁止联网和执行项目代码，发布 job 独立运行且不接触 OpenAI 密钥；默认仅有仓库写权限的触发者可以调用模型。报告区分静态证据与实际运行，遵守不新增、不运行测试的项目规则。GitHub 自动审查与 OpenAI Platform 中保存的 Agent 定义分别配置。

## 使用自己的 API key

IPinfo、IPRegistry、IPData、vpnapi.io 和 ipapi.is 允许浏览器直接调用。在页面的“多源 IP 类型 → 使用自己的 API key”里填入 key 后，这些来源由你的浏览器直接查询，用的是你自己的额度。

- key 只发给对应的服务，不经过 Egress 的后端，也不会进入分享链接和导出报告。
- 默认只保留到关闭标签页；勾选“记住”后保存在这个浏览器，随时可以清除。清除时，用 key 查到的结果也会一起删除。
- 页面会加载 Cloudflare 和 Google 的验证脚本，它们和页面运行在同一环境，所以请使用额度受限、可随时作废的专用 key。

Proxycheck、IPQualityScore、AbuseIPDB、GreyNoise、IPHub 和 VirusTotal 不允许浏览器直接调用，无法这样使用。

## 本地运行

需要 Python 3.12 或更新版本；网站使用原生 JavaScript，无需 npm 安装或构建。

macOS / Linux：

```bash
python3 local_server.py
```

Windows（也可以双击“启动网站.cmd”）：

```powershell
python local_server.py
```

打开 <http://127.0.0.1:4187/> 。页面在 4187 端口，本机查询服务在 4188 端口，都只监听 `127.0.0.1`。线上接口只接受 GitHub Pages 和本地 4187 端口的跨域请求，所以本地开发请使用这个端口。加 `?captchaTest=1`（仅本地）会用 Cloudflare 的测试 key 跑一遍 Turnstile 流程，结果恒为通过。

本地的“查询”还需要 Playwright 和 Chromium，首次安装（macOS / Linux 上用 `python3`）：

```bash
python -m pip install -r requirements.txt
python -m playwright install chromium
```

本机查询服务默认用这台电脑的出口打开来源网页。要换一个出口，启动前设置 `EGRESS_LOOKUP_PROXY`，写成 `http://主机:端口`、`http://用户名:密码@主机:端口` 或不带认证的 `socks5://主机:端口`。启动时窗口会显示正在使用的代理，不显示用户名和密码。Windows 上也可以把它设成用户环境变量，双击“启动网站.cmd”时同样生效。

```powershell
$env:EGRESS_LOOKUP_PROXY = "http://127.0.0.1:7890"
python local_server.py
```

这个设置只管 4188 端口的网页查询。页面里的其他请求走浏览器自己的网络；要一起换出口，需要给浏览器单独设代理，并阻止 WebRTC 绕过代理，例如 Chrome 的 `--proxy-server` 和 `--force-webrtc-ip-handling-policy=disable_non_proxied_udp`。

交付以用户入口的实际行为为依据，记录页面、命令或 Actions 的操作与结果。`tests/` 作为历史资产保留，不运行测试或将测试结果作为完成条件。

## 配置

`config.js` 只放公开值：后端地址、Turnstile site key、reCAPTCHA site key。key 留空时对应实测显示“未配置”，不影响其他评分。两个 key 都要登记这些域名：`blackslience-reaper.github.io`、`127.0.0.1`、`localhost`。密钥只放在后端运行环境，不进入这个仓库。

后端状态查询遇到连接失败会重试一次；“重新检测”和人机验证的“再测一次”会重新检查后端。状态查询失败时，Radar 和验证码仍会尝试各自接口，连接失败按实际错误显示。Google 脚本加载、初始化、执行和服务端校验均有超时，失败后保留重试按钮；只有后端明确返回缺少密钥时才显示“未配置”。

## 架构

| 组件 | 位置 | 上线方式 |
| --- | --- | --- |
| 网站 | 仓库根目录，GitHub Pages | 维护者手动运行 Deploy Pages，发布选定的 `master` commit |
| 浏览器扩展 | `browser-helper/`，打包到 `downloads/` 与各浏览器商店 | 访客从商店或离线 ZIP 安装 |
| 本机查询服务 | `local_server.py`、`provider_pages.py` | 只在本地运行 |
| 线上后端 | 单独维护，不在这个仓库 | 由维护者部署；页面通过 `config.js` 里的公开地址调用 |

### 代码结构

| 路径 | 作用 |
| --- | --- |
| `src/main.js` | 编排：识别出口、并发查询、结果到达即重新评分 |
| `src/sources.js` | 各数据源适配器，统一成同一结构；未返回的字段保持 `null`，不当作“否” |
| `src/blocklists.js` | DNS 黑名单（DoH）与 CIDR 列表 |
| `src/asn.js` | ASN 档案、类型推断与租赁判断 |
| `src/probes.js`、`src/captcha.js` | 连接实测与人机验证 |
| `src/score.js` | 评分引擎，保留每项扣分的来源与解释 |
| `src/render.js`、`styles.css` | 页面呈现 |
| `src/page-lookups.js`、`src/provider-pages.js`、`src/page-extract.js`、`src/page-providers.js`、`src/ipinfo-page.js`、`src/ipsuper.js`、`src/supplements.js` | 来源网页读取与第三方补全 |
| `local_server.py`、`provider_pages.py` | 本机启动器与来源网页读取 |
| `browser-helper/` | 浏览器扩展（Chrome、Edge、Firefox） |
| `tests/` | 历史测试资产，保留且不作为交付依据 |

### 网页补全

接口字段不足时，Egress 从来源网页补齐。这些路径的结果都会逐源校验目标 IP，只补充缺失字段；同库结果合并为一条记录。

**查询路径**

- **IPinfo 与 IPSuper**：点击“查询”后，服务并行读取该 IP 的 IPinfo 详情页与 IPSuper 多库表，各自校验目标地址并补充缺失字段。同一 IP 的页面结果在内存保留 10 分钟。IPinfo 网页和官方接口合并为一条数据库记录；IPSuper 补充的类型按原库名标识。
- **其他来源**：字段不足时，查询服务进一步尝试 IPHub、IPQualityScore、IPData、IPRegistry、DB-IP、Scamalytics、ipapi.is、IPQuery 和 Blackbox 的固定查询入口。每页核对目标 IP；网页与接口仍为同一条来源记录。受校验、额度或网络限制时逐源保留原因，已有接口结果继续展示。
- **IPOK**：与已有公开接口同时提供间接补充；第三方失败或额度不足时保留原因。
- **手动导入**：多源类型区的“从来源网页补全”提供书签与报告导入入口，支持在访客已打开的官方结果页读取字段。
- **IPHub 的特殊处理**：block 0 显示“家宽或商业”，不增加家宽投票；网页未提供类型时保留未知。

**连接与恢复**

- GitHub Pages 上的页面经后端读取来源网页，访客只需打开网站并查询。服务休眠后的首次请求可能需要等待唤醒。
- 云端查询按访客的出口 IP 限制频率。相同来源和 IP 的并发请求合并，成功报告从原始观察时间起最多保留 10 分钟。
- 前端在连接中断和临时服务错误时有限重试；超过查询频率时显示等待原因并停止重试。整轮最长 4 分钟，切换查询会取消旧请求。状态栏显示连接与重试进度，失败保留具体原因。
- 本地页面优先使用 4188 服务，连接失败后使用同一线上入口。

## 隐私

被检测的 IP 会发送给上面列出的数据服务；连接实测会让浏览器访问 STUN、bash.ws、ip-api EDNS、tcpip.incolumitas.com、Cloudflare 与 Google。页面没有账号或第三方统计，导出报告在浏览器本地生成。为了估计共享人数，本站 API 会记录每次检测的目标 IP 与查询方，查询方只以加盐哈希保存（盐值随机生成、只存在服务端数据库），不保存查询者 IP 或浏览器标识原文；超过 30 天的记录不再计入，并在之后任何一次检测时删除；浏览器里保存一个随机生成的匿名标识。你在页面上填写的 API key 只保存在浏览器里，只发送给对应的服务。

## 参与开发

任务统一放在 [Issues](https://github.com/BlackSlience-Reaper/egress-observatory/issues)，通过 PR 合入，`master` 受保护。反馈问题或提议新数据源时请[选择对应模板](https://github.com/BlackSlience-Reaper/egress-observatory/issues/new/choose)，并注意不要公开真实 IP。

线上后端不在这个仓库，参与开发不需要后端权限或 key。环境配置（含 Windows）、分支约定和各模块的改动要求见 [CONTRIBUTING.md](CONTRIBUTING.md)。

### Agent 开发入口

仓库规则统一维护在 [AGENTS.md](AGENTS.md)，Claude 和 Copilot 入口引用同一份规则。Codex 项目技能提供 `$egress-change`（开发、修复与交接）和 `$egress-release`（扩展打包与发布）；可直接在仓库内调用，示例和证据格式见 [Agent 工作流](docs/agent-workflow.md)。

GitHub Actions 提供 PR 自动范围标签、Copilot 的 Python/Chromium 环境准备，以及 [扩展 draft Release](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/helper-release.yml) 入口。Dependabot 每周检查 Actions 与 Python 依赖。默认分支保留 PR、squash 历史和讨论解决规则，交付记录实际调用入口及观察结果。

网站发布从 [Deploy Pages → Run workflow](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/deploy-page.yml) 手动运行，分支选择 `master`。合并和 push 均不触发网站部署。

## Star History

下图由 Star History 动态接口提供，会自动更新，无需定期修改 README。图片服务与 GitHub 的缓存可能延迟展示；点击图表可打开交互页面。

<a href="https://www.star-history.com/?type=date&repos=BlackSlience-Reaper%2Fegress-observatory">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=BlackSlience-Reaper/egress-observatory&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=BlackSlience-Reaper/egress-observatory&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=BlackSlience-Reaper/egress-observatory&type=date&legend=top-left" />
 </picture>
</a>

## 联系与合作

广告投放、数据合作或其他合作，请在 X 上联系 [@BlackSlience](https://x.com/BlackSlience)。问题反馈和功能建议请走 [Issues](https://github.com/BlackSlience-Reaper/egress-observatory/issues)；安全问题不要公开，请通过[私密漏洞报告](https://github.com/BlackSlience-Reaper/egress-observatory/security/advisories/new)提交。

## 赞助

如果 Egress 帮到了你，可以在爱发电支持项目的开发：

[![在爱发电赞助](https://img.shields.io/badge/%E5%9C%A8%E7%88%B1%E5%8F%91%E7%94%B5%E8%B5%9E%E5%8A%A9-ifdian.net%2Fa%2FHarukili-946ce6?style=for-the-badge)](https://ifdian.net/a/Harukili)

点一个 Star、反馈问题或提交 PR，同样是很大的支持。

### 捐赠 API key

页面上显示“未配置”的来源缺少 key。如果你有多余的额度，可以捐赠给项目，让所有访客都能用上这些数据：

1. 确认该服务的条款允许共享 key。如果不允许，可以通过爱发电赞助，由作者自己购买额度。
2. 为 Egress 单独创建一个 key，并设好额度上限。捐赠的 key 会被所有访客的查询消耗。
3. 在 X 上私信 [@BlackSlience](https://x.com/BlackSlience)。**不要发在 Issue、PR 或任何公开的地方**；已经公开的 key 请立即作废。

key 只保存在后端运行环境，不会进入这个仓库，你可以随时作废它。同一个来源目前只使用一个 key。

## 许可证

本项目按 [GNU General Public License v3.0](LICENSE) 授权。各数据源的服务条款和署名要求仍然适用，例如页面保留“IP Geolocation by DB-IP”署名。
