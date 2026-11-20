/** Comparação de versões semver — o suficiente para checar releases do app. */
export interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
  /** Identificadores de pré-release (ex.: ["beta", "1"]); vazio em versão final. */
  prerelease: string[];
}

export function parseVersion(raw: string): ParsedVersion | null {
  const value = String(raw ?? "").trim().replace(/^v/i, "");
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(value);
  if (!match) return null;
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    prerelease: match[4] ? match[4].split(".") : [],
  };
}

function comparePrerelease(left: string[], right: string[]): number {
  if (left.length === 0 && right.length === 0) return 0;
  // Versão final é sempre maior que qualquer pré-release.
  if (left.length === 0) return 1;
  if (right.length === 0) return -1;

  const size = Math.max(left.length, right.length);
  for (let index = 0; index < size; index += 1) {
    const a = left[index];
    const b = right[index];
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    const aNumber = /^\d+$/.test(a) ? Number(a) : null;
    const bNumber = /^\d+$/.test(b) ? Number(b) : null;
    if (aNumber !== null && bNumber !== null) {
      if (aNumber !== bNumber) return aNumber < bNumber ? -1 : 1;
      continue;
    }
    if (aNumber !== null) return -1;
    if (bNumber !== null) return 1;
    if (a !== b) return a < b ? -1 : 1;
  }
  return 0;
}

/** Compara duas versões: -1 (a < b), 0 (iguais/inválidas) ou 1 (a > b). */
export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);
  if (!left || !right) return 0;
  if (left.major !== right.major) return left.major < right.major ? -1 : 1;
  if (left.minor !== right.minor) return left.minor < right.minor ? -1 : 1;
  if (left.patch !== right.patch) return left.patch < right.patch ? -1 : 1;
  return comparePrerelease(left.prerelease, right.prerelease);
}

/** `true` quando `candidate` é uma versão mais nova que `current`. */
export function isNewerVersion(candidate: string, current: string): boolean {
  if (!parseVersion(candidate) || !parseVersion(current)) return false;
  return compareVersions(candidate, current) > 0;
}
