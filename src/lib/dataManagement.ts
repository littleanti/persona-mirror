// 백업 내보내기·가져오기·전체 로컬 데이터 삭제(TRD §3.13). SettingsPage가 이 모듈만 부르고
// repos/db를 직접 만지지 않는다 — 백업·전체 삭제는 페르소나·기록·드래프트·키를 가로지르는
// 작업이라 특정 도메인 모듈에 넣을 자리가 없어 이 모듈이 예외적으로 repos와 db를 함께 부른다.

import { STORE_ANALYSES, STORE_PERSONAS } from '@/lib/config';
import { initDB } from '@/lib/db';
import { clearAllThreadDrafts, importThreadDrafts, listThreadDrafts } from '@/lib/drafts';
import { clearApiKey } from '@/lib/repos/settingsRepo';
import { analysisRepo } from '@/lib/repos/analysisRepo';
import { personaRepo } from '@/lib/repos/personaRepo';
import type { AnalysisRecord, PersonaRecord } from '@/lib/types';

/** 백업 파일 스키마. API 키 필드는 두지 않는다 — 실수로 담길 자리가 없다. */
export interface PersoraBackup {
  app: 'persora';
  version: 1;
  exported_at: string;
  personas: PersonaRecord[];
  analyses: AnalysisRecord[];
  drafts: Record<string, string>;
}

export interface ImportResult {
  personas: number;
  analyses: number;
  drafts: number;
}

/** 현재 로컬 데이터를 모아 백업 객체를 만든다(파일 생성은 downloadBackup이 담당). */
export async function exportAppData(): Promise<PersoraBackup> {
  return {
    app: 'persora',
    version: 1,
    exported_at: new Date().toISOString(),
    personas: await personaRepo.list(),
    analyses: await analysisRepo.list(),
    drafts: listThreadDrafts(),
  };
}

/** 백업 객체를 JSON 파일로 다운로드한다. */
export function downloadBackup(data: PersoraBackup): void {
  const date = data.exported_at.slice(0, 10);
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `persora-backup-${date}.json`;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * 백업 파일을 가져와 로컬 데이터에 병합한다. 먼저 검증하고 그다음 쓴다 — 형식이 맞지
 * 않으면 throw하고 저장소는 한 글자도 바뀌지 않는다. personas·analyses는 한 트랜잭션으로
 * put하므로 같은 id는 덮어쓰고 없는 것은 추가된다(지우는 경로 없음).
 */
export async function importAppData(raw: unknown): Promise<ImportResult> {
  const data = parseBackup(raw);
  await putBackupRecords(data.personas, data.analyses);
  importThreadDrafts(data.drafts);
  return {
    personas: data.personas.length,
    analyses: data.analyses.length,
    drafts: Object.keys(data.drafts).length,
  };
}

/** API 키·스레드 드래프트·페르소나·분석 기록을 모두 삭제한다. DB_VERSION은 바꾸지 않는다. */
export async function clearAllLocalAppData(): Promise<void> {
  clearApiKey();
  clearAllThreadDrafts();
  await clearStores();
}

function parseBackup(raw: unknown): PersoraBackup {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid backup file');
  }

  const data = raw as Partial<PersoraBackup>;
  if (data.app !== 'persora' || data.version !== 1) {
    throw new Error('Unsupported backup file');
  }

  if (!Array.isArray(data.personas) || !Array.isArray(data.analyses)) {
    throw new Error('Backup file is missing data arrays');
  }

  const drafts =
    data.drafts && typeof data.drafts === 'object' && !Array.isArray(data.drafts)
      ? (data.drafts as Record<string, string>)
      : {};

  return {
    app: 'persora',
    version: 1,
    exported_at: typeof data.exported_at === 'string' ? data.exported_at : new Date().toISOString(),
    personas: data.personas,
    analyses: data.analyses,
    drafts,
  };
}

async function putBackupRecords(personas: PersonaRecord[], analyses: AnalysisRecord[]): Promise<void> {
  const db = await initDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_PERSONAS, STORE_ANALYSES], 'readwrite');
    const personaStore = tx.objectStore(STORE_PERSONAS);
    const analysisStore = tx.objectStore(STORE_ANALYSES);

    personas.forEach((record) => personaStore.put(record));
    analyses.forEach((record) => analysisStore.put(record));

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to import backup'));
    tx.onabort = () => reject(tx.error ?? new Error('Import was aborted'));
  });
}

async function clearStores(): Promise<void> {
  const db = await initDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction([STORE_PERSONAS, STORE_ANALYSES], 'readwrite');
    tx.objectStore(STORE_PERSONAS).clear();
    tx.objectStore(STORE_ANALYSES).clear();

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to clear local data'));
    tx.onabort = () => reject(tx.error ?? new Error('Clear was aborted'));
  });
}
