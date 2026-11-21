#!/usr/bin/env node
/**
 * Release completo do EliasNote em um comando:
 *
 *   1. valida o repositório (branch, sincronia, conflitos, tag livre);
 *   2. roda typecheck, testes, build do app e build do site (e cargo quando o Rust mudou);
 *   3. sincroniza a versão nos manifestos, no site e nos Cargo.lock;
 *   4. faz o commit, cria a tag anotada e empurra main + tag;
 *   5. acompanha o workflow de release no GitHub até o fim e lista os assets.
 *
 * Uso:
 *   npm run release -- "feat: descrição da mudança"
 *   npm run release -- "fix: ..." --minor
 *   npm run release -- --dry-run
 *
 * Opções:
 *   -m, --message <texto>  Mensagem do commit (ou passe como argumento solto)
 *   --patch                Incremento de patch (padrão)
 *   --minor                Incremento de minor
 *   --major                Incremento de major
 *   --version <x.y.z>      Versão explícita (sobrepõe o incremento)
 *   --branch <nome>        Branch de push (padrão: main)
 *   --dry-run              Mostra o plano sem alterar nada
 *   --skip-checks          Pula typecheck/testes/build
 *   --skip-cargo           Pula o cargo check
 *   --no-watch             Não acompanha o workflow no GitHub
 *   --timeout <minutos>    Tempo máximo de acompanhamento (padrão: 45)
 *   -h, --help             Mostra esta ajuda
 *
 * Token: defina GITHUB_TOKEN (ou GH_TOKEN) para 5000 req/h na API; sem token
 * o limite anônimo (60 req/h) ainda cobre uma execução, mas é apertado.
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SEMVER = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const isWindows = process.platform === "win32";

// ---------------------------------------------------------------------------
// Saída no terminal
// ---------------------------------------------------------------------------

const step = (message) => console.log(`\n== ${message}`);
const info = (message) => console.log(`   ${message}`);
const warn = (message) => console.log(`!  ${message}`);
const fail = (message) => {
  console.error(`\nX  ${message}`);
  process.exit(1);
};

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const options = {
    message: "",
    bump: "patch",
    version: "",
    branch: "main",
    dryRun: false,
    skipChecks: false,
    skipCargo: false,
    watch: true,
    timeoutMinutes: 45,
    help: false,
  };
  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = () => {
      const value = argv[index + 1];
      if (value === undefined) fail(`faltou valor para ${arg}`);
      index += 1;
      return value;
    };

    switch (arg) {
      case "-m":
      case "--message":
        options.message = next();
        break;
      case "--patch":
        options.bump = "patch";
        break;
      case "--minor":
        options.bump = "minor";
        break;
      case "--major":
        options.bump = "major";
        break;
      case "--version":
        options.version = next();
        break;
      case "--branch":
        options.branch = next();
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--skip-checks":
        options.skipChecks = true;
        break;
      case "--skip-cargo":
        options.skipCargo = true;
        break;
      case "--no-watch":
        options.watch = false;
        break;
      case "--timeout":
        options.timeoutMinutes = Number(next()) || 45;
        break;
      case "-h":
      case "--help":
        options.help = true;
        break;
      default:
        if (arg.startsWith("-")) fail(`opção desconhecida: ${arg}`);
        positional.push(arg);
        break;
    }
  }

  if (!options.message && positional.length > 0) options.message = positional.join(" ");
  return options;
}

function printHelp() {
  console.log(
    [
      "EliasNote — release em um comando",
      "",
      '  npm run release -- "feat: minha mudança"        patch (padrão)',
      '  npm run release -- "feat: recurso" --minor      minor',
      "  npm run release -- --version 1.0.0              versão explícita",
      "  npm run release -- --dry-run                    só mostra o plano",
      "",
      "Fluxo: branch/sincronia -> checks -> set-version -> commit -> tag -> push -> workflow.",
      "Variáveis: GITHUB_TOKEN (ou GH_TOKEN) para elevar o limite da API do GitHub.",
    ].join("\n"),
  );
}

// ---------------------------------------------------------------------------
// Processos e git
// ---------------------------------------------------------------------------

function run(command, args, { cwd = root, capture = false, allowFail = false, shell = false } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    shell,
    encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit",
  });
  const status = result.status ?? 1;
  if (status !== 0 && !allowFail) {
    fail(`comando falhou (${status}): ${command} ${args.join(" ")}`);
  }
  return { status, stdout: (result.stdout ?? "").trim(), stderr: (result.stderr ?? "").trim() };
}

const git = (args, options = {}) => run("git", args, { capture: true, ...options });
const gitOk = (args) => git(args, { allowFail: true }).status === 0;
const npm = (args) => run("npm", args, { shell: isWindows });

function changedFiles() {
  const { stdout } = git(["status", "--porcelain"]);
  if (!stdout) return [];
  return stdout
    .split("\n")
    .map((line) => line.slice(3).trim())
    .map((path) => path.replace(/^.* -> /, ""))
    .filter(Boolean);
}

function currentVersion() {
  return JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
}

function nextVersion(current, options) {
  if (options.version) {
    if (!SEMVER.test(options.version)) fail(`versão inválida: ${options.version}`);
    return options.version;
  }
  const [major, minor, patch] = current.split(".").map((part) => Number(part));
  if (options.bump === "major") return `${major + 1}.0.0`;
  if (options.bump === "minor") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

function remoteRepo() {
  const { stdout } = git(["remote", "get-url", "origin"], { allowFail: true });
  const match = /github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?/i.exec(stdout);
  return match ? `${match[1]}/${match[2]}` : "HenriqueNaTTo/EliasNote";
}

// ---------------------------------------------------------------------------
// GitHub API (acompanhamento do workflow)
// ---------------------------------------------------------------------------

const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const repository = remoteRepo();

async function api(path) {
  const response = await fetch(`https://api.github.com/repos/${repository}${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "eliasnote-release-script",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (response.status === 403 || response.status === 429) {
    const reset = Number(response.headers.get("x-ratelimit-reset") ?? 0) * 1000;
    const retryAfter = Number(response.headers.get("retry-after") ?? 0) * 1000;
    const error = new Error("limite de requisições do GitHub atingido (defina GITHUB_TOKEN)");
    error.rateLimitUntil = reset || Date.now() + retryAfter || Date.now() + 60000;
    throw error;
  }
  if (!response.ok) throw new Error(`GitHub ${response.status} em ${path}`);
  return response.json();
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Executa uma chamada da API esperando a janela do limite quando ela estoura.
 * Libera o processo de falhar por completo: o acompanhamento é só conveniência.
 */
