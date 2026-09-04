// 설정 탭 — 백업 내보내기/가져오기, 전체 로컬 데이터 삭제, 개인정보·면책 고지(DESIGN §7b).
// 결과를 만드는 화면이 아니라 상태를 다루는 화면이라 입력 필드도 LLM 호출도 없다.

import { useRef, useState } from 'react';
import { clearAllLocalAppData, downloadBackup, exportAppData, importAppData } from '@/lib/dataManagement';
import { useApp } from '@/lib/store';
import { useT } from '@/lib/useI18n';

export default function SettingsPage() {
  const pushToast = useApp((s) => s.pushToast);
  const refreshApiKey = useApp((s) => s.refreshApiKey);
  const setSelectedPersonaId = useApp((s) => s.setSelectedPersonaId);
  const t = useT();

  const inputRef = useRef<HTMLInputElement | null>(null);
  // 세 버튼이 이 상태 하나를 공유해 하나가 도는 동안 셋 다 비활성이 된다(DESIGN §7b).
  const [busy, setBusy] = useState<'export' | 'import' | 'clear' | null>(null);

  const onExport = async () => {
    setBusy('export');
    try {
      downloadBackup(await exportAppData());
      pushToast(t('settings.toastExported'), 'success');
    } catch {
      pushToast(t('settings.toastExportFailed'), 'error');
    } finally {
      setBusy(null);
    }
  };

  const onImportFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy('import');
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const result = await importAppData(parsed);
      pushToast(
        t('settings.toastImported', {
          personas: result.personas,
          analyses: result.analyses,
          drafts: result.drafts,
        }),
        'success',
      );
    } catch {
      pushToast(t('settings.toastImportFailed'), 'error');
    } finally {
      setBusy(null);
      // 같은 파일을 다시 고를 수 있도록 비운다(비우지 않으면 change가 오지 않는다).
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const onClearAll = async () => {
    if (!window.confirm(t('settings.confirmClearAll'))) return;
    setBusy('clear');
    try {
      await clearAllLocalAppData();
      setSelectedPersonaId(null);
      refreshApiKey();
      pushToast(t('settings.toastCleared'), 'success');
    } catch {
      pushToast(t('settings.toastClearFailed'), 'error');
    } finally {
      setBusy(null);
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{t('nav.settings')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('settings.subtitle')}</p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">{t('settings.dataTitle')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('settings.dataDesc')}</p>
        </div>
        <div className="p-4 grid gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => void onExport()}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white disabled:opacity-50"
          >
            <span aria-hidden="true">↓</span>
            {busy === 'export' ? t('common.saving') : t('settings.exportBtn')}
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-white disabled:opacity-50"
          >
            <span aria-hidden="true">↑</span>
            {busy === 'import' ? t('common.loading') : t('settings.importBtn')}
          </button>
          <button
            type="button"
            onClick={() => void onClearAll()}
            disabled={busy !== null}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
          >
            <span aria-hidden="true">×</span>
            {busy === 'clear' ? t('common.loading') : t('settings.clearBtn')}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => void onImportFile(e.target.files?.[0])}
          />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 shadow-soft-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">{t('settings.privacyTitle')}</p>
          <p className="text-xs text-slate-500 mt-1">{t('settings.privacyDesc')}</p>
        </div>
        <div className="p-4 space-y-3">
          {[
            'settings.privacyLocal',
            'settings.privacyGemini',
            'settings.privacyKey',
            'settings.privacyLoss',
            'settings.privacyConsent',
          ].map((key) => (
            <div key={key} className="flex gap-3 text-sm leading-relaxed text-slate-600">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
              <p>{t(key)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3">
        <p className="text-sm font-semibold text-amber-800">{t('settings.disclaimerTitle')}</p>
        <p className="text-xs leading-relaxed text-amber-700 mt-1">{t('settings.disclaimerDesc')}</p>
      </div>
    </section>
  );
}
