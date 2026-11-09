# New Nx Repository

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

✨ Your new, shiny [Nx workspace](https://nx.dev) is ready ✨.

[Learn more about this workspace setup and its capabilities](https://nx.dev/docs/technologies/typescript/introduction?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or run `npx nx graph` to visually explore what was created. Now, let's get you up to speed!

🚀 If you haven't connected to Nx Cloud yet, [complete your setup here](https://cloud.nx.app/get-started). Get faster builds with remote caching, distributed task execution, and self-healing CI. [See how your workspace can benefit](#nx-cloud).

## Development environment

Use Node.js 24.21.0 from `.node-version` and pnpm 12.4.2 from `packageManager`.
The supported Node range is `>=24.21.0 <25`; CI reads `.node-version` directly.
For example, with fnm installed, run `fnm install` followed by `fnm use` in this
directory before installing dependencies:

```sh
pnpm install --frozen-lockfile
pnpm exec nx run @baseline/source:hooks-install
```

`pnpm-workspace.yaml` enforces dependency engine and peer dependency compatibility.
`package.json` uses `devEngines.runtime` with `onFail: error` to enforce the
`engines.node` range when running pnpm commands. Keep both ranges in sync when
updating Node, and switch to `.node-version` before running tasks. Direct
dependencies use exact versions, and `saveExact` keeps future additions exact.
Update dependency versions deliberately and commit `package.json` together with
`pnpm-lock.yaml`. The existing dependency build-script allowlist remains in effect.

Editor recommendations are listed in `.vscode/extensions.json`, including Vue,
Vitest, Playwright, ESLint, Oxc, EditorConfig, and Nx Console. `.editorconfig`
defines UTF-8, two-space indentation, LF line endings, a final newline, and a
100-character line width; Markdown keeps trailing spaces. Git's `.gitattributes`
normalizes text to LF and checks out `.cmd` and `.bat` scripts with CRLF.
Oxfmt remains the formatter used by the workspace targets and Git hooks.

## Generate a library

```sh
npx nx g @nx/js:lib packages/pkg1 --publishable --importPath=@my-org/pkg1
```

## Run tasks

### Build and type checking

```sh
pnpm exec nx run @baseline/web:build
pnpm exec nx run @baseline/web:typecheck
pnpm exec nx run @baseline/web:build-only
```

`build` requires both Vite bundling and Vue/TypeScript checking to succeed.
`typecheck` checks the app, unit tests, Vite config, and root Vitest config
independently of bundling.
Its cache includes test files, TypeScript configs, and dependency versions.
Type declarations and incremental state are cached in `apps/web/out-tsc`, separate
from the deployable bundle in `apps/web/dist`.

Browser code uses `@vue/tsconfig` with `noUncheckedIndexedAccess`. Unit-test types
extend the browser configuration and cover `src/**/*.{test,spec}.*`,
`src/**/__tests__/`, and `tests/`. Node tool configs and browser-test runners use
`@tsconfig/node24` with explicit Node types. The root Vitest config has its own
`@baseline/source:typecheck` target and stores outputs in `out-tsc/node`;
the Web type-check target includes it as a prerequisite. Declaration output stays
enabled for Nx project references.

TODO: Revisit the `vue-tsc` 3.x upgrade when the Nx Vue plugin supports it.
`@nx/vue@24.0.0` declares `vue-tsc ^2.0.0`, so this workspace keeps `2.2.12`
with strict peer dependency checks enabled.

`build-only` runs just Vite; pass bundler options such as `--mode` to this target.
The `preview` and `serve-static` targets depend on the complete `build` check.

Within the Web app, `@/` resolves to `apps/web/src/`, for example `@/router`.
Vite defines the runtime alias and `tsconfig.app.json` defines the matching
TypeScript paths; unit tests inherit both through the Vite config and
`tsconfig.spec.json`. Keep these mappings in sync. This alias is local to the Web
app; imports from other workspace packages use their package names.

### State management

The Web entry point registers a fresh Pinia instance before Vue Router.
`apps/web/src/stores/counter.ts` provides the baseline setup-store example with
`count`, the derived `doubleCount`, and an `increment` action. Import it with
`@/stores/counter` and call `useCounterStore()` from component setup; outside
components, use it after Pinia is installed or pass the instance explicitly.

Dependencies include `pinia` and its required `@vue/devtools-api` peer at exact
versions. Component tests create their own Pinia instance. The store integration
test checks reactive updates shared by sibling components and state isolation
between separate instances.

### Web environment variables

`apps/web/env/.env` provides public defaults, including `VITE_APP_TITLE` for the
browser tab title. No local configuration is required to start or build the app.
For personal overrides, copy `apps/web/env/.env.example` to
`apps/web/env/.env.local`. Local and mode-specific override files are Git-ignored;
the defaults and example are committed. All `VITE_*` values are exposed to the
client, so use them only for public configuration.

Vite's `envDir` points to this directory so Nx does not preload the same files
into `process.env` and change Vite's precedence. From highest to lowest priority:
existing process variables, `.env.[mode].local`, `.env.[mode]`, `.env.local`, `.env`.
Development uses `development`; builds use `production` unless `--mode` is passed
to `build-only`. Restart the dev server after changing environment files; preview
serves the values from the last build.

`apps/web/src/env.d.ts` enables strict `import.meta.env` names. When adding a public
variable, declare it there, provide its default and example, and add its process
environment input to `webEnvironment` in `apps/web/project.json`. That named input
extends the app's default inputs, covering builds and all inferred unit-test
targets. It hashes ignored `env/.env*` files as well as `VITE_APP_TITLE` and
`NODE_ENV`, so local overrides and shell values cannot reuse stale cached results.

### Unit tests

```sh
pnpm exec nx run @baseline/web:test
pnpm exec nx run @baseline/web:test-watch
```

`test` runs once and can use Nx caching. `test-watch` runs continuously, reruns
affected tests after file changes, and disables Nx caching. Both use the same
Vitest configuration and build workspace dependencies first. Stop the watcher
with Ctrl+C; test failures keep it running so fixing the file can trigger a rerun.
CI uses the single-run `test` target.

### Browser tests

Install Chromium once, then run the default smoke test:

```sh
pnpm exec playwright install chromium
pnpm exec nx run @baseline/web-e2e:e2e
```

For all three browsers:

```sh
pnpm exec playwright install chromium firefox webkit
pnpm exec nx run @baseline/web-e2e:e2e --configuration=all
```

Both commands build and type-check first, then start a fresh production preview
at `http://127.0.0.1:4173`. Playwright stops the server when the run ends and fails
if the port is already occupied. E2E results are not cached; build and type-check
tasks retain their caches. Use the Nx entry points so their prerequisites run.
The existing `BASE_URL` override changes the test destination while the local
preview still starts; leave it unset to test this checkout's production bundle.

Failed tests retain screenshots and traces under
`apps/web-e2e/test-output/playwright/output/`. The HTML report is written to
`apps/web-e2e/test-output/playwright/report/` without opening automatically.
CI runs the Chromium smoke test and uploads these directories on failure,
retaining them for seven days.

### Formatting

Oxfmt is the project's formatter. Use these Nx project targets locally and in CI:

```sh
pnpm exec nx run @baseline/source:format
pnpm exec nx run @baseline/source:format-check
```

`format` rewrites files; `format-check` checks the whole workspace without writing.
The configuration enables single quotes, import sorting, and Tailwind class sorting.
Generated outputs and bundled third-party Nx skills are excluded from formatting;
project code, configuration, and documentation remain checked.

### Lint

Run all code and style checks through Nx:

```sh
pnpm exec nx run-many -t lint
```

The `@baseline/web:lint` target runs Oxlint, type-aware ESLint (including Vue
and Vitest rules), and Stylelint for CSS and Vue styles. `@baseline/web-e2e:lint`
also runs ESLint with Playwright rules. Both include `@baseline/source:lint`,
which checks the root ESLint, Stylelint, and Vitest configuration files.

The `lint` targets check without changing files and are used by CI. To apply
available fixes across all projects or just the Web app:

```sh
pnpm exec nx run-many -t lint-fix
pnpm exec nx run @baseline/web:lint-fix
```

Each `lint-fix` target disables Nx caching and runs its applicable checkers in
order: Oxlint, ESLint, then Stylelint for Web styles. Web and E2E run the root
configuration fixes first. Remaining errors fail the command; fixes already
applied are kept in the working tree. Review the diff, then rerun `lint`.
Both Web style-checking commands explicitly select the root Stylelint config,
including when `NODE_ENV=test` limits automatic config discovery.
Formatting is handled separately by the `format` target.

`eslint-config-prettier` only disables conflicting ESLint
format rules; it does not install or run a formatter. Oxfmt handles formatting,
and `eslint-plugin-oxlint` disables ESLint rules already checked by Oxlint.

### Git hooks and commit messages

After installing dependencies, install the hooks once in each checkout:

```sh
pnpm exec nx run @baseline/source:hooks-install
```

Lefthook's `pre-commit` hook runs Oxlint, ESLint, Stylelint, then Oxfmt on
applicable staged files. It fixes files and stages the fixes automatically.
Generated outputs and bundled third-party skills are excluded. The hook targets
disable Nx caching because they depend on the current Git index and modify files.
CI still checks the whole workspace without applying fixes.

The `commit-msg` hook uses Commitlint's Conventional Commits preset, with no
default message exemptions. For example, use `feat(web): add settings page`
or `fix(web): handle missing user`. PR CI checks every non-merge commit between
the PR's base and head; checking only the latest commit or PR title is insufficient.

To check a message file manually:

```sh
pnpm exec nx run @baseline/source:commitlint -- --edit path/to/message.txt
```

Lefthook's dependency install script is disabled in `pnpm-workspace.yaml`;
hook installation is explicit through the Nx target above.

To build the library use:

```sh
npx nx run pkg1:build
```

To run any task with Nx use:

```sh
npx nx run <project-name>:<target>
```

These targets are either [inferred automatically](https://nx.dev/docs/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/docs/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Continuous integration

GitHub Actions runs on pull requests, pushes to `main`, and manual dispatches.
For the same workflow, event, and ref, a new run cancels the previous run.
The `Checks` job has a 15-minute timeout and runs the existing Nx formatting,
lint, unit-test, build, type-check, and Chromium smoke-test targets after a frozen
dependency install. Pull requests also validate all non-merge commit messages
between the event's base and head SHAs. Browser failures retain the report and
traces for seven days.

The final verifier requires every mandatory step's original `outcome` to be
`success`, including commit validation on pull requests. The separate summary job
requires both a successful `Checks` job and its explicit `verified=true` output;
failed, skipped, missing, or cancelled checks cannot satisfy this gate. Its timeout
is two minutes, and a cancelled workflow is explicitly rejected.

The summary is named `Quality` on pull requests and `CI result` on other events.
When configuring GitHub branch rules, select `Quality` as the required check;
these workflow files do not configure branch rules themselves.

Actions use full commit SHA pins with version comments. Checkout fetches full
history without persisting credentials. Dependabot checks GitHub Actions updates
weekly; dependency updates still require review and CI.

## Versioning and releasing

To version and release the library use

```
npx nx release
```

Pass `--dry-run` to see what would happen without actually releasing the library.

[Learn more about Nx release &raquo;](https://nx.dev/docs/features/manage-releases?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Keep TypeScript project references up to date

Nx automatically updates TypeScript [project references](https://www.typescriptlang.org/docs/handbook/project-references.html) in `tsconfig.json` files to ensure they remain accurate based on your project dependencies (`import` or `require` statements). This sync is automatically done when running tasks such as `build` or `typecheck`, which require updated references to function correctly.

To manually trigger the process to sync the project graph dependencies information to the TypeScript project references, run the following command:

```sh
npx nx sync
```

You can enforce that the TypeScript project references are always in the correct state when running in CI by adding a step to your CI job configuration that runs the following command:

```sh
npx nx sync:check
```

[Learn more about nx sync](https://nx.dev/reference/nx-commands#sync)

## Nx Cloud

Nx Cloud ensures a [fast and scalable CI](https://nx.dev/nx-cloud?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) pipeline. It includes features such as:

- [Remote caching](https://nx.dev/docs/features/ci-features/remote-cache?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task distribution across multiple machines](https://nx.dev/docs/features/ci-features/distribute-task-execution?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Automated e2e test splitting](https://nx.dev/docs/features/ci-features/split-e2e-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
- [Task flakiness detection and rerunning](https://nx.dev/docs/features/ci-features/flaky-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

### Set up CI (non-Github Actions CI)

**Note:** This is only required if your CI provider is not GitHub Actions.

Use the following command to configure a CI workflow for your workspace:

```sh
npx nx g ci-workflow
```

[Learn more about Nx on CI](https://nx.dev/docs/features/ci-features?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/docs/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🔗 Learn More

- [Nx Documentation](https://nx.dev/docs)
- [Crafting Your Workspace Tutorial](https://nx.dev/docs/getting-started/tutorials/crafting-your-workspace)
- [Module Boundaries](https://nx.dev/docs/features/enforce-module-boundaries)
- [Releasing Packages](https://nx.dev/docs/features/manage-releases)
- [Nx Plugins](https://nx.dev/docs/concepts/nx-plugins)
- [Nx Cloud](https://nx.dev/nx-cloud)

## 💬 Community

Join the Nx community:

- [Discord](https://go.nx.dev/community)
- [X (Twitter)](https://twitter.com/nxdevtools)
- [LinkedIn](https://www.linkedin.com/company/nrwl)
- [YouTube](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog)
