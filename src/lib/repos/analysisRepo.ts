// IndexedDB `analyses` 스토어 리포지토리. TRD §3.6.
// personaRepo.ts와 같은 패턴(withStore/initDB/sortByCreatedDesc 공용 레이어 사용).
// get은 사용처가 없어 두지 않는다(필요 시 추가).

import { STORE_ANALYSES } from '@/lib/config';
import type { AnalysisRecord } from '@/lib/types';
import { initDB, promisifyRequest, sortByCreatedDesc, withStore } from '@/lib/db';

export const analysisRepo = {
  put(record: AnalysisRecord): Promise<void> {
    return withStore(STORE_ANALYSES, 'readwrite', (store) => {
      store.put(record);
    });
  },

  async list(): Promise<AnalysisRecord[]> {
    const db = await initDB();
    const tx = db.transaction(STORE_ANALYSES, 'readonly');
    const rows = await promisifyRequest(tx.objectStore(STORE_ANALYSES).getAll());
    return sortByCreatedDesc(rows as AnalysisRecord[]);
  },

  remove(id: string): Promise<void> {
    return withStore(STORE_ANALYSES, 'readwrite', (store) => {
      store.delete(id);
    });
  },
};
