@echo off
echo 🚀 啟動 Crane Game 伺服器...
echo.

REM 檢查是否已安裝依賴
if not exist "node_modules" (
    echo 📦 安裝依賴套件...
    npm install
)

echo 🎮 啟動遊戲伺服器...
npm start

pause 