@echo off
echo Starting Shopigo Django Backend Server...
cd /d "%~dp0"
venv\Scripts\python.exe manage.py runserver
pause
