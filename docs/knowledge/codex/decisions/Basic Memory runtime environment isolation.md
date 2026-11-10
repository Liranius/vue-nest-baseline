---
title: Basic Memory runtime environment isolation
type: decision
permalink: vue-nest-baseline/codex/decisions/basic-memory-runtime-environment-isolation
status: open
project: vue-nest-baseline
sources:
  - scripts/knowledge.mjs
  - tests/knowledge.test.ts
  - tests/knowledge-runtime.test.ts
  - docs/project-knowledge.md
---

# Basic Memory 启动环境隔离

启动器校验的配置文件不一定是运行时的有效配置。审查 [PR #3](https://github.com/Liranius/vue-nest-baseline/pull/3) 的 `f98903f` 时，Basic Memory 0.24.1 在继承 `BASIC_MEMORY_PROJECTS` 后实际指向 worktree 外的目录，而旧 doctor 只匹配项目名称，仍报告成功。

本地修复采用由项目启动器统一提供 Basic Memory 环境配置的方式，并通过 MCP 返回的结构化项目列表核对实际绑定。用户已授权修复及本地验收；这项具体策略保留为 open，供审阅时确认。当前维护入口是 docs/project-knowledge.md，具体变量和校验逻辑以源码为准。

## Observations

- [decision] 启动器按变量名不区分大小写清除继承的全部 BASIC_MEMORY_*，再设置当前 worktree 所需固定值；不清除其他工具及操作系统环境变量。
- [rationale] 上游环境变量优先于配置文件，且新增配置字段可能扩大覆盖面；只过滤已发现的 PROJECTS 不能可靠维持绑定契约。
- [alternative] 仅维护危险变量拒绝名单可保留更多用户偏好，但容易遗漏新增字段或大小写变体。
- [consequence] BASIC_MEMORY_* 中的日志等非路径偏好也不再从父进程透传；缓存根目录仍可用项目专有变量配置。
- [decision] doctor 必须核对唯一项目、默认项目、本地来源和实际规范化路径，不能用项目名出现过代替验证。
- [evidence] 已用真实 0.24.1 运行时复验污染环境：项目仍绑定当前仓库，外部探测路径没有创建。
- [branch] codex/fix-memory-isolation
- [affects] scripts/knowledge.mjs、相关回归测试及 docs/project-knowledge.md。
