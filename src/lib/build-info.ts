/**
 * Build-version 数据源。commit 与 date 解耦：
 * - CI：GITHUB_SHA
 * - 本地：_data/build.yml
 * js-yaml 会把 `date: 2026-05-22` 解析为 Date，须 formatDateValue 转为 YYYY-MM-DD。
 */
import path from 'node:path';
import yaml from 'js-yaml';

export interface BuildInfo {
  commit: string;
  sha: string;
  date: string;
}

function formatDateValue(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

export function getBuildInfo(): BuildInfo | null {
  let commit: string | undefined;
  let sha: string | undefined;
  let date: string | undefined;

  if (process.env.GITHUB_SHA) {
    sha = process.env.GITHUB_SHA;
    commit = sha.slice(0, 7);
  }

  const buildPath = path.join(process.cwd(), '_data/build.yml');
  if (fs.existsSync(buildPath)) {
    const data = yaml.load(fs.readFileSync(buildPath, 'utf8')) as Partial<BuildInfo>;
    if (!commit && data.commit) {
      commit = data.commit;
    }
    if (!sha && data.sha) {
      sha = data.sha;
    }
    if (data.date) {
      date = formatDateValue(data.date);
    }
  }

  if (!commit) {
    return null;
  }

  return {
    commit,
    sha: sha || commit,
    date: formatDateValue(date),
  };
}
