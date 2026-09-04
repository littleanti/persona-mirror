// 경량 i18n 레이어 — 프레임워크 없이 ko/en 전환을 담당하는 단일 출처.
// - 초기 언어: localStorage(pm_lang) → 없으면 navigator.language 자동 감지
// - t(): 동적으로 생성되는 문자열용 ({param} 보간 지원)
// - onLangChange(): 동적 뷰가 스스로 다시 렌더링하도록 구독
//
// 사전 키는 DESIGN.md §10.1 영역 규칙(app/nav/common/status/onboarding/persona/analyze/history/toast/err/parse/btn)을 따른다.

export type Lang = 'ko' | 'en';

const LANG_STORAGE_KEY = 'pm_lang';

type Dict = Record<string, string>;

const MESSAGES: Record<Lang, Dict> = {
  ko: {
    'app.title': 'Persora',

    'nav.personas': '페르소나',
    'nav.analyze': '분석하기',
    'nav.history': '기록',
    'nav.settings': '설정',

    'persona.title': '페르소나',
    'persona.subtitle': '대화 기록을 입력하면 AI가 상대방의 페르소나를 분석해요',
    'analyze.title': '분석하기',
    'history.title': '기록',
    'history.subtitle': '원하는 답변 후보',

    // 헤더 — 키 상태(ApiKeyStatus)
    'status.ready': 'Gemini 준비됨',
    'status.noKey': 'API 키 미등록',

    // 페르소나 탭 — 목록/빈 상태
    'persona.summaryFallback': '페르소나 분석 완료',
    'persona.empty.title': '저장된 페르소나 없음',
    'persona.empty.desc': '대화 기록을 입력하면 AI가 상대방의 페르소나를 분석해요',
    'persona.createCta': '새 페르소나 만들기',

    // 페르소나 탭 — 생성 바텀 시트
    'persona.create.title': '새 페르소나 만들기',
    'persona.create.otherName': '상대방 이름',
    'persona.create.otherNamePlaceholder': '예) 김민준',
    'persona.create.myName': '나의 이름',
    'persona.create.myNamePlaceholder': '예) 나',
    'persona.create.convPlaceholder':
      '김민준: 야 오늘 뭐해?\n나: 집에 있어. 왜?\n김민준: 아 그냥... 오늘 약속 있나 해서\n나: 없는데 왜?\n...',
    'persona.create.textHint': '📋 대화가 많을수록 더 정확한 페르소나가 만들어져요. 최소 10줄 이상 권장합니다.',
    'persona.create.attachFile': '📎 카카오톡 대화 파일(.txt) 첨부',
    'persona.create.attachHint':
      '카카오톡에서 내보낸 .txt를 첨부하면 머리말을 빼고 최근 대화만 자동으로 채워요. 채운 뒤 직접 편집할 수 있어요.',
    'persona.create.attachedInfo': '✅ 최근 {n}자를 사용했어요',
    'persona.create.attachedInfoTrimmed': '✅ 원본 {total}자 중 최근 {n}자만 사용했어요',
    'persona.create.loading': '페르소나 생성 중...',

    // 페르소나 탭 — 상세 모달
    'persona.detail.title': '페르소나 상세',
    'persona.detail.useForAnalysis': '이 페르소나로 분석',
    'persona.detail.convToggle': '📝 원본 대화 기록 보기',
    'persona.detail.tabMe': '🙋 나 ({my})',
    'persona.detail.createdAt': '생성일 {date}',
    'persona.detail.myLabel': '나: {my}',
    'persona.detail.confirmDelete': '"{name}" 페르소나를 삭제할까요?',
    'persona.detail.updateTitle': '추가 대화로 업데이트',
    'persona.detail.updatePlaceholder': '새로 나눈 대화를 붙여넣으면 페르소나가 더 정확해져요',
    'persona.detail.updateCta': '업데이트',
    'persona.detail.updateLoading': '업데이트 중...',

    // 페르소나 필드 라벨 (PersonaFields 속성명과 동일 — DESIGN §10.1)
    'persona.field.communication_style': '소통 방식',
    'persona.field.speech_level': '경어/어미 패턴',
    'persona.field.vocabulary_examples': '자주 쓰는 표현',
    'persona.field.sentence_style': '문장 스타일',
    'persona.field.emoji_symbol_usage': '이모지/특수문자',
    'persona.field.texting_habits': '메시징 습관',
    'persona.field.emotional_tendencies': '감정 표현',
    'persona.field.what_they_value': '중요 가치',
    'persona.field.how_they_seek_response': '원하는 반응',
    'persona.field.relationship_dynamics': '관계 역학',

    // 분석 탭 (AnalyzePage) — DESIGN §10.1 analyze.*
    'analyze.selectPersona': '페르소나 선택',
    'analyze.run': '분석하기',
    'analyze.loading': '메시지 분석 중...',
    'analyze.aiLabel': 'AI 심리 분석',
    'analyze.candidatesTitle': '원하는 답변 후보 3가지',
    'analyze.reason': '원하는 이유:',
    'analyze.copy': '복사하기',
    'analyze.noPersonaHint': '먼저 페르소나 탭에서 상대방의 대화를 분석해 페르소나를 만들어주세요.',
    'analyze.threadLabel': '최근 대화 붙여넣기',
    'analyze.threadHint': '상대와 주고받은 최근 대화를 그대로 붙여넣으세요. 맨 아래(최신)의 상대 메시지에 답장해요.',
    'analyze.threadPlaceholder': '[상대] 오늘 뭐해?\n[나] 집에 있어\n[상대] 그럼 이따 볼래?',
    'analyze.target': '이 메시지에 답장',
    'analyze.targetEmpty': '대화를 붙여넣으면 답장할 마지막 메시지를 자동으로 잡아드려요.',
    'analyze.pickTarget': '다른 메시지에 답장하기',
    'analyze.intentLabel': '답장 의도',
    'analyze.tabText': '✍️ 텍스트',
    'analyze.tabImage': '🖼️ 캡처 이미지',
    'analyze.imageDropzone': '카카오톡·문자 캡처 이미지 선택',
    'analyze.imageHint':
      '🖼️ 캡처의 맨 아래 상대 메시지에 답장해요. 답장할 메시지가 잘 보이게, 여러 장이면 시간 순서대로 올려주세요. 캡처 이미지도 Google로 전송됩니다.',
    'analyze.imagePlaceholder': '[채팅 캡처 이미지 {n}장으로 분석한 답장]',

    // 답장 의도 라벨(REPLY_INTENTS와 짝) — TRD §3.9
    'intent.none': '기본(공감)',
    'intent.comfort': '위로·공감',
    'intent.solve': '함께 해결',
    'intent.lighten': '가볍게 전환',
    'intent.decline': '정중한 거절',
    'intent.boundary': '선 긋기',
    'intent.persuade': '설득·제안',
    'intent.custom': '직접 입력',
    'intent.customPlaceholder': '원하는 답장 방향을 적어주세요 (예: 사과하고 싶어)',

    // 기록 탭 (HistoryPage) — DESIGN §10.1 history.*
    'history.empty': '아직 분석 기록이 없어요',
    'history.candidatesTitle': '원하는 답변 후보',
    'history.delete': '기록 삭제',
    'history.confirmDelete': '이 분석 기록을 삭제할까요?',

    // 공용
    'common.loading': '불러오는 중...',
    'common.candidateN': '후보 {n}',

    // 토스트 — 페르소나 생성/조회/삭제
    'toast.enterName': '이름을 입력해주세요',
    'toast.convTooShort': '대화 기록이 너무 짧아요',
    'toast.chatFileReadFail': '대화 파일을 읽지 못했습니다',
    'toast.addImage': '캡처 이미지를 추가해주세요',
    'toast.imageLoadFail': '이미지를 불러오지 못했습니다',
    'toast.personaCreated': '{name} 페르소나 생성 완료!',
    'toast.personaCreateFail': '페르소나 생성에 실패했습니다',
    'toast.loadPersonaFail': '페르소나를 불러오지 못했습니다',
    'toast.loadDetailFail': '상세 정보를 불러오지 못했습니다',
    'toast.personaSelected': '{name} 페르소나 선택됨',
    'toast.deleteFail': '삭제에 실패했습니다',
    'toast.personaDeleted': '{name} 삭제 완료',
    'toast.enterConversation': '추가할 대화를 입력해주세요',
    'toast.personaUpdated': '{name} 페르소나를 업데이트했어요',
    'toast.personaUpdateFail': '페르소나 업데이트에 실패했습니다',

    // 토스트 — 분석/기록 (P4)
    'toast.selectPersona': '페르소나를 선택해주세요',
    'toast.enterMessage': '메시지를 입력해주세요',
    'toast.analyzeFail': '분석에 실패했습니다. API 키 설정을 확인해주세요',
    'toast.copied': '✓ 복사됨',
    'toast.copyFail': '클립보드 복사 실패',
    'toast.loadHistoryFail': '기록을 불러오지 못했습니다',
    'toast.historyDeleted': '기록 삭제 완료',

    // 분석 응답 파싱 실패 폴백(analysis.ts가 사용, TRD §3.8 — 저장 시점 언어로 고정됨)
    'parse.failAnalysis': 'AI 응답을 파싱하는 데 문제가 발생했습니다. 원본 응답을 확인하세요.',
    'parse.failLabel': '원본 응답',
    'parse.failReason': 'JSON 파싱 실패',

    // DB 오류(TRD §3.6 — App.tsx가 initDB 실패를 잡아 사용)
    'err.dbOpen': '브라우저 저장소를 여는 데 실패했습니다.',

    // 온보딩(OnboardingModal)
    'onboarding.title': 'Gemini API 키 설정',
    'onboarding.welcomeTitle': 'Persora에 오신 걸 환영합니다',
    'onboarding.welcomeDesc': '상대방의 페르소나에 맞는 답장을 찾아드려요.',
    'onboarding.intro':
      '이 앱은 당신의 Google AI Studio(Gemini) API 키로 동작합니다. 키와 페르소나·대화 기록은 이 브라우저(localStorage/IndexedDB)에 저장되고, 페르소나 생성·분석 시 입력한 대화와 키는 Google Gemini API로 직접 전송됩니다.',
    'onboarding.keyLabel': 'API 키',
    'onboarding.consent': '대화 내용이 Gemini API로 전송되고, 로컬 데이터는 브라우저 데이터 삭제나 기기 변경 시 복구할 수 없음을 이해했습니다.',
    'onboarding.helpCta': 'AI Studio에서 키 발급받기 ↗',

    // 공용 버튼/상태
    'common.save': '저장',
    'common.cancel': '취소',
    'common.delete': '삭제',
    'common.saving': '저장 중...',
    'btn.saveKey': '키 저장하고 시작하기',

    // 토스트(온보딩 · 키 변경)
    'toast.invalidKeyFormat': 'API 키 형식이 올바르지 않습니다',
    'toast.confirmLocalOnly': '개인정보 및 로컬 저장 안내를 확인해주세요',
    'toast.keySaved': 'API 키가 저장되었습니다',
    'toast.keyDeleted': '저장된 키를 삭제했습니다',

    // Gemini 오류(gemini.ts가 사용, 사용자 노출)
    'err.keyNotSet': 'API 키가 설정되지 않았습니다. 키를 먼저 입력해주세요.',
    'err.invalidKey': 'API 키가 유효하지 않습니다. 키를 다시 확인해주세요.',
    'err.network': '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
    'err.timeout': '응답이 너무 오래 걸려 시간 초과되었습니다. 잠시 후 다시 시도해주세요.',
    'err.rateLimit': 'API 사용 한도(무료 할당량)를 초과했습니다. 잠시 후 다시 시도하거나 결제/할당량을 확인해주세요.',
    'err.serviceTemp': 'Gemini 서비스에 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    'err.aiGeneric': 'AI 응답 중 오류가 발생했습니다: {msg}',

    // 설정 탭(SettingsPage) — DESIGN §7b
    'settings.subtitle': '로컬 데이터, 백업, 개인정보 안내를 관리합니다.',
    'settings.dataTitle': '데이터 관리',
    'settings.dataDesc': '백업 파일에는 API 키가 포함되지 않습니다. 같은 ID의 데이터는 가져오기 시 덮어씁니다.',
    'settings.exportBtn': '백업 내보내기',
    'settings.importBtn': '백업 가져오기',
    'settings.clearBtn': '전체 데이터 삭제',
    'settings.privacyTitle': '개인정보와 보안',
    'settings.privacyDesc': 'Persora는 서버 계정이나 자체 데이터베이스 없이 이 브라우저에서 동작합니다.',
    'settings.privacyLocal': '페르소나, 원본 대화, 분석 기록, 작성 중인 대화는 이 브라우저의 IndexedDB/localStorage에 저장됩니다.',
    'settings.privacyGemini': '페르소나 생성 시 대화 텍스트나 캡처 이미지가, 분석 시 페르소나와 대화 내용이 Google Gemini API로 직접 전송됩니다.',
    'settings.privacyKey': 'Gemini API 키는 localStorage에 저장됩니다. Google Cloud에서 Gemini API만 허용하고 가능하면 HTTP referrer를 littleanti.github.io로 제한하세요.',
    'settings.privacyLoss': '브라우저 데이터 삭제, 시크릿 모드 종료, 기기 변경 시 로컬 데이터는 복구할 수 없습니다. 필요한 데이터는 백업으로 보관하세요.',
    'settings.privacyConsent': '타인의 대화나 민감정보를 분석하기 전에는 필요한 동의를 받고, 주민번호·카드번호 같은 고위험 정보는 입력하지 마세요.',
    'settings.disclaimerTitle': '분석 결과 안내',
    'settings.disclaimerDesc': 'AI가 만든 페르소나와 답변 후보는 참고용입니다. 의료, 법률, 심리 진단이나 중요한 관계 결정을 대신하지 않습니다.',
    'settings.confirmClearAll': 'API 키, 페르소나, 분석 기록, 작성 중인 대화를 이 브라우저에서 모두 삭제할까요? 이 작업은 되돌릴 수 없습니다.',
    'settings.toastExported': '백업 파일을 만들었습니다',
    'settings.toastExportFailed': '백업 내보내기에 실패했습니다',
    'settings.toastImported': '백업을 가져왔습니다: 페르소나 {personas}개, 기록 {analyses}개, 드래프트 {drafts}개',
    'settings.toastImportFailed': '백업 파일을 가져오지 못했습니다',
    'settings.toastCleared': '로컬 데이터를 모두 삭제했습니다',
    'settings.toastClearFailed': '전체 데이터 삭제에 실패했습니다',
  },
  en: {
    'app.title': 'Persora',

    'nav.personas': 'Personas',
    'nav.analyze': 'Analyze',
    'nav.history': 'History',
    'nav.settings': 'Settings',

    'persona.title': 'Personas',
    'persona.subtitle': 'Paste a conversation and AI will analyze the other person’s persona',
    'analyze.title': 'Analyze',
    'history.title': 'History',
    'history.subtitle': 'Suggested replies',

    // Header — key status (ApiKeyStatus)
    'status.ready': 'Gemini ready',
    'status.noKey': 'No API key',

    // Personas tab — list/empty state
    'persona.summaryFallback': 'Persona analysis complete',
    'persona.empty.title': 'No saved personas',
    'persona.empty.desc': 'Paste a conversation and AI will analyze the other person’s persona',
    'persona.createCta': 'Create persona',

    // Personas tab — create bottom sheet
    'persona.create.title': 'Create persona',
    'persona.create.otherName': 'Their name',
    'persona.create.otherNamePlaceholder': 'e.g. Alex',
    'persona.create.myName': 'Your name',
    'persona.create.myNamePlaceholder': 'e.g. Me',
    'persona.create.convPlaceholder':
      'Alex: Hey, what are you up to today?\nMe: Just home. Why?\nAlex: Oh nothing... just wondering if you’re free\nMe: I am, what’s up?\n...',
    'persona.create.textHint': '📋 The more conversation you paste, the more accurate the persona. At least 10 lines recommended.',
    'persona.create.attachFile': '📎 Attach KakaoTalk chat file (.txt)',
    'persona.create.attachHint':
      'Attach a .txt exported from KakaoTalk — the header is stripped and the most recent conversation is filled in automatically. You can edit it afterward.',
    'persona.create.attachedInfo': '✅ Using the latest {n} characters',
    'persona.create.attachedInfoTrimmed': '✅ Using only the latest {n} of {total} characters',
    'persona.create.loading': 'Creating persona...',

    // Personas tab — detail modal
    'persona.detail.title': 'Persona details',
    'persona.detail.useForAnalysis': 'Analyze with this persona',
    'persona.detail.convToggle': '📝 View original conversation',
    'persona.detail.tabMe': '🙋 Me ({my})',
    'persona.detail.createdAt': 'Created {date}',
    'persona.detail.myLabel': 'Me: {my}',
    'persona.detail.confirmDelete': 'Delete the "{name}" persona?',
    'persona.detail.updateTitle': 'Update with more conversation',
    'persona.detail.updatePlaceholder': 'Paste newer conversation to make the persona more accurate',
    'persona.detail.updateCta': 'Update',
    'persona.detail.updateLoading': 'Updating...',

    // Persona field labels (must match PersonaFields property names — DESIGN §10.1)
    'persona.field.communication_style': 'Communication style',
    'persona.field.speech_level': 'Politeness / endings',
    'persona.field.vocabulary_examples': 'Frequent expressions',
    'persona.field.sentence_style': 'Sentence style',
    'persona.field.emoji_symbol_usage': 'Emoji / symbols',
    'persona.field.texting_habits': 'Texting habits',
    'persona.field.emotional_tendencies': 'Emotional expression',
    'persona.field.what_they_value': 'What they value',
    'persona.field.how_they_seek_response': 'Desired response',
    'persona.field.relationship_dynamics': 'Relationship dynamics',

    // Analyze tab (AnalyzePage) — DESIGN §10.1 analyze.*
    'analyze.selectPersona': 'Select a persona',
    'analyze.run': 'Analyze',
    'analyze.loading': 'Analyzing message...',
    'analyze.aiLabel': 'AI psychological analysis',
    'analyze.candidatesTitle': '3 suggested replies',
    'analyze.reason': 'Why they want it:',
    'analyze.copy': 'Copy',
    'analyze.noPersonaHint': 'First create a persona by analyzing a conversation in the Personas tab.',
    'analyze.threadLabel': 'Paste recent conversation',
    'analyze.threadHint': 'Paste your recent back-and-forth. We reply to the other person’s latest message at the bottom.',
    'analyze.threadPlaceholder': '[Them] what are you up to?\n[Me] just home\n[Them] wanna meet later?',
    'analyze.target': 'Replying to',
    'analyze.targetEmpty': 'Paste a conversation and we’ll pick the last message to reply to.',
    'analyze.pickTarget': 'Reply to a different message',
    'analyze.intentLabel': 'Reply intent',
    'analyze.tabText': '✍️ Text',
    'analyze.tabImage': '🖼️ Screenshots',
    'analyze.imageDropzone': 'Select chat screenshots',
    'analyze.imageHint':
      '🖼️ We reply to the other person’s last message at the bottom of the screenshot. Make sure it’s visible, and upload multiple screenshots in time order. Screenshots are also sent to Google.',
    'analyze.imagePlaceholder': '[Reply analyzed from {n} chat screenshot(s)]',

    // Reply intent labels (paired with REPLY_INTENTS) — TRD §3.9
    'intent.none': 'Default (empathy)',
    'intent.comfort': 'Comfort',
    'intent.solve': 'Solve together',
    'intent.lighten': 'Lighten mood',
    'intent.decline': 'Politely decline',
    'intent.boundary': 'Set boundary',
    'intent.persuade': 'Persuade',
    'intent.custom': 'Custom',
    'intent.customPlaceholder': 'Describe the reply direction (e.g. I want to apologize)',

    // History tab (HistoryPage) — DESIGN §10.1 history.*
    'history.empty': 'No analysis history yet',
    'history.candidatesTitle': 'Suggested replies',
    'history.delete': 'Delete record',
    'history.confirmDelete': 'Delete this analysis record?',

    // Common
    'common.loading': 'Loading...',
    'common.candidateN': 'Option {n}',

    // Toasts — persona create/view/delete
    'toast.enterName': 'Please enter a name',
    'toast.convTooShort': 'The conversation is too short',
    'toast.chatFileReadFail': 'Failed to read the chat file',
    'toast.addImage': 'Please add a screenshot',
    'toast.imageLoadFail': 'Failed to load the image',
    'toast.personaCreated': '{name} persona created!',
    'toast.personaCreateFail': 'Failed to create the persona',
    'toast.loadPersonaFail': 'Failed to load personas',
    'toast.loadDetailFail': 'Failed to load the details',
    'toast.personaSelected': '{name} persona selected',
    'toast.deleteFail': 'Failed to delete',
    'toast.personaDeleted': '{name} deleted',
    'toast.enterConversation': 'Please enter the conversation to add',
    'toast.personaUpdated': 'Updated the {name} persona',
    'toast.personaUpdateFail': 'Failed to update the persona',

    // Toasts — analyze/history (P4)
    'toast.selectPersona': 'Please select a persona',
    'toast.enterMessage': 'Please enter a message',
    'toast.analyzeFail': 'Analysis failed. Please check your API key.',
    'toast.copied': '✓ Copied',
    'toast.copyFail': 'Failed to copy to clipboard',
    'toast.loadHistoryFail': 'Failed to load history',
    'toast.historyDeleted': 'Record deleted',

    // Analysis parse-failure fallback (used by analysis.ts, TRD §3.8 — frozen at save-time language)
    'parse.failAnalysis': 'There was a problem parsing the AI response. See the raw response below.',
    'parse.failLabel': 'Raw response',
    'parse.failReason': 'JSON parsing failed',

    // DB error (TRD §3.6 — used by App.tsx when initDB fails)
    'err.dbOpen': 'Failed to open browser storage.',

    // Onboarding (OnboardingModal)
    'onboarding.title': 'Gemini API key',
    'onboarding.welcomeTitle': 'Welcome to Persora',
    'onboarding.welcomeDesc': 'Find the perfect reply that fits the other person’s persona.',
    'onboarding.intro':
      'This app runs on your own Google AI Studio (Gemini) API key. Your key, personas, and conversation history are stored in this browser (localStorage/IndexedDB), and when you create a persona or run an analysis, the conversation you enter and your key are sent directly to the Google Gemini API.',
    'onboarding.keyLabel': 'API key',
    'onboarding.consent':
      'I understand conversation data is sent to the Gemini API, and local data cannot be recovered if browser data is cleared or I switch devices.',
    'onboarding.helpCta': 'Get a key from AI Studio ↗',

    // Common buttons/status
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.saving': 'Saving…',
    'btn.saveKey': 'Save key & start',

    // Toasts (onboarding · key change)
    'toast.invalidKeyFormat': 'Invalid API key format',
    'toast.confirmLocalOnly': 'Please confirm the privacy and local storage notice',
    'toast.keySaved': 'API key saved',
    'toast.keyDeleted': 'Saved key deleted',

    // Gemini errors (used by gemini.ts, user-facing)
    'err.keyNotSet': 'No API key is set. Please enter your key first.',
    'err.invalidKey': 'The API key is invalid. Please check it again.',
    'err.network': 'A network error occurred. Please check your internet connection.',
    'err.timeout': 'The response took too long and timed out. Please try again in a moment.',
    'err.rateLimit': 'API usage limit (free quota) exceeded. Please retry later or check your billing/quota.',
    'err.serviceTemp': 'Gemini had a temporary error. Please try again in a moment.',
    'err.aiGeneric': 'An error occurred while getting the AI response: {msg}',

    // Settings tab (SettingsPage) — DESIGN §7b
    'settings.subtitle': 'Manage local data, backups, and privacy notices.',
    'settings.dataTitle': 'Data management',
    'settings.dataDesc': 'Backup files do not include your API key. Imported records with the same ID overwrite local records.',
    'settings.exportBtn': 'Export backup',
    'settings.importBtn': 'Import backup',
    'settings.clearBtn': 'Delete all data',
    'settings.privacyTitle': 'Privacy and security',
    'settings.privacyDesc': 'Persora runs in this browser without server accounts or its own database.',
    'settings.privacyLocal': 'Personas, original conversations, analysis history, and drafts are stored in this browser IndexedDB/localStorage.',
    'settings.privacyGemini': 'When you create a persona, your conversation text or screenshots are sent directly to the Google Gemini API; when you analyze, your persona and conversation are.',
    'settings.privacyKey': 'Your Gemini API key is stored in localStorage. In Google Cloud, restrict it to the Gemini API and, where possible, to the littleanti.github.io HTTP referrer.',
    'settings.privacyLoss': 'If browser data is cleared, private browsing ends, or you change devices, local data cannot be recovered. Export a backup when needed.',
    'settings.privacyConsent': 'Get any necessary consent before analyzing someone else’s conversation, and avoid high-risk sensitive data such as government IDs or card numbers.',
    'settings.disclaimerTitle': 'About AI results',
    'settings.disclaimerDesc': 'AI-generated personas and replies are for reference only. They do not replace medical, legal, psychological, or important relationship decisions.',
    'settings.confirmClearAll': 'Delete the API key, personas, history, and drafts from this browser? This cannot be undone.',
    'settings.toastExported': 'Backup file created',
    'settings.toastExportFailed': 'Failed to export backup',
    'settings.toastImported': 'Backup imported: {personas} personas, {analyses} records, {drafts} drafts',
    'settings.toastImportFailed': 'Failed to import backup file',
    'settings.toastCleared': 'All local data deleted',
    'settings.toastClearFailed': 'Failed to delete all data',
  },
};

