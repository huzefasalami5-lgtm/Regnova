@echo off
title Push REGNOVA to GitHub
color 0a
cd /d "%~dp0"
echo =================================================================
echo   Pushing REGNOVA Monorepo to GitHub
echo   Repository: https://github.com/huzefasalami5-lgtm/Regnova.git
echo =================================================================
echo.
"C:\Program Files\Git\cmd\git.exe" push -u origin main
echo.
echo =================================================================
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Code successfully pushed to GitHub!
) else (
    echo [NOTICE] Please complete the GitHub authentication in your browser.
)
echo =================================================================
pause
