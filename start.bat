@echo off
echo.
echo  ===================================
echo   페르소나 분석기 서버 시작 중...
echo  ===================================
echo.

:: 가상환경이 있으면 활성화
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)

:: 패키지 설치 (최초 실행 시)
pip install -r requirements.txt -q

echo.
echo  서버 주소: http://localhost:8000
echo  휴대폰에서 접속: http://[이 PC의 IP]:8000
echo  (IP 확인: ipconfig 명령어 실행)
echo.
echo  종료하려면 Ctrl+C 를 누르세요.
echo.

python -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