let currentLang: Lang = detectInitialLang();
const listeners = new Set<() => void>();

/** localStorage → navigator.language 순으로 초기 언어 결정. */
function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'ko' || saved === 'en') return saved;
  } catch {
    // localStorage 접근 불가 — 감지로 폴백
  }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'ko';
  return nav.toLowerCase().startsWith('ko') ? 'ko' : 'en';
}

export function getLang(): Lang {
  return currentLang;
}

/** {param} 보간을 적용해 현재 언어의 문자열을 반환. 키가 없으면 ko 사전 → 키 문자열 순으로 폴백. */
export function t(key: string, params?: Record<string, string | number>): string {
  const raw = MESSAGES[currentLang][key] ?? MESSAGES.ko[key] ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, p: string) =>
    params[p] !== undefined ? String(params[p]) : `{${p}}`,
  );
}

/** 언어 변경 구독 — 동적 뷰가 자신을 다시 렌더링하도록. 해제 함수 반환. */
export function onLangChange(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** 언어를 설정하고 저장 → <html lang>·document.title 갱신 → 구독자 통지. */
export function setLang(lang: Lang): void {
  if (lang === currentLang) return;
  currentLang = lang;
  try {
    localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // 저장 실패는 무시 (세션 한정으로 동작)
  }
  document.documentElement.lang = lang;
  document.title = t('app.title');
  listeners.forEach((cb) => cb());
}

/** 부팅 시 호출 — <html lang> 동기화 + 문서 제목. */
export function initI18n(): void {
  document.documentElement.lang = currentLang;
  document.title = t('app.title');
}
