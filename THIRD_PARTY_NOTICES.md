# 第三方材料与许可范围

本仓库自有代码适用 [MIT 许可证](LICENSE)。直接收录的第三方材料保留各自的版权和许可；包管理器安装的依赖遵循各自许可证。

## Nx AI 配置材料

来源：[nrwl/nx-ai-agents-config](https://github.com/nrwl/nx-ai-agents-config)。Nx 的 AI 配置工具从该仓库的 `generated` 目录生成各 agent 的配置材料。
本仓收录范围为：

- [.agents/skills](.agents/skills)、[.github/skills](.github/skills)、[.opencode/skills](.opencode/skills) 中的 `link-workspace-packages`、`monitor-ci`、`nx-generate`、`nx-import`、`nx-plugins`、`nx-run-tasks`、`nx-workspace` 及随附文件。
- [.cursor/skills](.cursor/skills) 中的同名技能及随附文件，其中未收录 `nx-import`。
- [.cursor/agents/ci-monitor-subagent.md](.cursor/agents/ci-monitor-subagent.md)、[.cursor/commands/monitor-ci.md](.cursor/commands/monitor-ci.md)。
- [.github/agents/ci-monitor-subagent.agent.md](.github/agents/ci-monitor-subagent.agent.md)、[.github/prompts/monitor-ci.prompt.md](.github/prompts/monitor-ci.prompt.md)。
- [.opencode/agents/ci-monitor-subagent.md](.opencode/agents/ci-monitor-subagent.md)、[.opencode/commands/monitor-ci.md](.opencode/commands/monitor-ci.md)。

这些文件随 Nx 工程初始化提交 `f054887ca5a76d7009b617ee0d79d18617057193`（2026-11-03）收录，此后至本次许可补全未修改其内容。
2026-11-10 核对了上游 [许可证固定快照](https://github.com/nrwl/nx-ai-agents-config/blob/13282936b5f6aa53e3d41ba589a4a2dc0d6f5786/LICENSE)，以下保留该 MIT 许可原文。
该快照用于许可核对，不代表现有技能均来自这一提交。

TODO: 首次导入未记录上游提交，各 agent 目录的内容版本也存在差异。下次更新 Nx AI 材料时，记录对应的上游提交、生成范围和本地适配，并重新核对许可证。
现有副本以本仓历史为准；升级前复查技能指令及格式、lint 排除范围。

## Nx 生成代码与说明

初始工程由 Nx 生成，包含 Web 示例组件、测试和工程模板；后续项目适配见 Git 历史。
[AGENTS.md](AGENTS.md) 与 [CLAUDE.md](CLAUDE.md) 中的 `nx configuration` 区块继续由 Nx 维护，项目约定写在区块外。
当前 `nx@24.0.0` 包的 MIT 许可证与下文一致；项目自行添加的说明不改变第三方原有版权。

## Nx 材料的 MIT 许可原文

```text
(The MIT License)

Copyright (c) 2017-2026 Narwhal Technologies Inc.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
