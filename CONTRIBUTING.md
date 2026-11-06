# 参与开发

任务统一放在 [Issues](https://github.com/BlackSlience-Reaper/egress-observatory/issues)，通过 PR 完成。`master` 受保护，任何人（包括仓库管理员）都不能直接推送。

网站使用手动部署：维护者在 [Deploy Pages](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/deploy-page.yml) 点击 **Run workflow**，选择 `master` 后发布该次选定的 commit。合并和 push 不触发部署；agent 只有在用户主动要求发布时才运行此入口。

## 工作流

1. **建 issue**：在 [新建页面](https://github.com/BlackSlience-Reaper/egress-observatory/issues/new/choose) 选一个模板，自己要做的工作选“开发任务”。
2. **开分支**：从最新的 `master` 拉出，分支名用 `Harukili/<issue 编号>-<简短描述>`；用户直接布置且没有 Issue 时可省略编号。
3. **提 PR**：按模板填写，正文写 `Closes #编号`，合并时 issue 会自动关闭。
4. **合并**：记录实际入口的操作和结果、解决 PR 讨论后 squash 合并，远程分支会自动删除。测试结果不作为合并门槛。

Agent 统一读取 [AGENTS.md](AGENTS.md)；项目技能、GitHub 自动化入口和交接格式见 [Agent 工作流](docs/agent-workflow.md)。用户直接布置的任务可在 PR 说明任务来源，无需另建 Issue。

常用命令（把 `12` 换成你的 issue 编号）：

```bash
gh issue develop 12 --base master --name Harukili/12-short-description --checkout
```

```bash
git push -u origin HEAD
```

```bash
gh pr create
```

```bash
gh pr merge --squash
```

合并后回到 `master` 并清理：

```bash
git switch master
git pull --prune
git branch -d Harukili/12-short-description
```

`git branch -d` 可能因为 squash 合并提示分支未合并；确认 PR 已合并后，可以换成 `git branch -D`。

### 多端开发

离开前把分支推上去，到另一台电脑继续：

```bash
git fetch
git switch Harukili/12-short-description
```

进度与未完成部分按 [交接格式](docs/agent-workflow.md#交付与交接记录) 记录；agent 发布 Issue/PR 消息须在当前任务授权内。别在两台电脑上同时改同一个分支；回来继续前先 `git pull`。

## 环境配置

需要 Git、[GitHub CLI](https://cli.github.com/) 和 Python 3.12 或更新版本。项目使用原生 ES modules，没有 npm 运行依赖或构建步骤。

### Windows

在 PowerShell 里安装工具：

```powershell
winget install Git.Git
winget install GitHub.cli
winget install Python.Python.3.12
```

重新打开终端后克隆并设置提交身份：

```powershell
gh auth login
gh repo clone BlackSlience-Reaper/egress-observatory
cd egress-observatory
git config user.name "你的名字"
git config user.email "<ID>+<用户名>@users.noreply.github.com"
```

运行本地站点（也可以双击 `启动网站.cmd`）：

```powershell
python local_server.py
```

邮箱建议用 GitHub 的 noreply 地址，可以在 [邮箱设置](https://github.com/settings/emails) 查到，这样提交记录既能关联账号，又不会暴露真实邮箱。

### macOS / Linux

```bash
python3 local_server.py
```

### 网页查询功能

本地的“查询”和网页补全还需要 Playwright 和 Chromium。Windows 上用 `python`，macOS / Linux 上用 `python3`：

```bash
python -m pip install -r requirements.txt
python -m playwright install chromium
```

### 本地页面与模拟模式

开发前端不需要后端权限，也不需要任何 key。

`local_server.py` 启动后打开 <http://127.0.0.1:4187/> 是普通本地页面：

- 它请求线上公开 API 和第三方接口，结果取决于网络和额度，并且和线上访客共用按 IP 计算的频率限制。
- 页面必须在 4187 端口上提供。线上 API 的 CORS 只放行 `127.0.0.1` 和 `localhost` 的 4187 端口，其他端口和 fork 托管的 GitHub Pages 都会被拒绝。
- 它不调用 `/v1/seen`，所以本地开发不会写进线上的共享人数记录，“共享人数估计”一项只依据 Proxycheck 的设备估计。

不想受这些限制，就在 `localhost` 或 `127.0.0.1` 上加 `?mock=1`：<http://127.0.0.1:4187/?mock=1>。所有数据请求都由 `src/mock-fixtures.js` 里手写的 fixture 回答，不需要线上服务、key 或外网，端口也不限。WebRTC、人机验证和 Chrome 插件不走 `fetch`，直接跳过；时区和语言也取自场景，所以同一场景在每台电脑上结果相同。页面顶部的横幅一直标明这是模拟状态。其他域名上这个参数不起作用，也不会加载 fixture。

用横幅上的链接或 `scenario` 参数切换场景：

| `scenario` | 场景 | 地址 |
| --- | --- | --- |
| `clean`（默认） | 干净家宽 | `203.0.113.10` |
| `datacenter` | 机房加代理 | `198.51.100.20` |
| `split` | 国内外分流：运营商 IP 被个别库标成代理，国内站点看到 `192.0.2.99` | `203.0.113.60` |
| `partial` | 部分来源失败 | `192.0.2.30` |
| `ratelimit` | 限流（429） | `203.0.113.40` |
| `timeout` | 来源超时，要等来源自己的超时时间（最长约 16 秒） | `203.0.113.50` |

模拟模式只接受文档保留地址，输入框里可以填其他文档保留地址，看“检测别人的 IP”时的页面。新增数据源时要在 fixture 里补上回答：没有 fixture 的请求一律返回 404，并在控制台打印警告，不会发到外网。

### 换行符

`.gitattributes` 已经统一了换行符：仓库内都是 LF，`.cmd`、`.bat`、`.ps1` 在工作区是 CRLF。不需要改 `core.autocrlf`。如果 PR 的 diff 显示整个文件都变了，通常是编辑器改了换行符，改回 LF 即可。

## 提交与 PR

- **一个 PR 解决一个 issue**，无关改动另开。
- **PR 标题就是 `master` 上的提交信息**（squash 合并，正文不进入提交信息）。用一句英文祈使句说明结果，例如 `Raise the bonus cap from 8 to 10`。
- **提供真实入口证据**：写明入口、环境、操作、实际结果及未观察范围。配置工作直接调用对应 CLI、GitHub Actions 或设置入口并读取产物。
- **不写、不新增、不维护、不修复、不运行测试或守门脚本**。保留 `tests/` 历史文件；既有结果不能作为完成证据或合并门槛。
- **PR 上的讨论要全部解决**才能合并。目前不要求审批，因为项目由一人维护，而 GitHub 不允许作者批准自己的 PR。

## 按改动范围的约定

### 页面与缓存

浏览器模块通过 `?v=` 版本号刷新缓存。改了哪个文件，就更新引用它的地方：`index.html` 里的 `styles.css` 和 `src/main.js`，以及其他模块 `import` 语句里的版本号。

### 评分

`src/score.js` 是纯函数：输入证据，输出分数和解释。改规则时同步 [SCORING.md](SCORING.md)，并从页面记录实际输入、扣分原因和导出证据。

### 数据源

- 适配器统一放在 `src/sources.js`。未返回的字段保持 `null`，不能当作“否”。
- 只采用实际返回、且与目标 IP 一致的字段。同一底层数据库合并计票。
- 同步 [README.md](README.md) 的检测内容；间接来源的依据写进 [DATA-SOURCES.md](DATA-SOURCES.md)。
- 调试需要 key 的来源时，可以在页面的“使用自己的 API key”里填自己的 key，不消耗项目额度。`?mock=1` 下不会使用这些 key，面板也会隐藏。
- 这类来源放在 `src/own-keys.js`，只能加入允许浏览器跨域调用的服务。key 不能经过后端，也不能进入结果、日志或导出报告。

### 后端

线上后端不在这个仓库，前端开发不需要后端权限或 key。需要新接口或改变接口行为时，在任务中描述想要的结果，由维护者处理。

### 本机查询服务

`local_server.py` 和 `provider_pages.py` 提供本机的网页查询（4188 端口）。改了这两个文件或 `src/page-extract.js` 时请在 PR 里说明，由维护者判断是否需要同步到线上。

### 浏览器扩展

`browser-helper/` 里的 `page-extract.js`、`page-providers.js` 和 `util.js` 必须与 `src/` 下的同名文件一致。发新版本时：

1. 升级 `browser-helper/manifest.json` 的 `version`。
2. 在仓库根目录重新打包：

   ```bash
   python3 browser-helper/pack.py
   ```

   Windows PowerShell：

   ```powershell
   python browser-helper/pack.py
   ```

3. 脚本会同步 `README.md`、`browser-helper/README.md`、`index.html` 的版本引用和 README 的商店列表。离线包在 `downloads/`，各浏览器上传包在忽略提交的 `dist/`：`-chrome.zip` 用于 Chrome、Edge 与 Opera，`-firefox.zip` 由 `browser-helper/manifest.firefox.json` 改写 manifest 后用于 Firefox；保留已有版本的离线 ZIP。
4. 网站用到新版插件才有的功能时，在 `src/render.js` 的 `HELPER_FEATURES` 记下该功能的首个版本，旧版本照常使用；只有所有访客都必须升级时，才手动提高 `MIN_HELPER_VERSION`。改了 `render.js` 记得沿导入链更新 `?v=`。商店文案与发布步骤见 [browser-helper/STORE.md](browser-helper/STORE.md)。

合并后可从 [Prepare Helper Release](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/helper-release.yml) 的 Run workflow 或 `gh workflow run helper-release.yml --ref master` 生成绑定 commit 的 GitHub draft Release，自定义附件仅包含离线包、Chrome/Firefox 商店包三个 ZIP。正式发布和商店上架分别执行；已存在的版本不会被工作流覆盖。

## 隐私与密钥

- **不要提交真实 IP**。代码、测试、文档和截图里统一使用文档保留地址：`192.0.2.0/24`、`198.51.100.0/24`、`203.0.113.0/24`、`2001:db8::/32`。
- **密钥只放在后端运行环境**。`config.js` 只放公开值。
- **公开讨论不写线上细节**。Issue、PR 和提交信息里不要写线上版本、部署状态或内部实现。
- **安全问题不要发公开 issue**。请通过[私密漏洞报告](https://github.com/BlackSlience-Reaper/egress-observatory/security/advisories/new)提交。

## Labels

| Label | 含义 |
| --- | --- |
| `task`、`bug`、`enhancement`、`data-source`、`documentation` | 类型 |
| `area:frontend`、`area:scoring`、`area:sources`、`area:api`、`area:lookup`、`area:extension`、`area:repo` | 涉及范围 |
| `platform:windows`、`platform:macos` | 只在该平台出现，或需要在该平台验证 |
| `P0`、`P1`、`P2` | 优先级：立刻处理、下一步处理、排期处理 |
| `status:triage`、`status:ready`、`status:in-progress`、`status:blocked` | 任务状态，同一时间保留一个；PR 用 draft/ready 表达审查状态 |
| `dependencies` | Dependabot 的 Actions 与 Python 依赖更新 |

## 许可

提交贡献即表示你同意按 [GPL-3.0](LICENSE) 授权你的代码。
