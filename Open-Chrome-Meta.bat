@echo off
echo Cleaning up any background Chrome instances...
taskkill /F /IM chrome.exe >nul 2>&1
timeout /t 1 /nobreak >nul
echo Starting Google Chrome for Brenden Work profile with DevTools port 9222...
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --profile-directory="Profile 3" "https://developers.facebook.com/apps/"
exit
