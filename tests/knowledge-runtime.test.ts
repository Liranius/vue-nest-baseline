// @vitest-environment node
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const launcher = new URL('../scripts/knowledge.mjs', import.meta.url).href;
const owned: string[] = [];

// A real stdio peer exercises process lifecycle, protocol parsing and environment
// forwarding without installing Python, Basic Memory or models in CI.
const peer = `
const fs = require('node:fs');
const cfg = JSON.parse(fs.readFileSync('scenario.json', 'utf8'));
fs.writeFileSync('child.pid', String(process.pid));
fs.writeFileSync('child-env.json', JSON.stringify(process.env));
if (cfg.mode === 'hang') {
  process.on('SIGTERM', () => {});
  setInterval(() => {}, 1000);
}
require('node:readline').createInterface({input: process.stdin}).on('line', line => {
  const request = JSON.parse(line);
  if (!request.id || cfg.mode === 'hang') return;
  if (cfg.mode === 'exit') {
    process.stderr.write('fixture startup failed');
    process.exit(7);
  }
  let result;
  if (request.method === 'initialize') result = {protocolVersion: '2024-11-05', capabilities: {tools: {}}};
  else if (request.method === 'tools/list') result = {tools: [{name: 'list_memory_projects'}]};
  else if (cfg.mode === 'tool-error') result = {isError: true, content: [{type: 'text', text: 'fixture tool failed'}]};
  else if (cfg.mode === 'text') result = {content: [{type: 'text', text: JSON.stringify(cfg.list)}]};
  else result = {structuredContent: {result: cfg.list}};
  const output = Buffer.from(JSON.stringify({jsonrpc: '2.0', id: request.id, result}) + '\\n');
  const split = output.indexOf(Buffer.from('中'));
  if (split >= 0) {
    process.stdout.write(output.subarray(0, split + 1));
    setTimeout(() => process.stdout.write(output.subarray(split + 1)), 10);
  } else process.stdout.write(output);
});
`;

function fixture(mode = 'structured') {
  const root = realpathSync(mkdtempSync(join(tmpdir(), 'knowledge-runtime-')));
  owned.push(root);
  const notes = join(root, 'knowledge 中文');
  const cache = join(root, 'cache');
  const settings = join(cache, 'settings');
  const foreign = join(root, 'foreign');
  for (const path of [notes, settings, foreign]) mkdirSync(path, { recursive: true });
  const ctx = {
    root,
    notes,
    cache,
    settings,
    project: 'vue-nest-baseline',
    executable: process.execPath,
  };
  const list = {
    projects: [
      { name: ctx.project, path: notes, local_path: notes, source: 'local', is_default: true },
    ],
    default_project: ctx.project,
    constrained_project: null,
  };
  writeFileSync(join(root, 'mcp'), peer);
  return { root, ctx, foreign, scenario: { mode, list } };
}

function run(
  current: ReturnType<typeof fixture>,
  code = 'process.stdout.write(String(await checkMcp(ctx, {timeoutMs: 2000, shutdownTimeoutMs: 100})));',
  env: NodeJS.ProcessEnv = {},
) {
  writeFileSync(join(current.root, 'scenario.json'), JSON.stringify(current.scenario));
  const driver = join(current.root, 'driver.mjs');
  writeFileSync(
    driver,
    `
import {checkMcp, relay} from ${JSON.stringify(launcher)};
const ctx = ${JSON.stringify(current.ctx)};
try { ${code} } catch (error) { console.error(error.message); process.exitCode = 1; }
`,
  );
  return spawnSync(process.execPath, [driver], {
    cwd: current.root,
    env: { ...process.env, ...env },
    encoding: 'utf8',
    windowsHide: true,
    timeout: 6000,
  });
}

function expectStopped(root: string) {
  const pidFile = join(root, 'child.pid');
  expect(existsSync(pidFile)).toBe(true);
  const pid = Number(readFileSync(pidFile, 'utf8'));
  expect(() => process.kill(pid, 0)).toThrow(/ESRCH/);
}

afterEach(() => {
  for (const root of owned.splice(0)) {
    const path = resolve(root);
    if (
      !path.startsWith(`${realpathSync(tmpdir())}${sep}knowledge-runtime-`) ||
      realpathSync(path) !== path
    )
      throw new Error('Not an owned runtime fixture');
    rmSync(path, { recursive: true, force: true });
  }
});

