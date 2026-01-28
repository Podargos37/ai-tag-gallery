@echo off
echo Starting AI Tag Gallery Project...

start http://localhost:3000


start cmd /k "title Python_AI_Server && cd server && ..\.venv\Scripts\activate && python main.py"


echo Frontend Server is starting...
title NextJS_Frontend
npm run dev

pause