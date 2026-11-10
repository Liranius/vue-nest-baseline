# Agent 工作约定

## 项目入口

- 初始化、日常命令、提交方式和已知限制见 [README](README.md)。运行时与依赖版本以 [.node-version](.node-version)、[package.json](package.json) 和锁文件为准。
- Web 入口为 [main.ts](apps/web/src/main.ts) 和 [App.vue](apps/web/src/app/App.vue)；单元测试与源码相邻，浏览器测试位于 [apps/web-e2e/src](apps/web-e2e/src)。
- 远端检查见 [CI 工作流](.github/workflows/ci.yml)，本地提交检查见 [lefthook.yml](lefthook.yml)。项目配置查询遵循下方 Nx 约定，使用解析后的目标。

## 工作约定

- 开始前查看当前分支和工作区差异，保留已有改动；同处修改冲突时先协调。以当前仓库的代码、测试、配置和用户已确认要求为准。
- 完成明确要求的修改及必要配套，额外发现单独报告。已授权工作连续完成；用户要求分项确认时按其确认范围推进。
- 只对影响正确性、兼容性或范围的缺失信息澄清。文档记录必要信息，目录、命令或约定变化时同步相关入口，避免多份维护。
- 有意保留的临时方案、例外和推迟事项，以 `TODO:` 记录原因、影响及解除条件；同一问题保留一份主要记录，其他位置引用。未知信息明确标为待确认。
- 应用内使用现有 `@/` 别名，跨工作区依赖使用包名；沿用现有路由、Pinia 和样式组织方式。

## UI 工作

- 产品界面的设计、实现与审查使用仓库内的 [interface-design](.agents/skills/interface-design/SKILL.md)，先读取 [DESIGN.md](DESIGN.md) 及相关实现；营销页面等超出该 skill 范围的任务另行选择。项目需求与已确认设计约束优先于通用风格建议，实现沿用 Vue 和现有样式组织方式。
- [system.md](.interface-design/system.md) 只作入口；skill 的“保存设计模式”操作映射为更新 DESIGN.md。是否需要初始化以 DESIGN.md 的状态为准，不能因入口文件存在就认定设计已定稿；流程见 [README](README.md#ui-辅助开发)。
- 仅保存已确认或用户授权决定的设计结论，待确认项明确标注；既有授权不重复询问。设计意图与适用范围写入 DESIGN.md，token 数值和组件行为引用源码，避免双份维护。

## 验证要求

- 文档修改核对内容、命令、路径和链接，执行 `git diff --check`，并通过 Nx 检查改动文件格式，例如 `pnpm exec nx run @baseline/source:format -- --check README.md AGENTS.md CLAUDE.md THIRD_PARTY_NOTICES.md`。
- 应用代码修改运行 `pnpm exec nx run-many -t format-check lint test build typecheck`；行为变更补充有意义的测试，缺陷修复验证原问题和相关回归。
- 页面、路由、样式和构建配置变更补充 `pnpm exec nx run @baseline/web-e2e:e2e`。实际 UI 变化还需操作受影响的交互、键盘与焦点路径，核查桌面、窄屏及关键状态。
- 依赖、类型或检查配置变更执行全量格式、lint、单测、类型检查、构建与 Chromium 冒烟，并验证受影响的配置和必要失败路径；依赖变更还需验证冻结安装。
- `lint`、`format-check` 为只读检查；`lint-fix`、`format` 和提交钩子的副作用见 README，运行后审查差异。
- 不通过降低类型要求、删除有效测试、扩大忽略范围或跳过门禁制造通过；合理调整需说明作用与影响。检查失败先定位原因，外部阻塞记录证据并继续不受影响的工作。

## 审查与交付

- 对照任务要求、最终 diff 和验证结果自检，核对行为、兼容性和修改范围，更新变化或已解决的 TODO。
- 交付说明修改与原因、实际检查和结果、未完成事项；未验证或受阻的部分如实说明。日志和环境细节按需提供。
- 中断或交接时留下分支、改动、验证结果、未解决事项和下一步；恢复前重新核对工作区与证据。

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
