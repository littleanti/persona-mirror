import uuid
import json
import os
import re
from datetime import datetime
from pathlib import Path

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Persona Chat Analyzer")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

PERSONAS_DIR = Path("data/personas")
PERSONAS_DIR.mkdir(parents=True, exist_ok=True)

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "gemma4")


class CreatePersonaRequest(BaseModel):
    name: str
    my_name: str = ""
    conversation: str


class AnalyzeRequest(BaseModel):
    persona_id: str
    message: str


def extract_json(text: str) -> dict:
    """LLM 응답에서 JSON을 추출합니다."""
    # 마크다운 코드블록 제거
    text = re.sub(r"```(?:json)?\s*", "", text)
    text = re.sub(r"```", "", text)
    text = text.strip()

    # 중첩 JSON 포함 전체 객체 추출
    try:
        # 첫 번째 { 부터 마지막 } 까지
        start = text.index("{")
        depth = 0
        for i, ch in enumerate(text[start:], start):
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    return json.loads(text[start : i + 1])
    except (ValueError, json.JSONDecodeError):
        pass

    # fallback: 그냥 파싱 시도
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return {"raw": text}


async def call_ollama(prompt: str) -> str:
    async with httpx.AsyncClient(timeout=180.0) as client:
        response = await client.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "stream": False,
            },
        )
        response.raise_for_status()
        return response.json()["message"]["content"]


@app.get("/api/personas")
async def list_personas():
    personas = []
    for f in PERSONAS_DIR.glob("*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            personas.append(
                {
                    "id": data["id"],
                    "name": data["name"],
                    "my_name": data.get("my_name", ""),
                    "created_at": data["created_at"],
                    "summary": data.get("persona", {}).get("summary", ""),
                }
            )
        except Exception:
            continue
    return sorted(personas, key=lambda x: x["created_at"], reverse=True)


PERSONA_FIELDS = """\
  "summary": "요약 (2-3문장, 핵심 성격과 관계 특성 포함)",
  "communication_style": "소통 방식 (직접적/간접적, 솔직한/우회적, 감정적/이성적 등)",
  "tone": "주로 사용하는 어조와 말투 특징",
  "typical_patterns": "자주 쓰는 표현, 말버릇, 문장 패턴",
  "emotional_tendencies": "감정 표현 방식과 감정 조절 특성",
  "what_they_value": "이 사람이 대화에서 중요하게 여기는 가치와 요소",
  "how_they_seek_response": "어떤 종류의 반응과 답변을 원하는 경향이 있는지",
  "relationship_dynamics": "이 관계에서 보이는 역할과 패턴"\
"""


