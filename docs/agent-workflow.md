# Agent 工作流

规则入口是根目录 [AGENTS.md](../AGENTS.md)，人和 agent 共用 [贡献指南](../CONTRIBUTING.md)。Codex 从 `.agents/skills/` 发现项目技能，Claude 通过根目录 `CLAUDE.md` 读取规则，Copilot 使用 `AGENTS.md` 和 `.github/copilot-instructions.md`。

## 直接开始

在仓库内打开 agent，直接使用以下请求；技能文件也可从链接读取。

```text
使用 $egress-change 完成 Issue #编号，按实际页面行为交付并建立 PR。
使用 $egress-change 继续 PR #编号，先读取当前分支与交接记录。
使用 $egress-release 为当前扩展版本准备 GitHub draft Release。
```

- [$egress-change](../.agents/skills/egress-change/SKILL.md)：任务到实现、实际入口证据、PR 与交接。
- [$egress-release](../.agents/skills/egress-release/SKILL.md)：扩展版本、打包、实际安装状态和发布产物。

GitHub Copilot 在 Actions 上运行时，`copilot-setup-steps.yml` 安装 Python、固定版本的 Playwright 和 Chromium。它可以从 `python local_server.py` 启动站点；该准备流程不执行测试。Copilot 的账号订阅、可用额度和任务分配由 GitHub 管理，仓库文件不会授予账号访问权限。

## 任务与状态

Issue 写清目标、范围、实际入口、完成条件和依赖；直接来自用户的任务可以在 PR 正文标明来源。类型、area 和优先级沿用仓库现有标签。

- `status:triage`：新反馈，尚需确定范围。
- `status:ready`：目标和完成条件明确，可以领取。
- `status:in-progress`：已经领取，记录工作分支。
- `status:blocked`：说明具体阻塞和解除条件。

状态标签由维护者或执行任务的 agent 按实际进度维护；同一时间保留一个状态标签。PR 的 draft/ready 状态用于区分工作中与待审查；Issue 关闭表示范围内工作结束。自动 PR Labels 只添加文件范围标签，不代表任务已完成。

## 交付与交接记录

在 PR 模板或获准写入的任务记录中填写以下信息。公开记录中的地址使用文档保留 IP，截图先隐藏 IP；不记录密钥或内部后端部署细节。

```text
任务：Issue / 当前用户请求
分支与 commit：
完成条件：
实际入口：URL / 菜单 / CLI / Actions
运行环境：系统、浏览器、实际安装扩展版本（按需）
操作与观察：做了什么，实际出现什么结果
产物：PR / Actions run / Release / 脱敏截图
尚未观察：具体范围及原因
下一步：下一位执行者可直接调用的入口
```

模拟数据可以证明演示界面的表现。来源字段、限流恢复、线上后端、商店签名和实际安装状态分别以对应入口的观察为准。测试结果和静态审查均不能替代上述记录。

## 自动化入口

- [OpenAI PR Review](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/openai-review.yml)：可信写权限触发者的同仓库非草稿 PR 自动审查；fork PR 由维护者输入编号手动运行。模型和推理强度以工作流为准，当前为 `gpt-6-astra` / `medium`。结果只发表静态意见，不批准或自动合并。
- [PR Labels](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/pr-labels.yml)：按变更路径添加 area 与 documentation 标签；维护者也可输入当前或历史 PR 编号手动运行。只读取可信配置与 PR 文件列表。
- [Copilot Setup Steps](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/copilot-setup-steps.yml)：从 Actions 的 Run workflow 或 `gh workflow run copilot-setup-steps.yml --ref master` 准备可运行环境。
- [Prepare Helper Release](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/helper-release.yml)：从默认分支生成绑定 commit 的 draft Release、离线包、Chrome/Firefox 商店包和 SHA256SUMS。不会自动提交商店。
- [Deploy Pages](https://github.com/BlackSlience-Reaper/egress-observatory/actions/workflows/deploy-page.yml)：仅由维护者主动点击 Run workflow，选择 `master` 后部署该次选定的 commit。用户也可明确要求 agent 运行部署；普通任务的合并与验收不触发此入口。
- Dependabot 每周检查 GitHub Actions 和 Python 依赖，分组提交普通版本更新 PR；更新后仍需要说明实际入口的观察结果。
- CodeQL、Dependabot alerts、secret scanning 和 push protection 在 GitHub Security 设置中管理。静态扫描用于定位缺陷，不作为功能可用的证明。

## 合并、发布与回退

默认分支要求 PR、squash 线性历史和讨论解决，禁止删除与强推。单人维护时审批数为 0，CODEOWNERS 用于标明负责人；不设置测试状态门槛。规则的可重建请求体在 [default-branch.json](../.github/rulesets/default-branch.json)，实际生效状态以 GitHub Rules 页面为准。

仓库合并方式、主页与安全更新设置的请求体在 [repository.json](../.github/repository.json)。管理员可用 `gh api --method PATCH repos/BlackSlience-Reaper/egress-observatory --input .github/repository.json` 应用；Dependabot alerts 须先启用。已有分支规则可用 `gh api --method PUT repos/BlackSlience-Reaper/egress-observatory/rulesets/规则ID --input .github/rulesets/default-branch.json` 更新，创建新规则使用对应 POST 接口。GitHub 账号功能和 Security 设置仍以实际读取结果为准。

CodeQL 的请求体在 [codeql-default-setup.json](../.github/codeql-default-setup.json)，管理员使用 `gh api --method PATCH repos/BlackSlience-Reaper/egress-observatory/code-scanning/default-setup --input .github/codeql-default-setup.json` 应用。首次配置会建立实际扫描任务；运行入口和发现的缺陷在仓库 Security 页查看。

Pages 的设置请求体在 [pages.json](../.github/pages.json)，管理员使用 `gh api --method PUT repos/BlackSlience-Reaper/egress-observatory/pages --input .github/pages.json` 将发布源设为 GitHub Actions。部署工作流仅监听 `workflow_dispatch`，没有 push、PR 或定时触发器。

合并前记录实际入口证据和未观察范围；合并后网页继续使用上一次部署。维护者主动运行 Deploy Pages 后，再从部署记录与公开页面核实发布结果。需要回退时从最新 `master` 创建修复分支，对目标提交执行 `git revert <SHA>`，通过 PR 恢复，待维护者主动部署后再观察页面；保留远程历史。

扩展 Release 草稿由维护者检查后发布。商店上传说明见 [STORE.md](../browser-helper/STORE.md)；GitHub 草稿、正式发布与商店上架是各自独立的状态。
