# 项目知识接入

Basic Memory 为本项目提供本地知识读写、检索和 Codex 会话 hooks。知识 Markdown 位于当前 worktree 的 `docs/knowledge/`，随 Git 审查和合并；数据库和模型属于本机缓存。人工开发、构建、测试和 CI 不依赖它。

## 安装与启动

按项目要求启用 Node 与 pnpm，并先安装 [uv](https://docs.astral.sh/uv/getting-started/installation/)。启动器支持 PATH 中的 uv，也支持 `~/.cache/vue-nest-baseline-memory/bin/uv`（Windows 为 `uv.exe`）。

从此基准派生新项目时，先更新 `.codex/basic-memory.json` 中的 `primaryProject` 和 `repository`，再首次安装。

在仓库根目录执行：

```sh
pnpm exec nx run @baseline/source:knowledge-setup
pnpm exec nx run @baseline/source:knowledge-doctor
```

`setup` 使用 uv 安装隔离的 Python 3.12 和 Basic Memory 0.24.1，建立当前项目索引，并检查 MCP 和 SessionStart。首次运行需要联网下载运行时、依赖及本地向量模型；之后正常启动不执行安装或自动升级，不需要 Basic Memory 云账号。

`doctor` 检查目录绑定、运行时版本、真实 MCP 握手，以及运行时返回的唯一项目、默认项目、本地来源和实际知识路径，再检查官方 SessionStart 上下文。MCP 启动失败或提前退出会立即失败，请求超时后终止并回收子进程；hooks 也有执行时限。它不写业务知识，会创建本地诊断用生命周期事件。它验证的是组件；Codex 是否信任并实际加载项目 hooks，还需在新会话中确认。

在 Codex 中打开或重新开始本仓库的会话，信任项目配置，并在 CLI 的 `/hooks` 中审查和信任仓库的 SessionStart、PreCompact 命令。核对 `basic-memory` MCP 可用且收到 Basic Memory 启动上下文。新配置的实际加载以新会话验收为准，不能用本地 doctor 成功代替。子目录启动也受支持。项目级配置与 hooks 信任机制见官方 [MCP](https://learn.chatgpt.com/docs/extend/mcp) 和 [Hooks](https://learn.chatgpt.com/docs/hooks) 文档。

## worktree 绑定

[公共启动器](../scripts/knowledge.mjs)供 MCP、hooks 和手工命令共用。每次启动会定位并校验当前 Git worktree，将唯一的本地项目 `vue-nest-baseline` 映射到该 worktree 的 `docs/knowledge`。MCP 与 hooks 都通过 Git 根目录定位启动器，不依赖 MCP 配置中相对 `cwd` 的解析。新 worktree 自动建立自己的配置及数据库；同一用户可复用已安装的运行时和模型。

默认本机目录为 `~/.cache/vue-nest-baseline-memory/`：

- `runtime-0.24.1/`：隔离 Python 与 Basic Memory。
- `models/`、`huggingface/`、`uv-cache/`、`python/`：模型、包和 Python 缓存。
- `worktrees/<路径哈希>/`：该 worktree 的绑定记录、Basic Memory 配置、数据库及生命周期事件。

可用 `VUE_NEST_BASELINE_MEMORY_CACHE` 指定缓存根目录；MCP、hooks 和安装命令必须使用相同值。缓存路径应保持较短，避免 Windows 模型下载路径过长。

启动器按变量名不区分大小写清除继承的全部 `BASIC_MEMORY_*`，再设置当前 worktree 的配置目录、本地 SQLite 模式及项目固定值；其他环境变量仍正常继承。这样外部项目映射、默认项目、数据库 URL 或云模式不会覆盖已经验证的配置；外部同前缀的日志等偏好也不会透传，缓存根目录仍使用上述 `VUE_NEST_BASELINE_MEMORY_CACHE`。

复制来的配置若指向其他目录、改用其他数据库后端或指定数据库 URL，或知识目录通过链接逃逸到 worktree 外，会报错并停止；不会自动改写未知配置。先按报错路径检查对应缓存，确认属于当前 worktree 后重建该单个缓存，不要复制数据库给其他 worktree。

这些是路径和配置校验，不是新的操作系统沙箱。调用工具时仍沿用 Codex 的权限机制。

## 日常操作

| 命令                                                                                 | 用途                                               |
| ------------------------------------------------------------------------------------ | -------------------------------------------------- |
| `pnpm exec nx run @baseline/source:knowledge-setup`                                  | 安装或恢复固定版本运行时，索引当前知识并做启动检查 |
| `pnpm exec nx run @baseline/source:knowledge-doctor`                                 | 检查当前 worktree 的绑定及 MCP、SessionStart       |
| `pnpm exec nx run @baseline/source:knowledge-cli -- project index vue-nest-baseline` | Git 合并或手工修改笔记后，按需重建当前项目索引     |
| `pnpm exec nx run @baseline/source:knowledge-cli -- hook status --harness codex`     | 查看当前 worktree 的生命周期事件状态               |
| `pnpm exec nx run @baseline/source:knowledge-cli -- hook flush`                      | 将本地生命周期事件归档；不把事件自动变成知识笔记   |

CLI 操作通过 `knowledge-cli` Nx 目标进入同一绑定环境，不直接使用全局 `bm`。不要同时启用上游全局插件的默认 MCP/hooks，否则会出现第二个未绑定本 worktree 的入口。

官方技能负责按任务收录决策、读取知识和创建 checkpoint。现有 README、AGENTS.md、DESIGN.md 和源码继续作为各自内容的维护入口；知识笔记引用相关来源，避免重复保存配置数值。Markdown 进入普通 diff、格式检查和 PR 审查，数据库与缓存不提交。

TODO: 当前已提供变更候选检查和中文字面检索回退，但任意来源的历史代码变化不会无人值守地修复所有知识，中文语义召回质量也未作专项验证。真实试点需验证任务中的收录和维护可靠性，再决定是否需要更强的漂移检测或检索方案；读取时仍核对来源与适用范围。

## 开发中的知识维护

[project-knowledge](../.agents/skills/project-knowledge/SKILL.md) 由 AGENTS.md 接入正常开发：开始时按主题检索，收尾时检查变更影响，按需调用官方技能收录或修订。普通小改动没有持久知识时不生成笔记；只读问答不修改知识。

当前参考笔记使用 frontmatter 的 `sources` 数组关联来源文件，例如：

```yaml
sources:
  - scripts/knowledge-review.mjs
  - docs/project-knowledge.md
```

路径相对仓库根目录，指向精确文件。通过 MCP 写笔记时可传 `metadata.sources`。既有 README、AGENTS.md、DESIGN.md 仍在原处维护，笔记只保留必要背景和指针。

两个只读辅助命令不调用模型，也不依赖 Basic Memory 运行时；需要已安装项目开发依赖：

```sh
pnpm exec nx run @baseline/source:knowledge-check
pnpm exec nx run @baseline/source:knowledge-check -- --since <任务开始或合并前的提交SHA>
pnpm exec nx run @baseline/source:knowledge-find -- 超时 重试 --limit 5
```

`check` 默认检查当前暂存、未暂存和未跟踪变化；指定 `--since` 后再加入该提交到 HEAD 的差异。重命名包含旧、新路径，来源文件已不存在时也会提示。`candidates` 是需要判断的笔记，`unlinked` 是未建立来源关联的笔记；schema、历史 checkpoint 和已废止决策不作为当前知识维护对象。命令不会改写笔记、批准提议或记录“已审查”状态。

`find` 在当前仓库的知识 Markdown 中做 Unicode 字面包含匹配，多个参数按任一词命中，不解析全文检索的布尔语法。仅返回标题、标识、状态、来源和短摘录；选中候选后再用 MCP 或读取对应文件获取正文。它是有限检索回退，不能替代语义检索。

两者默认每组返回 10 项，可用 `--limit`（1–50）和 `--offset` 分页，输出包含总数和下一页位置。未解析的笔记、非法来源或超过 256 KiB 的文件会进入 `warnings`，并使 `complete=false`。没有候选也不代表所有知识都已核实：检查只覆盖指定变化范围与已记录的来源关系。

知识文件沿用现有格式检查、Git diff 和 PR 审查。当前规则变化时维护现行笔记或建立替代关系，checkpoint 保留当时状态；文档合并不等于方案批准。

## 接入方式与版本

采用 Codex 项目级 MCP 和 hooks 配置，并由启动器调用官方 `basic-memory mcp` 与 `basic-memory hook`。上游全局插件的默认命令没有本项目的 worktree 绑定，因此这里没有执行用户级 `bm install codex`，也没有修改上游插件源码。

五个官方技能 `bm-orient`、`bm-decide`、`bm-writing`、`bm-remember`、`bm-checkpoint` 来自 [Basic Memory 固定提交](https://github.com/basicmachines-co/basic-memory/tree/1d0e09b6f4876c3f339c30e8dbfcf66e59e2c356/plugins/codex/skills)，保留原文件及各目录中的上游许可证原文（上游声明为 `AGPL-3.0-or-later`）。Oxfmt 和提交钩子排除这些第三方技能，项目自有的 `project-knowledge` 技能、脚本、配置和文档仍正常检查。schema 基于同版本官方模板，作为项目可维护的笔记格式；其许可证、来源及项目修改记录见 [第三方材料说明](../THIRD_PARTY_NOTICES.md)。

2026-11-10 从 vue-baseline 迁入，运行时固定 Basic Memory 0.24.1 与 Python 3.12。Basic Memory 的包版本固定，传递依赖由安装时解析；升级应作为单独工程变更，审查上游技能及运行时变化并复验绑定、失败路径、MCP 和 hooks。

五个 `knowledge-*` Nx 目标均不缓存；`knowledge-check` 和 `knowledge-find` 每次读取当前 Git 状态及笔记。MCP 和 hooks 直接调用公共启动器，避免 Nx 日志混入 MCP 的标准输出协议。
`pnpm exec nx run @baseline/source:test` 在 Node 环境执行绑定与知识检查测试；根项目 lint、类型检查及现有 CI 覆盖这些脚本和测试，无需 Python 运行时或联网。只读辅助命令使用直接开发依赖 `js-yaml` 解析 frontmatter。
运行时回归测试使用实际 Node 子进程模拟 MCP 与 hooks，覆盖继承环境变量清理、错误项目路径、默认项目与来源、子进程启动失败、提前退出及超时回收；已安装的 Basic Memory 仍通过本机 doctor 单独验收。

当前包括可靠接入及项目内的按需收录、变更检查和检索回退。长期中文检索质量、真实需求中的知识维护收益及模型成本仍需在后续试点中观察。

## 本次接入验收

2026-11-10 使用 uv 0.13.6、Python 3.12.16 和 Basic Memory 0.24.1 完成本机安装。已验证 27 个 MCP 工具的发现、当前项目 schema 读取，以及从 `apps/web` 子目录执行配置中的 MCP、SessionStart 和 PreCompact 命令；原 Nx MCP 配置保留。
16 项知识脚本测试、2 项 Web 单测、冻结安装、全量格式、lint、类型检查、构建及 Chromium 冒烟通过。

同日已在新 Codex 会话（宿主版本 `0.167.0-alpha.3.2`）完成实际加载验收：

- 直接通过本会话的 `basic-memory` MCP 读取 `vue-nest-baseline/schemas/decision` 成功，返回正确的项目 permalink；运行中的服务诊断确认默认项目为 `vue-nest-baseline`，知识目录指向当前 worktree 的 `docs/knowledge/`。
- 项目配置已受信任。Codex `hooks/list` 只读查询确认 SessionStart 和 PreCompact 均来自本仓库 `.codex/hooks.json`，`enabled=true`、`trustStatus=trusted`，当前哈希与已保存的信任哈希一致，无 hooks 警告或错误。
- 本会话实际收到 Basic Memory 启动上下文，项目为 `vue-nest-baseline`、focus 为 `code/dev`。生命周期收件箱中存在与当前会话 ID 对应的 `session_started` 事件，时间为 `2026-11-10T19:00:56+08:00`、触发源为 `startup`，项目与工作目录均正确。

以上包含新会话 MCP 调用、宿主信任状态和实际启动事件的证据，不以重新运行 doctor 代替验收。

同日补充运行时隔离修复验收：在污染项目映射、默认项目、配置目录、数据库及云模式环境变量后，真实 Basic Memory 的 CLI 项目列表和 doctor 仍确认当前 worktree 绑定；从 `apps/web` 执行配置中的两个 hook 命令均成功，未创建外部探测目录。38 项知识脚本测试、2 项 Web 单测、全量格式、lint、类型检查、构建及 Chromium 冒烟通过；未调整依赖版本。

2026-11-11 已验证宿主在自动压缩时调用 PreCompact，并在恢复会话时通过 SessionStart 加载项目上下文。生命周期收件箱中，同一 Codex 会话在当前 worktree 有 4 组配对事件，项目均为 `vue-nest-baseline`。最后一组发生在当日北京时间 17:44:05（`compaction_imminent`，`trigger=auto`）和 17:45:29（`session_started`，`trigger=compact`）。恢复后的会话实际收到了该项目的 Basic Memory 上下文，focus 为 `code/dev`。
