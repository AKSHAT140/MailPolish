@echo off
echo Starting MailPolish...

echo Starting Backend...
cd backend
start "MailPolish Backend" cmd /k "..\backend\.venv\Scripts\activate && uvicorn main:app --reload"
cd ..

echo Starting Frontend...
cd frontend
start "MailPolish Frontend" cmd /k "npm run dev"
cd ..

echo Both services have been started in new windows!
echo To stop them, just close those terminal windows.
pause