@app.post("/api/personas")
async def create_persona(req: CreatePersonaRequest):
    my_name = req.my_name.strip()

    if my_name:
        prompt = f"""다음은 "{my_name}"과 "{req.name}" 사이의 실제 대화 기록입니다.
두 사람 각각의 페르소나를 분석해주세요.

대화 기록:
{req.conversation}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트, 설명, 마크다운은 절대 포함하지 마세요:
{{
  "other_persona": {{
{PERSONA_FIELDS}
  }},
  "my_persona": {{
{PERSONA_FIELDS}
  }}
}}

other_persona는 "{req.name}"의 페르소나이고, my_persona는 "{my_name}"의 페르소나입니다.
각 페르소나는 이 두 사람의 관계 맥락에서 분석되어야 합니다."""
    else:
        prompt = f"""다음은 "{req.name}"과의 실제 대화 기록입니다. 이 대화를 깊이 분석하여 {req.name}의 페르소나를 만들어주세요.

대화 기록:
{req.conversation}

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트, 설명, 마크다운은 절대 포함하지 마세요:
{{
{PERSONA_FIELDS}
}}"""

    result = await call_ollama(prompt)
    raw = extract_json(result)

    if my_name:
        persona_data = raw.get("other_persona", raw)
        my_persona_data = raw.get("my_persona", {})
    else:
        persona_data = raw
        my_persona_data = {}

    persona_id = str(uuid.uuid4())
    data = {
        "id": persona_id,
        "name": req.name,
        "my_name": my_name,
        "created_at": datetime.now().isoformat(),
        "conversation": req.conversation,
        "persona": persona_data,
        "my_persona": my_persona_data,
    }

    (PERSONAS_DIR / f"{persona_id}.json").write_text(
        json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    return data


@app.get("/api/personas/{persona_id}")
async def get_persona(persona_id: str):
    path = PERSONAS_DIR / f"{persona_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="페르소나를 찾을 수 없습니다.")
    return json.loads(path.read_text(encoding="utf-8"))


@app.delete("/api/personas/{persona_id}")
async def delete_persona(persona_id: str):
    path = PERSONAS_DIR / f"{persona_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="페르소나를 찾을 수 없습니다.")
    path.unlink()
    return {"success": True}


@app.post("/api/analyze")
async def analyze_message(req: AnalyzeRequest):
    path = PERSONAS_DIR / f"{req.persona_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="페르소나를 찾을 수 없습니다.")

    data = json.loads(path.read_text(encoding="utf-8"))
    persona = data["persona"]
    name = data["name"]
    my_name = data.get("my_name", "").strip()
    my_persona = data.get("my_persona", {})

    persona_str = json.dumps(persona, ensure_ascii=False, indent=2)
    receiver_label = my_name if my_name else "상대방"

    my_persona_section = ""
    if my_name and my_persona:
        my_persona_str = json.dumps(my_persona, ensure_ascii=False, indent=2)
        my_persona_section = f"""
{my_name}(메시지를 받는 사람)의 페르소나 - {name}과의 관계에서:
{my_persona_str}

"""

    prompt = f"""당신은 지금 "{name}"의 내면 심리를 완벽히 이해하는 분석가입니다.

{name}의 성격 및 소통 방식 분석:
{persona_str}
{my_persona_section}
{name}이(가) {receiver_label}에게 다음 메시지를 보냈습니다:
"{req.message}"

{name}의 성격, 소통 방식, 감정 표현 방식, 관계 패턴을 깊이 고려하여 분석하세요:
- {name}이 이 메시지를 보낸 진짜 심리적 이유는 무엇인가?
- {name}은 {receiver_label}으로부터 어떤 종류의 답변을 듣고 싶어하는가?
{"- " + my_name + "의 성격과 소통 방식을 고려할 때, 어떤 답변이 가장 자연스럽고 효과적인가?" if my_name else ""}
- 가능한 답변 후보 3가지는 무엇인가? (각각 다른 뉘앙스와 방향으로)

반드시 아래 JSON 형식으로만 응답하세요. 다른 텍스트나 마크다운은 절대 포함하지 마세요:
{{
  "analysis": "{name}이(가) 이 메시지를 보낸 심리적 배경과 기대하는 반응에 대한 분석 (2-3문장)",
  "candidates": [
    {{
      "label": "답변 유형 (예: 공감형, 해결책 제시형, 감정 표현형 등)",
      "reason": "{name}이 이 답변을 원하는 구체적인 이유",
      "response": "{receiver_label}이(가) {name}에게 보낼 수 있는 실제 답변 내용"
    }},
    {{
      "label": "답변 유형",
      "reason": "{name}이 이 답변을 원하는 구체적인 이유",
      "response": "{receiver_label}이(가) {name}에게 보낼 수 있는 실제 답변 내용"
    }},
    {{
      "label": "답변 유형",
      "reason": "{name}이 이 답변을 원하는 구체적인 이유",
      "response": "{receiver_label}이(가) {name}에게 보낼 수 있는 실제 답변 내용"
    }}
  ]
}}"""

    result = await call_ollama(prompt)
    analysis_data = extract_json(result)

    # raw 응답 fallback 처리
    if "raw" in analysis_data:
        analysis_data = {
            "analysis": "AI 응답을 파싱하는 데 문제가 발생했습니다. 원본 응답을 확인하세요.",
            "candidates": [
                {
                    "label": "원본 응답",
                    "reason": "JSON 파싱 실패",
                    "response": analysis_data["raw"],
                }
            ],
        }

    return analysis_data


@app.get("/api/health")
async def health():
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get("http://localhost:11434/api/tags")
            models = [m["name"] for m in resp.json().get("models", [])]
            return {"status": "ok", "ollama": "connected", "models": models}
    except Exception as e:
        return {"status": "ok", "ollama": "disconnected", "error": str(e)}


# 정적 파일은 마지막에 마운트 (API 라우트보다 나중에)
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