describe('MCP runtime binding and failures', () => {
  it.each(['structured', 'text'])(
    'validates the actual project from %s output with split UTF-8',
    (mode) => {
      const current = fixture(mode);
      const result = run(current);
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(0);
      expect(result.stdout.trim()).toBe('1');
      expectStopped(current.root);
    },
  );

  it.each([
    'foreign-path',
    'relative-path',
    'wrong-name',
    'extra-project',
    'wrong-default',
    'cloud',
  ])('rejects %s even when the expected name appears in the response', (scenario) => {
    const current = fixture();
    const { list } = current.scenario;
    const project = list.projects[0];
    if (scenario === 'foreign-path') project.path = project.local_path = current.foreign;
    if (scenario === 'relative-path') project.path = project.local_path = 'knowledge 中文';
    if (scenario === 'wrong-name') project.name = `${current.ctx.project}-other`;
    if (scenario === 'extra-project') list.projects.push({ ...project, name: 'other' });
    if (scenario === 'wrong-default') list.default_project = 'other';
    if (scenario === 'cloud') project.source = 'cloud';
    const result = run(current);
    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toContain('binding does not match');
    expectStopped(current.root);
  });

  it.each([
    ['exit', 'MCP exited 7'],
    ['tool-error', 'fixture tool failed'],
    ['hang', 'MCP initialize timed out'],
  ])('fails and reaps a peer that reports %s', (mode, message) => {
    const current = fixture(mode);
    const result = run(current, 'await checkMcp(ctx, {timeoutMs: 1000, shutdownTimeoutMs: 100});');
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(message);
    expectStopped(current.root);
  });

  it('reports a spawn failure without waiting for the protocol timeout', () => {
    const current = fixture();
    current.ctx.executable = join(current.root, 'missing-executable');
    const result = run(current);
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('ENOENT');
  });

  it('removes case-insensitive external Basic Memory settings before starting MCP', () => {
    const current = fixture();
    const result = run(current, undefined, {
      BASIC_MEMORY_PROJECTS: JSON.stringify({ 'vue-nest-baseline': { path: current.foreign } }),
      basic_memory_default_project: 'foreign',
      Basic_Memory_Database_Url: 'postgresql://example.invalid/foreign',
      BASIC_MEMORY_DATABASE_BACKEND: 'postgres',
      basic_memory_config_dir: current.foreign,
      BASIC_MEMORY_CLOUD_MODE: 'true',
      BASIC_MEMORY_FORCE_LOCAL: 'false',
      BASIC_MEMORY_MCP_PROJECT: 'foreign',
      BASIC_MEMORY_PROJECT_ROOT: current.foreign,
      REVIEW_UNRELATED_SETTING: 'preserved',
    });
    expect(result.status).toBe(0);
    const childEnv = JSON.parse(
      readFileSync(join(current.root, 'child-env.json'), 'utf8'),
    ) as Record<string, string>;
    const settings = Object.fromEntries(
      Object.entries(childEnv).filter(([name]) => name.toUpperCase().startsWith('BASIC_MEMORY_')),
    );
    expect(settings).toEqual({
      BASIC_MEMORY_CONFIG_DIR: current.ctx.settings,
      BASIC_MEMORY_FORCE_LOCAL: 'true',
      BASIC_MEMORY_DATABASE_BACKEND: 'sqlite',
      BASIC_MEMORY_CLOUD_MODE: 'false',
      BASIC_MEMORY_NO_PROMOS: '1',
      BASIC_MEMORY_AUTO_UPDATE: 'false',
      BASIC_MEMORY_SEMANTIC_EMBEDDING_CACHE_DIR: join(current.ctx.cache, 'models'),
    });
    expect(childEnv.REVIEW_UNRELATED_SETTING).toBe('preserved');
  });
});

describe('hook child lifecycle', () => {
  it('forwards the original hook input and sanitizes the child environment', () => {
    const current = fixture();
    writeFileSync(
      join(current.root, 'hook.cjs'),
      `
let input=''; process.stdin.setEncoding('utf8'); process.stdin.on('data', chunk=>input+=chunk);
process.stdin.on('end',()=>console.log(JSON.stringify({input,projects:process.env.BASIC_MEMORY_PROJECTS,settings:process.env.BASIC_MEMORY_CONFIG_DIR})));
`,
    );
    const payload = JSON.stringify({
      cwd: current.root,
      hook_event_name: 'SessionStart',
      session_id: 'test',
    });
    const result = run(
      current,
      `await relay(ctx, ['hook.cjs'], ${JSON.stringify(payload)}, {timeoutMs: 2000});`,
      { BASIC_MEMORY_PROJECTS: '{}' },
    );
    expect(result.status).toBe(0);
    expect(JSON.parse(result.stdout)).toEqual({ input: payload, settings: current.ctx.settings });
  });

  it.each(['exit', 'hang'])('reports hook %s and removes the child', (mode) => {
    const current = fixture();
    writeFileSync(
      join(current.root, 'hook.cjs'),
      `
require('node:fs').writeFileSync('child.pid', String(process.pid));
${mode === 'exit' ? 'process.exit(9);' : "process.on('SIGTERM',()=>{}); setInterval(()=>{},1000);"}
`,
    );
    const result = run(current, "await relay(ctx, ['hook.cjs'], '{}', {timeoutMs: 1000});");
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(mode === 'exit' ? 'exited 9' : 'timed out');
    expectStopped(current.root);
  });

  it('reports a missing hook executable', () => {
    const current = fixture();
    current.ctx.executable = join(current.root, 'missing-executable');
    const result = run(current, "await relay(ctx, ['hook'], '{}', {timeoutMs: 400});");
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('ENOENT');
  });
});
