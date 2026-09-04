import { useEffect, useMemo, useState } from 'react';
import type { AnalysisRecord, InlineImage, PersonaSummary } from '@/lib/types';
import { REPLY_INTENTS } from '@/lib/types';
import { analyzeReply } from '@/lib/analysis';
import { getInitial } from '@/lib/dom';
import { fileToInlineImage } from '@/lib/image';
import { listPersonaSummaries } from '@/lib/persona';
import { parseThread, detectTarget } from '@/lib/thread';
import { getThreadDraft, setThreadDraft } from '@/lib/drafts';
import { useApp } from '@/lib/store';
import { useT } from '@/lib/useI18n';

// 최근 대화 입력 모드 — 기본은 텍스트, 캡처 이미지는 선택 모드(DESIGN §6.1).
type InputMode = 'text' | 'image';

// 의도 칩에서 "직접 입력"을 고르면 아래 자유 입력 필드가 나타난다(DESIGN §6.1).
const CUSTOM_INTENT = '__custom__';

/** 타겟 미리보기·피커 문자열을 지정한 길이에서 자르고 말줄임표를 붙인다(DESIGN §6.1). */
function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export default function AnalyzePage() {
  const selectedPersonaId = useApp((s) => s.selectedPersonaId);
  const setSelectedPersonaId = useApp((s) => s.setSelectedPersonaId);
  const apiKey = useApp((s) => s.apiKey);
  const pushToast = useApp((s) => s.pushToast);
  const translate = useT();

  const [personas, setPersonas] = useState<PersonaSummary[]>([]);
  const [mode, setMode] = useState<InputMode>('text');
  const [thread, setThread] = useState('');
  const [images, setImages] = useState<InlineImage[]>([]);
  const [intentKey, setIntentKey] = useState(''); // '' = 기본(공감), 프리셋 키, 또는 CUSTOM_INTENT
  const [customIntent, setCustomIntent] = useState('');
  const [targetOverride, setTargetOverride] = useState(''); // 사용자가 피커에서 직접 고른 타겟('' = 자동 검출)
  const [pickOpen, setPickOpen] = useState(false);
  const [result, setResult] = useState<AnalysisRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listPersonaSummaries();
      setPersonas(list);
      // 초기 선택(TRD §3.10): selectedPersonaId가 목록에 있으면 그것, 없으면 첫 번째.
      const stillValid = !!selectedPersonaId && list.some((p) => p.id === selectedPersonaId);
      if (!stillValid) setSelectedPersonaId(list[0]?.id ?? null);
    } catch {
      pushToast(translate('toast.loadPersonaFail'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 페르소나 전환 시: 그 페르소나의 드래프트로 스레드를 갈아 끼우고 수동 타겟·피커를 초기화하며
  // 고른 캡처도 비운다(DESIGN §6.1) — 다른 대화의 문장·캡처를 들고 갈 이유가 없다. 입력 모드
  // 자체는 유지한다.
  useEffect(() => {
    setThread(getThreadDraft(selectedPersonaId ?? ''));
    setTargetOverride('');
    setPickOpen(false);
    setImages([]);
  }, [selectedPersonaId]);

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId);

  // 붙여넣은 스레드를 화자별로 파싱해 답장 대상(타겟)을 자동 검출한다(TRD §3.11).
  const parsedThread = useMemo(() => {
    if (!thread.trim() || !selectedPersona) return null;
    return parseThread(thread, { name: selectedPersona.name, myName: selectedPersona.my_name });
  }, [thread, selectedPersona]);

  const autoTarget = useMemo(() => (parsedThread ? detectTarget(parsedThread) : ''), [parsedThread]);
  // 수동 지정이 있으면 그것을, 없으면 자동 검출 결과를 보여준다.
  const targetPreview = targetOverride || autoTarget;

  // 스레드 입력 변경: 페르소나별 드래프트로 저장 + 수동 타겟 초기화(스레드가 바뀌면 이전 지정이 무의미해진다).
  const onThreadChange = (value: string) => {
    setThread(value);
    setThreadDraft(selectedPersonaId ?? '', value);
    setTargetOverride('');
  };

  const intentValue = intentKey === CUSTOM_INTENT ? customIntent.trim() : intentKey;

  // 캡처 이미지 추가(여러 장 누적). 페르소나 생성 시트와 같은 변환 헬퍼를 쓴다(TRD §3.4.1).
  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const next = await Promise.all(Array.from(files).map(fileToInlineImage));
      setImages((current) => [...current, ...next]);
    } catch {
      pushToast(translate('toast.imageLoadFail'), 'error');
    }
  };

  const onAnalyze = async () => {
    // 검증 순서(DESIGN §6.2): ① 페르소나 미선택 ② 모드별 입력 검사(텍스트: 스레드 공백 /
    // 이미지: 0장) ③ 키 없음. ①·③은 모드와 무관하게 같은 순서·같은 키(v1과 동일).
    if (!selectedPersonaId) {
      pushToast(translate('toast.selectPersona'), 'error');
      return;
    }
    if (mode === 'image' ? images.length === 0 : !thread.trim()) {
      pushToast(translate(mode === 'image' ? 'toast.addImage' : 'toast.enterMessage'), 'error');
      return;
    }
    if (!apiKey) {
      pushToast(translate('status.noKey'), 'error');
      return;
    }
    setAnalyzing(true);
    try {
      const next = await analyzeReply(selectedPersonaId, {
        thread: mode === 'image' ? '' : thread.trim(),
        intent: intentValue,
        targetOverride: mode === 'image' ? '' : targetOverride,
        images: mode === 'image' ? images : undefined,
      });
      setResult(next);
    } catch (err) {
      // generate()가 이미 현지화된 사용자 친화 메시지를 던지므로 그대로 노출(원인 진단 가능하게)
      const msg = err instanceof Error && err.message ? err.message : translate('toast.analyzeFail');
      pushToast(msg, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const onCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      pushToast(translate('toast.copied'), 'success');
    } catch {
      pushToast(translate('toast.copyFail'), 'error');
    }
  };

  const intentOptions = [
    { key: '', labelKey: 'intent.none' },
    ...REPLY_INTENTS,
    { key: CUSTOM_INTENT, labelKey: 'intent.custom' },
  ];

  return (
    <section className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {!loading && personas.length === 0 && (
        <div className="rounded-2xl px-4 py-3 bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">{translate('analyze.noPersonaHint')}</p>
        </div>
      )}

      <div>
        <h1 className="text-lg font-bold text-slate-900">{translate('analyze.title')}</h1>
        <p className="text-sm text-slate-500 mt-1">{translate('analyze.threadHint')}</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{translate('analyze.selectPersona')}</p>
        {loading ? (
          <p className="text-sm text-slate-400 py-3">{translate('common.loading')}</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {personas.map((persona) => {
              const active = selectedPersonaId === persona.id;
              return (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersonaId(persona.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${
                    active
                      ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                      : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <span className="w-6 h-6 rounded-full bg-avatar-gradient text-white text-xs font-bold flex items-center justify-center">
                    {getInitial(persona.name)}
                  </span>
                  {persona.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{translate('analyze.threadLabel')}</p>

        <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-semibold">
          {(['text', 'image'] as InputMode[]).map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`flex-1 rounded-xl px-3 py-2 transition-colors ${
                mode === item ? 'bg-white text-indigo-600 shadow-soft-sm' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {item === 'text' ? translate('analyze.tabText') : translate('analyze.tabImage')}
            </button>
          ))}
        </div>

        {mode === 'text' ? (
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft-sm">
            <textarea
              value={thread}
              onChange={(e) => onThreadChange(e.target.value)}
              rows={7}
              placeholder={translate('analyze.threadPlaceholder')}
              className="w-full bg-transparent px-5 pt-4 pb-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) void onAnalyze();
              }}
            />
            <div className="px-4 pb-3 pt-1 border-t border-slate-100 space-y-2">
              {targetPreview ? (
                <p className="text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600">{translate('analyze.target')}</span>{' '}
                  <span className="text-slate-700">"{truncate(targetPreview, 60)}"</span>
                </p>
              ) : (
                <p className="text-xs text-slate-400">{translate('analyze.targetEmpty')}</p>
              )}

              {parsedThread && parsedThread.lines.some((line) => line.text.trim()) && (
                <div>
                  <button
                    type="button"
                    onClick={() => setPickOpen((v) => !v)}
                    className="text-xs text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {translate('analyze.pickTarget')} {pickOpen ? '▲' : '▾'}
                  </button>
                  {pickOpen && (
                    <div className="mt-1 max-h-40 overflow-y-auto space-y-1">
                      {parsedThread.lines
                        .filter((line) => line.text.trim())
                        .map((line, index) => {
                          const speakerLabel =
                            line.speaker === 'me'
                              ? selectedPersona?.my_name || '나'
                              : line.speaker === 'other'
                                ? selectedPersona?.name
                                : line.label || '?';
                          const lineText = line.text.trim();
                          const active = targetPreview === lineText;
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setTargetOverride(lineText);
                                setPickOpen(false);
                              }}
                              className={`w-full text-left rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                                active ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'
                              }`}
                            >
                              <span className="font-semibold mr-1.5 text-slate-400">{speakerLabel}</span>
                              {truncate(lineText, 50)}
                            </button>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <label className="flex flex-col items-center justify-center gap-2 min-h-32 rounded-2xl border-2 border-dashed border-slate-200 bg-white text-slate-400 text-sm font-medium cursor-pointer hover:border-indigo-300 hover:text-indigo-500 transition-colors">
              <input type="file" accept="image/*" multiple hidden onChange={(e) => void onFiles(e.target.files)} />
              <span>{translate('analyze.imageDropzone')}</span>
            </label>
            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((img, index) => (
                  <div key={`${img.data.slice(0, 12)}-${index}`} className="relative w-16 h-16 overflow-hidden rounded-xl border border-slate-200">
                    <img src={`data:${img.mimeType};base64,${img.data}`} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-900/70 text-white text-xs leading-none"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-slate-400 leading-relaxed">{translate('analyze.imageHint')}</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{translate('analyze.intentLabel')}</p>
        <div className="flex flex-wrap gap-2">
          {intentOptions.map((opt) => {
            const active = intentKey === opt.key;
            return (
              <button
                key={opt.key || 'none'}
                onClick={() => setIntentKey(opt.key)}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  active
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 bg-white text-slate-500 hover:text-slate-700'
                }`}
              >
                {translate(opt.labelKey)}
              </button>
            );
          })}
        </div>
        {intentKey === CUSTOM_INTENT && (
          <input
            value={customIntent}
            onChange={(e) => setCustomIntent(e.target.value)}
            placeholder={translate('intent.customPlaceholder')}
            className="w-full bg-white border-[1.5px] border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-400 truncate">
          {selectedPersona ? `${selectedPersona.name} · Gemini` : 'Gemini'}
        </p>
        <button
          onClick={() => void onAnalyze()}
          disabled={analyzing || personas.length === 0 || !apiKey}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-brand-gradient shadow-glow-sm disabled:opacity-40 disabled:shadow-none transition-all hover:opacity-90 active:scale-[.98]"
        >
          {analyzing ? translate('analyze.loading') : translate('analyze.run')}
        </button>
      </div>

      {analyzing && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-tl-sm border border-slate-200 px-4 py-3 bg-white shadow-soft-sm">
            <div className="flex gap-1 items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse [animation-delay:300ms]" />
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-2xl bg-indigo-50 border border-indigo-100 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 mb-2">{translate('analyze.aiLabel')}</p>
            <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{result.analysis}</p>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{translate('analyze.candidatesTitle')}</p>
            {result.candidates.map((candidate, index) => (
              <div key={index} className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-soft-sm">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {candidate.label || translate('common.candidateN', { n: index + 1 })}
                  </p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-slate-500 leading-relaxed mb-3">
                    <strong className="text-slate-700">{translate('analyze.reason')}</strong> {candidate.reason}
                  </p>
                  <p className="text-sm text-slate-900 leading-relaxed whitespace-pre-wrap">{candidate.response}</p>
                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => void onCopy(candidate.response)}
                      className="text-xs text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-3 h-3"
                      >
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      {translate('analyze.copy')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
