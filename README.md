# vue-nest-baseline

Nx monorepo 工程基准，包含 Vue 前端和 Nest API。前端使用 Vue 3、Vite、TypeScript、Vue Router 和 Pinia，浏览器测试使用 Playwright，API 端到端测试使用 Jest。
项目自有代码采用 [MIT 许可证](LICENSE)；收录的第三方材料及许可见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 项目与目录

| Nx 项目             | 位置                         | 职责                                                                                    |
| ------------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| `@baseline/source`  | [package.json](package.json) | 工作区格式、根配置 lint、类型检查和 Git 钩子目标                                        |
| `@baseline/web`     | [apps/web](apps/web)         | Vue 应用，入口为 [main.ts](apps/web/src/main.ts) 和 [App.vue](apps/web/src/app/App.vue) |
| `@baseline/web-e2e` | [apps/web-e2e](apps/web-e2e) | Chromium 冒烟及多浏览器测试                                                             |
| `@baseline/api`     | [apps/api](apps/api)         | Nest API 服务，入口为 [main.ts](apps/api/src/main.ts)                                   |
| `@baseline/api-e2e` | [apps/api-e2e](apps/api-e2e) | 使用 Jest 测试运行中的 API                                                              |

[根 package.json](package.json) 集中声明 Vue、Vue Router 和 Pinia 的运行依赖。Web 应用从仓库根安装依赖，由 Vite 打包交付。新增或升级 Web 运行依赖时更新根清单和锁文件。

[pnpm workspace](pnpm-workspace.yaml) 当前的四个成员为根包、`apps/web`、`apps/api` 和 `apps/api-e2e`。`packages/*` 为后续共享包保留匹配规则。`@baseline/web-e2e` 是独立的 Nx 测试项目，使用根包的 Playwright 依赖，从仓库根运行 `pnpm exec nx run @baseline/web-e2e:e2e`。可用 `pnpm list -r --depth -1` 查询 pnpm 成员。

路由位于 [router](apps/web/src/router)，状态示例位于 [stores](apps/web/src/stores)。单元测试与源码相邻，浏览器测试位于 [apps/web-e2e/src](apps/web-e2e/src)。
项目目标由 Nx 插件推导和显式配置共同组成，查询时使用完整解析结果：

```sh
pnpm exec nx show projects
pnpm exec nx show project @baseline/web --json
```

## 初始化

先安装 fnm 并完成 shell 初始化，再在仓库根目录执行：

```sh
fnm install
fnm use
npm install --global pnpm@12.4.2
pnpm install --frozen-lockfile
pnpm exec nx run @baseline/source:hooks-install
pnpm exec nx run @baseline/web:dev
```

