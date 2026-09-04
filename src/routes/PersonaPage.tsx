import { useT } from '@/lib/useI18n';

export default function PersonaPage() {
  const t = useT();

  return (
    <section className="max-w-lg mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="text-lg font-bold text-slate-900">{t('persona.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{t('persona.subtitle')}</p>
      </div>
    </section>
  );
}
