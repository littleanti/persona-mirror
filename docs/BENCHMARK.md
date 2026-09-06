# 벤치마킹 — 메일 연동(AI 답장 제안) 요구사항 정의 前 비교표

> 작성일: 2026-08-31 · 대상: 카카오톡 / iMessage / Galaxy Message(Samsung Messages) / WeChat
> 내부 자료 출처: `persora/docs/PRD.md`, `persora/docs/PLAN.md`, `persora/docs/TRD.md`, `persora/README.md`(모두 code/persora 폴더)

## 스코프 메모
4개 비교 대상은 메일 앱이 아닌 메신저이므로, "메일 연동" 자체를 제공하는 곳은 확인되지 않았다(Apple만 Mail 앱에 동일 Smart Reply 엔진을 별도 앱으로 적용). 따라서 이 표는 Persora가 메일을 새 입력 채널로 붙일 때 참고할 **"AI가 대화 맥락을 읽고 답장을 제안/생성하는 기능"**을 축으로 비교했다. 카카오·위챗은 개인 1:1 채팅용 답장 추천을 공식적으로 확인하지 못해 해당 셀은 "확인 불가"로 표기하고, 가장 가까운 공개 기능(업주/공식계정 자동응답 등)을 병기했다.

## 비교표

| 서비스 | 해결하는 문제 | 핵심 기능 범위 | 사용 플로우 | 정책·제한 | 유료화 지점 | 최근 업데이트 |
|---|---|---|---|---|---|---|
| **Persora(자사)** | 대화로 상대 심리 파악, 원하는 답변 추론 [PRD 12행] | 페르소나 분석 + 답변 후보 3개 생성 [PRD 64행] | 대화 붙여넣기/.txt 첨부 → 분석 → 후보 확인 [PRD 59,64행] | 개인 Gemini 키로 직접 호출, 서버 미저장 [PRD 17-19행] | 자체 과금 없음, LLM 비용은 사용자 부담 [PRD 45행] | 텍스트·이미지 입력 단일 flash 모델 통일 [PRD 3,5행] |
| **카카오톡** | 밀린 대화 파악, 업주 고객응대 부담 경감 [kakaotalk-ai.kakao.com] | 대화·통화 요약, 상담매니저(업주 자동응답) [kakaotalk-ai.kakao.com] | 안읽음 채팅 요약 확인 / 업주가 응답시간 설정 [kakaotalk-ai.kakao.com] | 개인용 답장 추천 확인 불가, 상담매니저는 업주 전용 [kakaotalk-ai.kakao.com] | 통화요약 등 데이터비 외 무료 [kakaotalk-ai.kakao.com] | PC ChatGPT 확대 등 v26.6.0(2026.7.15) [kakaocorp.com/page/detail/12082] |
| **iMessage** | 빠른 답장 작성으로 응답 시간 단축 [apple.com/newsroom] | Smart Reply, 메시지 요약(Mail에도 동일 적용) [apple.com/ios/feature-availability] | 메시지 상단에 제안 답장 노출 → 탭해 전송 [apple.com/apple-intelligence] | iPhone 15 Pro 이상·iOS 26 필요, 中 본토 간체 제외 [apple.com/ios/feature-availability] | 무료, 별도 구독 없음 [apple.com/apple-intelligence] | Apple Intelligence 기능 확장 발표(2025.6) [apple.com/newsroom] |
| **Galaxy Message** | 메시지 작성 시간 단축, 어투 교정 [samsung.com] | 제안 답장, 실시간 번역, 문체 변경, 맞춤법 [samsung.com] | 수신 메시지에서 Chat assist 선택 → 전송 [samsung.com] | Galaxy S24 이상 등 지원 기종 한정 [samsung.com] | 기본기능 무료(유료 전환 여부는 논의 중) [samsung.com/ae] | 핵심기능 무기한 무료 확정(2026.1) [androidauthority.com] |
| **WeChat** | (개인용) 확인 불가 / (공식계정) 응대 업무 경감 [aibase.com] | 공식계정 '스마트리플라이', Xiaowei 개인비서 베타 [aibase.com] | PC 백엔드서 자동응답 설정 → AI가 대신 답장 [aibase.com] | 개인 1:1 답장 추천 확인 불가, Xiaowei 소규모 테스트 중 [aibase.com] | 확인 불가(공개된 과금 정보 없음) | Xiaowei 그레이스케일 테스트 시작(2026.6) [aibase.com] |

## 우리가 다르게 갈 지점

1. **개인 관계 특화 vs 업무/공식계정 자동응답.** 카카오의 상담매니저와 위챗의 스마트리플라이는 업주·공식계정이 다수 고객에게 자동 응대하는 용도로, 특정 개인과의 관계 맥락을 반영하지 않는다. Persora는 페르소나 분석을 기반으로 "이 사람이 나에게 무엇을 듣고 싶어 하는지"를 추론하는 1:1 관계 특화 답장 제안이라는 점에서 명확히 다르다.
2. **메일을 포함한 단일 입력 채널 통합.** iMessage의 Smart Reply는 Mail과 Messages에 같은 엔진을 쓰지만 앱이 분리되어 있고, 카카오·삼성·위챗에서는 메일 연동 사례가 확인되지 않았다. Persora는 기존 카카오톡 대화 파일 입력에 메일을 추가 입력 채널로 통합해, 채널이 달라도 동일한 페르소나·답장 추천 경험을 제공할 수 있다.
3. **서버 미저장·사용자 소유 키 원칙의 유지.** 경쟁 서비스는 온디바이스(Kanana, Galaxy AI) 또는 클라우드(Apple, WeChat) 처리 방식을 쓰지만, 원본 대화를 서버에 저장하지 않는다고 명시적으로 확인된 곳은 없었다. Persora는 페르소나·분석 기록을 IndexedDB에만 저장하고 Gemini 호출도 사용자 키로 직접 수행하므로, 메일 연동 시에도 이 원칙(서버 미경유, 메일 원문 비저장)을 요구사항 1순위로 유지해야 한다.

## 출처 목록

- 내부 자료: `persora/docs/PRD.md`(1~112행), `persora/docs/PLAN.md`, `persora/docs/TRD.md`, `persora/README.md`
- 카카오: https://kakaotalk-ai.kakao.com , https://www.kakaocorp.com/page/detail/12082
- Apple: https://www.apple.com/newsroom/2025/06/apple-intelligence-gets-even-more-powerful-with-new-capabilities-across-apple-devices/ , https://www.apple.com/ios/feature-availability/ , https://www.apple.com/apple-intelligence/
- Samsung: https://www.samsung.com/latin_en/support/mobile-devices/an-overview-of-the-enhancement-writing-assist-when-sending-or-receiving-messages-on-the-galaxy-s24/ , https://www.samsung.com/ae/support/mobile-devices/is-there-a-subscription-fee-for-the-galaxy-ai-features-similar-to-other-popular-ai-services/ , https://www.androidauthority.com/samsung-galaxy-ai-features-free-3632510/
- WeChat: https://news.aibase.com/news/21219 , https://news.aibase.com/news/29043

## 확인 불가로 남긴 항목(추측 금지 원칙 적용)

- 카카오톡: 개인 1:1 채팅 대상 AI 답장 추천 기능의 존재 여부, 메일 연동 여부
- 위챗: 개인 1:1 채팅 답장 추천, 유료화 정책, 메일 연동 여부
- 삼성/애플: 메일-메신저 통합 계정 연동(로그인 연동) 여부
