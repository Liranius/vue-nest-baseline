---
title: Codex checkpoint - 2026-11-10T12-02-23Z - Basic Memory isolation repair
type: coding_session
permalink: vue-nest-baseline/codex/vue-nest-baseline/codex-checkpoint-2026-11-10-t12-02-23-z-basic-memory-isolation-repair
status: open
project: vue-nest-baseline
repository: Liranius/vue-nest-baseline
repo_root: C:/Users/Liranius/source/repos/vue-nest-baseline
cwd: C:/Users/Liranius/source/repos/vue-nest-baseline
branch: codex/fix-memory-isolation
git_sha: bef1a9d9965331f6b302dba84d96422265156668
started: '2026-11-10T12:02:23Z'
username: Liranius
hostname: PG
capture: deliberate
agent: codex
session_id: 01a1c51d-ac39-7f70-8648-8cd404dbc03f
trigger: compact
model: gpt-6-astra
tags:
  - codex
  - checkpoint
---

# Codex checkpoint - 2026-11-10T12-02-23Z - Basic Memory isolation repair

## Summary

Basic Memory 的 worktree 隔离漏洞已在本地修复，真实运行时污染变量验收通过，正在完成最终全量检查和 Chromium 冒烟。

## Story

本会话最初继续 vue-nest-baseline 与 vue-baseline 的工程能力对齐，完成 Basic Memory 新会话接入验收并按用户分阶段授权提交、推送和创建 PR。审查 [PR #3](https://github.com/Liranius/vue-nest-baseline/pull/3) 时发现启动器继承 BASIC_MEMORY_PROJECTS 等环境变量，能覆盖已经校验的本地配置；旧 doctor 只检查项目名，仍会错误报告成功。审查期间只读核实 PR 已由用户在 2026-11-10T11:21:50Z 合并，代理没有执行合并。

用户随后授权从最新 main 建立修复分支、补充隔离及失败路径测试并完成本地验收；提交、推送和合并仍需后续明确指示。当前修复清除继承的全部 BASIC_MEMORY_*（不区分大小写），由启动器提供 worktree 固定值，并拒绝配置文件中的数据库外部覆盖。doctor 通过 MCP 项目列表核对唯一项目、默认项目、本地来源及规范化实际路径，因此配置文件检查与运行时检查相互补充。

同时补齐 MCP 启动失败、请求超时、子进程回收，以及 hook 的有界执行。25/55 秒的 hook 内部预算为宿主 30/60 秒限制预留退出时间。清除全部 Basic Memory 变量也会清除用户自定义日志偏好，这一取舍已记录在 open 状态决策及接入文档，待用户审阅。

## Working State

持久基线是 main 的 bef1a9d9965331f6b302dba84d96422265156668。当前分支 codex/fix-memory-isolation 尚无 PR；GitHub 只读查询已确认。修复只存在于本机未提交工作区，恢复时必须先核对 diff，不能假定已推送或可以跨机器恢复。

本机运行时和缓存保持 worktree 内隔离。真实 PreCompact 宿主压缩事件仍待验证，保留 docs/project-knowledge.md 的原 TODO；手工调用成功不能替代该证据。vue-tsc 2.2.12 与 vue-router 4.6.4 保持不变，无依赖修改。

## Changed Files

- scripts/knowledge.mjs：环境清理、数据库配置拒绝、实际 MCP 绑定核对、启动失败和超时回收、hook 执行预算。
- tests/knowledge.test.ts：补充数据库覆盖拒绝、损坏 hook JSON、MCP/两类 hook 缺运行时失败。
- tests/knowledge-runtime.test.ts：新增真实 Node 子进程协议测试，覆盖错误绑定、污染环境、失败退出和超时回收。
- docs/project-knowledge.md：说明隔离边界、doctor 检查和测试范围，保留真实 PreCompact TODO。
- docs/knowledge/codex/decisions/Basic Memory runtime environment isolation.md：记录方案理由、代价与验收依据，status 为 open。

## Verification

修复前已用真实 Basic Memory 0.24.1 复现项目名正确但路径被 BASIC_MEMORY_PROJECTS 重定向的问题。修复后，在污染 PROJECTS、DEFAULT_PROJECT、CONFIG_DIR、DATABASE_URL、DATABASE_BACKEND 和 CLOUD_MODE 的环境中，通过 Nx 执行 knowledge-cli 项目列表及 knowledge-doctor，实际路径均为当前仓库 docs/knowledge，doctor 返回 27 个工具及 SessionStart 上下文；外部探针目录未创建。

第一次全量检查的 lint、test、typecheck、build 通过，当时根项目 36 项及 Web 2 项测试通过；仅新决策笔记 YAML 格式未通过 format-check。该格式已修正。随后又为两个 hook 增加缺运行时用例，最终全量重跑尚待完成，不能将旧测试结果当作新 diff 的最终验收。Chromium 冒烟及配置中 hook 入口的最终手工验证也待完成。git diff --check 曾通过，收尾时需再次核对。

Windows 沙箱内创建临时 Git 仓库会受权限限制，相关测试应使用已授权的沙箱外执行。Nx 需设置 NX_DAEMON=false，并将 NX_SOCKET_DIR 指向仓库 .nx/sockets；PowerShell 使用 -NoProfile 避免无关 fnm 配置报错。长日志通过 tool-output 包装器落盘，先读取有界结果，不必复跑已通过的检查。

## References

- [Repository](https://github.com/Liranius/vue-nest-baseline)
- [Current main baseline](https://github.com/Liranius/vue-nest-baseline/commit/bef1a9d9965331f6b302dba84d96422265156668)
- [PR #3 — chore: align engineering guidance and AI workflows](https://github.com/Liranius/vue-nest-baseline/pull/3)
- docs/project-knowledge.md 为当前接入约定入口；本笔记仅保存此次接续状态。

## Observations

- [result] 真实 Basic Memory 运行时的污染变量验收已通过，实际项目路径保持在当前 worktree。
- [decision] 当前授权仅包含修复与本地验收；不提交、推送或合并，依赖保留 vue-tsc 2.2.12 和 vue-router 4.6.4。
- [decision] 真实 PreCompact 宿主事件仍未验证，原有 TODO 保留。
- [next_step] 完成最新 diff 的全量检查、Chromium 冒烟和配置中 hook 入口验证，核对知识记录与差异后汇报本地结果。

## Relations

- relates_to [[Basic Memory runtime environment isolation]]