async function withRateLimit(deadline, task) {
  for (;;) {
    try {
      return await task();
    } catch (error) {
      if (!error.rateLimitUntil) throw error;
      const wait = Math.max(5000, error.rateLimitUntil - Date.now()) + 2000;
      if (Date.now() + wait > deadline) throw error;
      warn(`limite da API atingido: aguardando ${Math.ceil(wait / 1000)}s para retomar`);
      await sleep(wait);
    }
  }
}

async function findRun(tag, deadline) {
  while (Date.now() < deadline) {
    const runs = await withRateLimit(deadline, () => api("/actions/runs?per_page=20"));
    const run = runs.workflow_runs?.find(
      (candidate) => candidate.head_branch === tag || candidate.display_title?.includes(tag),
    );
    if (run) return run;
    await sleep(5000);
  }
  throw new Error(`workflow da tag ${tag} não apareceu na API`);
}

const JOB_LABELS = {
  success: "ok",
  failure: "falhou",
  cancelled: "cancelado",
  skipped: "pulado",
};

async function watchWorkflow(tag, timeoutMinutes) {
  const deadline = Date.now() + timeoutMinutes * 60 * 1000;
  step(`Acompanhando o workflow da tag ${tag}`);
  if (!token) warn("sem GITHUB_TOKEN: usando o limite anônimo da API (60 req/h)");

  let run = await findRun(tag, deadline);
  info(`run: ${run.html_url}`);
  const started = Date.now();
  let lastSignature = "";
  let tick = 0;

  while (Date.now() < deadline) {
    tick += 1;
    if (tick > 1) await sleep(30000);
    run = await withRateLimit(deadline, () => api(`/actions/runs/${run.id}`));

    if (tick % 3 === 1) {
      const { jobs } = await withRateLimit(deadline, () => api(`/actions/runs/${run.id}/jobs`));
      const lines = (jobs ?? []).map(
        (job) => `${job.name}: ${job.status}${job.conclusion ? ` (${JOB_LABELS[job.conclusion] ?? job.conclusion})` : ""}`,
      );
      const signature = lines.join("|");
      if (signature !== lastSignature) {
        lastSignature = signature;
        const elapsed = Math.round((Date.now() - started) / 1000);
        info(`[${elapsed}s] ${run.status}${run.conclusion ? ` (${JOB_LABELS[run.conclusion] ?? run.conclusion})` : ""}`);
        for (const line of lines) info(`  - ${line}`);
      }
    }

    if (run.status === "completed") {
      if (run.conclusion !== "success") {
        warn(`workflow terminou com "${run.conclusion}": ${run.html_url}`);
        process.exit(1);
      }
      return run.html_url;
    }
  }

  warn(`tempo esgotado (${timeoutMinutes} min); acompanhe em ${run.html_url}`);
  process.exit(1);
}

async function describeRelease(tag) {
  try {
    const release = await withRateLimit(Date.now() + 3 * 60 * 1000, () => api(`/releases/tags/${tag}`));
    step("Release publicada");
    info(release.html_url);
    for (const asset of release.assets ?? []) {
      const size = (asset.size / (1024 * 1024)).toFixed(1);
      info(`  - ${asset.name} (${size} MB)`);
    }
    return release.html_url;
  } catch (error) {
    warn(`não consegui listar a release: ${error.message}`);
    return "";
  }
}