Node 固定版本为 [.node-version](.node-version) 中的 `24.22.2`，pnpm 为 [package.json](package.json) 声明的 `12.4.2`。
支持的 Node 范围为 `>=24.22.2 <25`；`devEngines.runtime` 与 `engines.node` 保持一致，版本不符时拒绝执行 pnpm 命令。
该运行时包含内置 Undici `7.30.1` 的[安全修复](https://nodejs.org/en/blog/release/v24.22.1)；npm 中的 Undici 与 Node 原生 `fetch` 使用的内置副本分别维护，升级前者不能替代运行时升级。
[pnpm-workspace.yaml](pnpm-workspace.yaml) 开启严格 engine、peer 检查及精确依赖版本；升级时同步版本声明和锁文件，按实际需要维护安装脚本允许列表。

开发服务默认使用 `http://localhost:4200`，预览默认使用 `http://localhost:4300`，实际地址以终端输出为准。
联调 Nest 接口时，在另一终端运行 `pnpm exec nx run @baseline/api:serve`。Vue 页面可直接调用 `fetch('/api')`，开发服务器会保留请求路径并转发到 `http://localhost:3000`。
编辑器扩展见 [.vscode/extensions.json](.vscode/extensions.json)；[.editorconfig](.editorconfig) 约定 UTF-8、两空格、LF 和行末换行，[.gitattributes](.gitattributes) 保留 Windows 脚本的 CRLF。

## 常用命令

以下命令均在仓库根目录执行。

| 命令                                             | 用途                                         |
| ------------------------------------------------ | -------------------------------------------- |
| `pnpm exec nx run @baseline/web:dev`             | 启动开发服务                                 |
| `pnpm exec nx run @baseline/web:build`           | 类型检查与生产构建，两项均成功才通过         |
| `pnpm exec nx run @baseline/web:build-only`      | 仅执行 Vite 构建，可传入 `--mode` 等构建参数 |
| `pnpm exec nx run-many -t typecheck`             | 检查应用、测试和工程配置的类型               |
| `pnpm exec nx run @baseline/web:preview`         | 先完成 build，再启动生产预览                 |
| `pnpm exec nx run @baseline/web:test`            | 单次运行单元测试                             |
| `pnpm exec nx run @baseline/web:test-watch`      | 监听变更并重跑单元测试，Ctrl+C 退出          |
| `pnpm exec nx run-many -t lint`                  | 只读执行所有项目的 lint                      |
| `pnpm exec nx run-many -t lint-fix`              | 自动修复所有项目可修复的 lint 问题           |
| `pnpm exec nx run @baseline/source:format`       | 使用 Oxfmt 格式化                            |
| `pnpm exec nx run @baseline/source:format-check` | 只读检查全工作区格式                         |
| `pnpm exec nx run @baseline/web-e2e:e2e`         | 构建并执行 Chromium 冒烟测试                 |

限定修复范围时可运行 `pnpm exec nx run @baseline/web:lint-fix`，它仍会先修复根工程配置。
Nx 会在相关任务执行前同步 TypeScript 项目引用；需要手动同步时运行 `pnpm exec nx sync`。

## Web 开发约定

### 环境变量

[apps/web/env/.env](apps/web/env/.env) 提供公共默认值，包括用于浏览器标题的 `VITE_APP_TITLE`，无需复制文件即可启动。
个人覆盖可参考 [.env.example](apps/web/env/.env.example) 创建同目录下的 `.env.local`。
Git 默认忽略各目录的 `.env` 和模式覆盖文件，只放行该 Web 公共默认文件及各目录的 `.env.example` 示例。
`VITE_*` 会进入客户端产物，只用于公开配置。

Vite 的 `envDir` 指向 `apps/web/env`，避免 Nx 提前加载应用根目录的环境变量而改变模式优先级。
从高到低依次为进程环境变量、`.env.[mode].local`、`.env.[mode]`、`.env.local`、`.env`。
开发默认使用 `development`，构建默认使用 `production`；环境文件变更后重启开发服务，预览读取上次构建的值。

新增公开变量时，同步 [env.d.ts](apps/web/src/env.d.ts)、默认值、示例文件，以及 [project.json](apps/web/project.json) 中 `webEnvironment` 的进程环境输入。
该输入同时包含被忽略的 `env/.env*` 文件、`VITE_APP_TITLE` 和 `NODE_ENV`，用于构建及单元测试等任务的缓存计算。

### 路径、状态与调试

应用内 `@/` 指向 `apps/web/src/`。修改别名时同步 [Vite 配置](apps/web/vite.config.mts) 与 [应用 tsconfig](apps/web/tsconfig.app.json)，测试继承这些配置。
跨工作区包的引用使用包名。

应用入口先注册 Pinia，再注册 Vue Router。[Counter Store](apps/web/src/stores/counter.ts) 提供 `count`、派生值 `doubleCount` 和 `increment` action。
组件 setup 内可调用 `useCounterStore()`；组件外在 Pinia 安装后使用，或显式传入实例。组件测试各自创建并清理 Pinia 实例，现有测试覆盖状态共享和实例隔离。

开发服务启用 Vue DevTools，可用 `Alt+Shift+D` 切换面板，或打开 Vite 输出的 `/__devtools__/` 地址。
面板支持组件、路由和 Pinia 调试；生产构建不注入开发面板。

### 类型检查

`@baseline/web:build` 依赖 `build-only` 与 `typecheck`；`preview` 和 `serve-static` 依赖完整的 `build`。
`build-only` 在 Nx 推导的缓存输入上追加根 TypeScript 配置、包清单、pnpm 工作区与锁文件，以及根 PostCSS 配置。若构建配置引入新的共享文件，也要把它加入该目标的输入。
Web 类型检查覆盖应用、单元测试和 Vite 配置，并先执行根 Vitest 配置的类型检查；E2E 项目单独检查浏览器测试与 Playwright 配置。

浏览器配置继承 `@vue/tsconfig` 并开启 `noUncheckedIndexedAccess`；Node 配置继承 `@tsconfig/node24`。
单元测试配置覆盖 `src` 下的 spec/test、`__tests__` 和 `tests` 目录，包含 Vitest、Node、jsdom 类型。
为 Nx 项目引用保留声明输出和增量状态，存放在 `out-tsc` 中；可部署的 Web 产物位于 `apps/web/dist`。

TODO: 当前 `@nx/vue@24.0.3` 的 peer 范围要求 `vue-tsc ^2.0.0` 和 `vue-router ^4.0.0`，暂保留 `vue-tsc 2.2.12`、`vue-router 4.6.4`。
待 Nx 支持目标主版本后，重新评估与 vue-baseline 的版本差异并执行完整回归；保持严格 peer 检查。

## UI 辅助开发

仓库内提供 [interface-design](.agents/skills/interface-design/SKILL.md)，用于产品界面的设计、实现和审查；营销页面、品牌策划等不在其适用范围。它是可选的 agent 指导，不影响人工开发、构建、测试和 CI。

在本仓库使用支持 `.agents/skills` 的 Codex 时，可明确要求“使用 interface-design”，或由 agent 按任务匹配；若会话未发现该 skill，重新打开会话并核对加载的是仓库内版本。这里安装的是 skill，上游文档中的插件斜杠命令不随之安装，可用自然语言提出设计审查等任务。

1. 读取 [DESIGN.md](DESIGN.md)、需求与相关实现。本基准的初始状态为“业务设计尚未建立”，后续以 DESIGN.md 的实际状态为准；基准示例的配色、字体与布局均不代表业务选择。
2. 首次业务 UI 任务先明确用户、核心任务、关键状态与设计方向，按不确定性提供候选或可运行原型。方向含糊或更改成本高时由维护者选择；已明确授权的取舍直接执行。
3. 在 `apps/web` 中沿用 Vue 和现有样式组织方式实现，并通过浏览器迭代；核查布局、交互、键盘与焦点以及适用状态，执行 [AGENTS.md](AGENTS.md#验证要求) 规定的 Nx 检查。设计与代码可以迭代，不强制先生成独立图片设计稿。
4. 将已确认或授权决定的设计结论保存到 DESIGN.md，更新状态与适用范围；后续任务沿用并按需更新。[system.md](.interface-design/system.md) 只保留入口，具体 token 与组件定义引用源码。

本次与 vue-baseline 接入相同的固定上游版本，来源、提交和 MIT 许可见 [第三方材料说明](THIRD_PARTY_NOTICES.md#interface-design)。
项目适配维护在 AGENTS.md 和 system.md，不修改上游 skill；该目录沿用现有第三方技能的 Oxfmt 排除规则，项目自有文档仍正常检查。
升级时复查排除范围、审查指令与资源变化并更新版本记录，并复验未初始化设计、保存与新会话读取三条路径。

## 项目知识

本项目可选接入 Basic Memory，用于伴随开发保存和读取知识。安装、worktree 绑定与启动核查见 [项目知识接入](docs/project-knowledge.md)。先安装 uv，再执行：

```sh
pnpm exec nx run @baseline/source:knowledge-setup
pnpm exec nx run @baseline/source:knowledge-doctor
```

开发中的知识收录和维护由项目技能衔接；可用 `pnpm exec nx run @baseline/source:knowledge-check` 查看受变更影响的笔记，用 `pnpm exec nx run @baseline/source:knowledge-find -- 关键词` 做本地检索回退。
知识文件位于当前 worktree 的 `docs/knowledge/`，随 Git 审查和合并；运行时和索引保留在用户缓存。使用新 Codex 会话加载项目 MCP 与官方技能，并审查、信任项目 hooks；人工开发和 CI 不需要安装 Basic Memory。

## 测试

单元测试使用 Vitest 与 jsdom。`test` 单次运行并可复用 Nx 缓存；`test-watch` 持续运行且不缓存，失败后仍继续监听。
两者均先构建工作区依赖；CI 使用单次运行入口。

根项目的 `pnpm exec nx run @baseline/source:test` 在 Node 环境中验证知识脚本，包括 worktree 隔离、失效配置拒绝、变更关联和中文检索；不需要安装 Basic Memory 或联网。
这些测试纳入现有 `nx run-many -t test`，与 Web 的 jsdom 测试分别运行。

浏览器测试首次运行前安装 Chromium：

```sh
pnpm exec playwright install chromium
pnpm exec nx run @baseline/web-e2e:e2e
```

需要验证 Chromium、Firefox 和 WebKit 时：

```sh
pnpm exec playwright install chromium firefox webkit
pnpm exec nx run @baseline/web-e2e:e2e --configuration=all
```

E2E 目标先执行类型检查和构建，再由 Playwright 启动 `http://127.0.0.1:4173` 的全新生产预览，结束后关闭服务。
端口占用时失败，不复用已有服务。E2E 结果不缓存，构建和类型检查仍可使用缓存；使用上述 Nx 入口以确保前置任务执行。
`CI` 为非空值时，浏览器始终访问本次构建的预览。本地默认访问同一预览，也可用 `BASE_URL` 指向已有服务。覆盖访问地址时，Playwright 仍会启动本地预览。

失败截图和 trace 位于 `apps/web-e2e/test-output/playwright/output/`，HTML 报告位于 `apps/web-e2e/test-output/playwright/report/`，不会自动打开。
CI 在浏览器测试失败时上传报告，保留七天。配置入口为 [playwright.config.mts](apps/web-e2e/playwright.config.mts)。

## 质量检查与提交

Oxfmt 是格式化工具，配置见 [.oxfmtrc.json](.oxfmtrc.json)。Web lint 包含 Oxlint、支持类型检查的 ESLint、Vue/Vitest 规则及 Stylelint。Web E2E 启用 Playwright 规则。
根项目的 `lint` 与 `lint-fix` 对同一组文件依次运行 Oxlint 和 ESLint。仓库顶层的 JS/TS 文件以及 `config/`、`scripts/`、`tests/` 中的源码由 [根项目的 `rootLintInputs`](package.json) 统一匹配，并参与 Nx 的 lint 缓存计算。
Web 和 Web E2E 的 lint 都包含根配置检查。`eslint-config-prettier` 用于关闭冲突的格式规则，`eslint-plugin-oxlint` 关闭与 Oxlint 重复的规则。
生成物和收录的第三方技能目录被排除，项目自有代码、配置和文档仍接受检查。

`lint` 和 `format-check` 为只读检查。`lint-fix` 不缓存，顺序执行适用的 Oxlint、ESLint、Stylelint 修复；剩余错误会使任务失败，已完成的修复保留。
Web 样式检查显式指定根 Stylelint 配置，保证 `NODE_ENV=test` 时也能使用同一配置。修复后审查差异，再运行只读检查。

### 本地验收

应用、依赖及工程配置修改完成后执行：

```sh
pnpm exec nx run-many -t format-check lint test build typecheck
```

页面、路由、样式、构建、依赖及检查配置变更还需执行 Chromium 冒烟：

```sh
pnpm exec nx run @baseline/web-e2e:e2e
```

纯文档修改核对内容、命令、链接，并运行 `git diff --check` 和改动文件的格式检查。
按修改类型选择验证范围，具体要求见 [AGENTS.md](AGENTS.md)。

### Git 钩子与提交信息

每个 checkout 在依赖安装后执行 `pnpm exec nx run @baseline/source:hooks-install`。
[Lefthook](lefthook.yml) 的 `pre-commit` 按顺序修复暂存文件的 Oxlint、ESLint、Stylelint 和格式问题，并重新暂存修复结果；提交前后均需审查差异。
钩子目标禁用缓存，依赖安装不会自动安装钩子。CI 仍对完整工作区进行只读检查。

提交信息采用 Conventional Commits，例如 `feat(web): add settings page`、`fix(web): handle missing user`。
Commitlint 不使用默认消息豁免；PR CI 检查 base/head SHA 之间全部非 merge 提交，不只检查最后一条提交或 PR 标题。
手动检查消息文件：

```sh
pnpm exec nx run @baseline/source:commitlint -- --edit path/to/message.txt
```

提交按可独立审查的逻辑步骤组织，包含必要的测试并保持可构建。远端仅允许 Rebase Merge。

## CI 与维护

[GitHub Actions](.github/workflows/ci.yml) 在 PR 创建、更新、重新打开或编辑时，以及 `main` 推送和手动触发时运行。
同一工作流、事件及 ref 的新运行会取消旧运行。`Checks` 限时 15 分钟，执行冻结安装、PR 提交信息校验、格式、lint、单元测试、类型检查、构建和 Chromium 冒烟。

最终校验要求每个必需步骤的原始 `outcome` 都成功。汇总 job 限时两分钟，同时要求 `Checks` 成功和 `verified=true`，失败、跳过或取消不能通过。
PR 的汇总检查名为 `Quality`，其他事件为 `CI result`。Action 固定完整提交 SHA，[Dependabot](.github/dependabot.yml) 每周检查 Action 更新。

2026-11-10 已通过 [PR #1 的首次远端 CI 验收](https://github.com/Liranius/vue-nest-baseline/actions/runs/42795421656)，对应提交 `f36b22d`；`Checks` 和 `Quality` 均成功，包含冻结安装、提交信息、格式、lint、类型检查、构建、单测及 Chromium 冒烟。

`main` 已启用 [PR 与 Quality 门禁](https://github.com/Liranius/vue-nest-baseline/rules/26932799)：变更必须通过 PR 合并，并以最新主分支为基底通过 GitHub Actions 提供的 `Quality` 检查。
规则未设置绕过名单，所需审批人数为 0。已核对平台有效规则及现有 PR 的必需检查列表。
新建仓库时需单独配置这些平台规则，工作流文件不会自动建立门禁。

依赖按兼容性、修复或实际功能需要更新，保留必要的 Nx 适配。更新后同步版本声明与锁文件，执行完整验收。
配置例外记录原因、范围和解除条件；维护依赖及规则时一并复查。第三方材料更新还需记录上游版本并复核许可，见 [第三方材料说明](THIRD_PARTY_NOTICES.md)。

### 依赖安全待办

TODO: 暂缓修复 [Minimatch 告警 #20](https://github.com/Liranius/vue-nest-baseline/security/dependabot/20)，保留告警开放。受影响的 9/10 系列来自 Nx、ESLint、Vue 类型工具和 `editorconfig` 等开发依赖。当前 Nx 的 `makeRe()` 调用使用默认优化级别 1，项目暂不维护补丁或全局覆盖。上游发布兼容修复、生产依赖引入受影响版本，或发现外部可控的匹配模式传入 `optimizationLevel >= 2` 的调用时，重新评估。[决策依据](docs/knowledge/codex/decisions/Minimatch%20alert%2020%20deferral.md)

TODO: 为修复 [glob 取消遍历告警 GHSA-3g3m-2fjr-6pw4](https://github.com/isaacs/node-glob/security/advisories/GHSA-3g3m-2fjr-6pw4)，[pnpm-workspace.yaml](pnpm-workspace.yaml) 仅将 `js-beautify@2.0.3` 的 `glob` 固定为 `14.0.4`，超出上游声明的 `^13.0.6`。升级 `js-beautify` 时复查这条规则：上游移除该依赖或其声明范围可解析到修复版后，删除覆盖，核对锁文件并复验 CLI 文件匹配和忽略行为。
