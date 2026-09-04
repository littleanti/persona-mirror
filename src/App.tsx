import { useEffect } from 'react';
import { NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import ApiKeyStatus from '@/components/ApiKeyStatus';
import LanguageToggle from '@/components/LanguageToggle';
import OnboardingModal from '@/components/OnboardingModal';
import ToastContainer from '@/components/Toast';
import AnalyzePage from '@/routes/AnalyzePage';
import HistoryPage from '@/routes/HistoryPage';
import PersonaPage from '@/routes/PersonaPage';
import SettingsPage from '@/routes/SettingsPage';
import { APP_LOGO_SRC } from '@/lib/assets';
import { initDB } from '@/lib/db';
import { useApp } from '@/lib/store';
import { useT } from '@/lib/useI18n';

const tabs = [
  {
    to: '/personas',
    end: true,
    labelKey: 'nav.personas',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    to: '/analyze',
    end: false,
    labelKey: 'nav.analyze',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M21 15a4 4 0 0 1-4 4H7l-4 4V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
        <path d="M8 9h8M8 13h5" />
      </svg>
    ),
  },
  {
    to: '/history',
    end: false,
    labelKey: 'nav.history',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  },
  {
    to: '/settings',
    end: false,
    labelKey: 'nav.settings',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function App() {
  const apiKey = useApp((s) => s.apiKey);
  const pushToast = useApp((s) => s.pushToast);
  const t = useT();
  const location = useLocation();

  useEffect(() => {
    document.title = t('app.title');
  }, [t]);

  // 탭(라우트) 전환 시 스크롤을 최상단으로 되돌린다 (DESIGN §9 인터랙션 규칙).
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // IndexedDB 연결은 앱 전체에서 1회만 연다(TRD §3.10). 실패 시 토스트로 알린다(TRD §3.6).
  useEffect(() => {
    initDB().catch(() => pushToast(t('err.dbOpen'), 'error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh flex flex-col bg-slate-50 text-slate-900">
      <header className="px-5 py-3 flex items-center justify-between gap-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <img src={APP_LOGO_SRC} alt="" className="h-8 w-8 rounded-lg object-cover flex-shrink-0" />
          <span className="font-semibold tracking-tight text-slate-900 truncate">{t('app.title')}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <ApiKeyStatus />
          <LanguageToggle />
        </div>
      </header>

      <main className="flex-1 pb-20">
        <Routes>
          <Route path="/" element={<Navigate to="/personas" replace />} />
          <Route path="/personas" element={<PersonaPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,.06)]">
        <div className="flex items-stretch max-w-lg mx-auto">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition-all ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'scale-110 transition-transform' : 'transition-transform'}>
                    {tab.icon}
                  </span>
                  <span>{t(tab.labelKey)}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {!apiKey && <OnboardingModal />}
      <ToastContainer />
    </div>
  );
}
