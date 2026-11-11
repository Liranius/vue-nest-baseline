---
title: 会话自动压缩与恢复（PreCompact）
type: note
permalink: vue-nest-baseline/codex/remember/会话自动压缩与恢复-pre-compact
sources:
  - docs/project-knowledge.md
tags:
  - codex
  - manual-capture
---

# 会话自动压缩与恢复（PreCompact）

## 会话自动压缩后怎样确认项目上下文已经恢复？

核对同一会话的 PreCompact 和 SessionStart 事件，再查看恢复后的会话是否实际收到了本项目的 Basic Memory 上下文。2026-11-11 已在 `vue-nest-baseline` 验证这一过程。[本次接入验收](../../../project-knowledge.md#本次接入验收)