// ---------------------------------------------------------------------------
// Fluxo principal
// ---------------------------------------------------------------------------

async function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const version = currentVersion();

  step("Validando o repositório");
  if (!gitOk(["rev-parse", "--is-inside-work-tree"])) fail("não é um repositório git");
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]).stdout;
  if (branch !== options.branch) {
    fail(`branch atual "${branch}"; a release sai de "${options.branch}" (use --branch para mudar)`);
  }
  if (git(["diff", "--name-only", "--diff-filter=U"]).stdout) fail("há conflitos de merge não resolvidos");

  git(["fetch", "--tags", "origin", "--quiet"], { allowFail: true });
  const behind = Number(git(["rev-list", "--count", `HEAD..origin/${options.branch}`], { allowFail: true }).stdout || 0);
  if (behind > 0) fail(`a branch está ${behind} commit(s) atrás de origin/${options.branch}: rode git pull antes`);

  const target = nextVersion(version, options);
  const tag = `v${target}`;
  if (gitOk(["rev-parse", "--verify", `refs/tags/${tag}`])) fail(`a tag ${tag} já existe localmente`);
  if (git(["ls-remote", "--tags", "origin", tag], { allowFail: true }).stdout) fail(`a tag ${tag} já existe no remoto`);

  const changed = changedFiles();
  const appChanged = changed.some((path) => path.startsWith("src/") && !path.startsWith("src/landing/"));
  const siteChanged = changed.some((path) => path.startsWith("src/landing/"));
  const rustChanged = changed.some(
    (path) => path.endsWith(".rs") || path === "src-tauri/Cargo.toml" || path === "setup/src-tauri/Cargo.toml",
  );
  info(`${changed.length} arquivo(s) com mudanças`);
  if (changed.length === 0) info("nenhuma mudança pendente: a release leva só o novo número de versão");

  if (appChanged && !siteChanged) {
    warn("mudou código do app e nada em src/landing: confirme se o site precisa de atualização");
    warn("  (src/landing/data.ts, src/landing/site.ts e os 4 locales)");
  }

  const message = options.message.trim() || `chore(release): versão ${target}`;
  const commitMessage = message.includes(target) ? message : `${message} (${tag})`;

  const checks = options.skipChecks
    ? []
    : [
        ["typecheck", ["run", "typecheck"]],
        ["testes", ["test"]],
        ["build do app", ["run", "build"]],
        ["build do site", ["run", "build:site"]],
      ];

  step("Plano");
  info(`versão: ${version} -> ${target}  (tag ${tag})`);
  info(`commit: "${commitMessage}"`);
  info(`checks: ${options.skipChecks ? "pulados" : checks.map(([label]) => label).join(", ")}`);
  info(`cargo check: ${rustChanged && !options.skipCargo ? "sim (Rust mudou)" : "não"}`);
  info(`push: origin ${options.branch} + ${tag}`);
  info(`workflow: ${options.watch ? "acompanhar até o fim" : "não acompanhar"}`);

  if (options.dryRun) {
    step("Dry-run: nada foi alterado");
    return;
  }

  for (const [label, args] of checks) {
    step(`Verificando: ${label}`);
    npm(args);
  }

  if (rustChanged && !options.skipCargo) {
    const hasCargo = spawnSync("cargo", ["--version"], { shell: true, stdio: "ignore" }).status === 0;
    if (!hasCargo) {
      warn("cargo não encontrado; pulando cargo check");
    } else {
      for (const dir of ["src-tauri", "setup/src-tauri"]) {
        step(`Verificando: cargo check (${dir})`);
        run("cargo", ["check", "--locked"], { cwd: join(root, dir) });
      }
    }
  }

  step(`Sincronizando a versão ${target}`);
  run("node", ["scripts/set-version.mjs", target]);

  step("Commit");
  run("git", ["add", "-A"]);
  run("git", ["commit", "-m", commitMessage]);

  step(`Criando a tag ${tag}`);
  run("git", ["tag", "-a", tag, "-m", `EliasNote ${tag}`]);

  step(`Enviando a ${options.branch} e a tag`);
  run("git", ["push", "origin", options.branch, "--follow-tags"]);

  info(`site: o deploy do Vercel parte do push na ${options.branch} (APP_VERSION = ${target})`);

  if (!options.watch) {
    step("Pronto (acompanhe o workflow em https://github.com/" + repository + "/actions)");
    return;
  }

  let runUrl = "";
  try {
    runUrl = await watchWorkflow(tag, options.timeoutMinutes);
  } catch (error) {
    warn(`acompanhamento interrompido: ${error instanceof Error ? error.message : String(error)}`);
    warn(`a release já foi enviada; acompanhe em https://github.com/${repository}/actions`);
  }
  await describeRelease(tag);

  step("Release concluída");
  info(`workflow: ${runUrl || `https://github.com/${repository}/actions`}`);
  info(`release: https://github.com/${repository}/releases/tag/${tag}`);
}

main().catch((error) => {
  warn(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
