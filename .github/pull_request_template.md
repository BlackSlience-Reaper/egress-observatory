## 关联 Issue

Closes #

## 改了什么

<!-- 说明结果和原因，不用逐行复述代码。 -->

## 怎么验证的

- [ ] `npm test` 通过
- [ ] 在本地或线上页面实际验证过（写明步骤和结果）

验证平台：<!-- Windows / macOS / 只跑了 CI -->

## 按改动范围核对

只勾选涉及的项，其余可以删除。

- [ ] **页面资源**：改过的文件已更新 `index.html` 或 import 里的 `?v=` 版本号
- [ ] **评分**：`SCORING.md` 和 `tests/score.test.mjs` 已同步
- [ ] **数据源**：`README.md` 的检测内容、`DATA-SOURCES.md` 已同步
- [ ] **本机查询服务**：改了 `local_server.py`、`provider_pages.py` 或 `src/page-extract.js`，已在上面说明，由维护者判断是否需要同步到线上
- [ ] **Chrome 扩展**：已升版本、重新打包到 `downloads/` 并更新所有版本引用（见 [贡献指南](https://github.com/BlackSlience-Reaper/egress-observatory/blob/master/CONTRIBUTING.md#chrome-扩展)）

## 提交前确认

- [ ] 代码、文档、测试和截图里没有真实 IP，也没有密钥
- [ ] PR 标题是一句英文祈使句，合并后它就是 `master` 上的提交信息
