import { useT } from '@/lib/useI18n';

export default function AnalyzePage() {
  const t = useT();

  return (
    <section className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{t('analyze.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('analyze.subtitle')}</p>
      </div>
    </section>
  );
}
