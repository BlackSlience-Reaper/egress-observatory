Read and follow the repository-root `AGENTS.md` before changing code or reviewing a PR. It is the canonical project policy.

Use `CONTRIBUTING.md` for local setup and `docs/agent-workflow.md` for task delivery and handoff. The site is native JavaScript plus an optional Python/Playwright lookup service; it has no npm build step. Do not add, maintain, repair, or run tests, or use test results as a delivery gate. Record observed behavior through the real user entry point. Preserve existing user changes and keep secrets and real IP addresses out of public output.
