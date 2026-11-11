---
title: Minimatch alert 20 deferral
type: decision
permalink: vue-nest-baseline/codex/decisions/minimatch-alert-20-deferral
status: accepted
decided: '2026-11-11T17:02:25+08:00'
project: vue-nest-baseline
sources:
  - README.md
  - package.json
  - pnpm-lock.yaml
tags:
  - dependencies
  - security
---

# Minimatch alert 20 deferral

2026-11-11，项目决定暂缓修复 Dependabot #20。审查基线为 [main 的 f43299e](https://github.com/Liranius/vue-nest-baseline/commit/f43299efe66a94fd6642bd84b9ba63c5c910e878)。后续复查条件以 [README 的依赖安全待办](../../../../README.md#依赖安全待办) 为准。

## Observations

- [decision] 继续使用当前工具链依赖，保留 #20 开放，暂不引入项目维护的补丁或全局版本覆盖。
- [rationale] 生产依赖查询未找到 Minimatch。Nx 在项目筛选、生成器文件匹配和发布分支判断中使用的三个 `makeRe()` 调用均采用默认优化级别 1。公告所述资源耗尽需要外部可控的匹配模式到达优化级别 2 或更高的调用。此项核查仅覆盖上述 Nx 路径。[安全公告](https://github.com/isaacs/minimatch/security/advisories/GHSA-g3hv-75wg-m249)
- [alternative] 为 10.2.5 回补安全修复可以保留 `makeRe()`，但需要项目自行维护补丁，且只覆盖 Nx 的副本。
- [alternative] 全局升级到 11 会移除 Nx 正在使用的 `makeRe()`。上游提出用 `Minimatch.match()` 替代；本机对照发现 `release/**` 对分支 `release` 的匹配结果从真变为假。评估兼容修复时需复核这一行为。[Nx PR #37730](https://github.com/nrwl/nx/pull/37730)
- [consequence] 工具链中的受影响版本仍会出现在审计中。处置完成前继续通过 [Dependabot #20](https://github.com/Liranius/vue-nest-baseline/security/dependabot/20) 跟踪。
