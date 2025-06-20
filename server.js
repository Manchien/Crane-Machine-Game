const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 3001;

// 中間件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'WebContent')));

// 儲存 inventory 的 API
app.post('/api/save-inventory', (req, res) => {
    try {
        const inventory = req.body.inventory;
        const filename = `dolls_inventory.json`;
        const filepath = path.join(__dirname, 'scripts', filename);

        // 確保資料夾存在
        if (!fs.existsSync(path.join(__dirname, 'scripts'))) {
            fs.mkdirSync(path.join(__dirname, 'scripts'), { recursive: true });
        }

        // 儲存檔案
        fs.writeFileSync(filepath, JSON.stringify(inventory, null, 2));
        console.log(`✅ Inventory 已儲存到: ${filename}`);

        // 執行 mint 指令後再回應
        exec('npm run mint', (err, stdout, stderr) => {
            if (err) {
                console.error('❌ mint 錯誤：', err);
                return res.status(500).json({
                    success: false,
                    message: 'mint 執行失敗',
                    error: err.message
                });
            }
            console.log('✅ mint 成功：', stdout);
            res.json({
                success: true,
                message: 'Inventory 儲存並自動 mint 完成',
                filename,
                filepath,
                mintOutput: stdout
            });
        });

    } catch (error) {
        console.error('❌ 儲存 inventory 時發生錯誤:', error);
        res.status(500).json({
            success: false,
            message: '儲存失敗',
            error: error.message
        });
    }
});

// 新增：儲存文字到 txt 檔案的 API
app.post('/api/save-text', (req, res) => {
    try {
        const { text } = req.body;
        if (typeof text === 'undefined') {
            return res.status(400).json({ success: false, message: '沒有提供文字內容' });
        }

        const filename = 'userInput.txt';
        const filepath = path.join(__dirname, filename);

        fs.writeFileSync(filepath, text, 'utf8');
        console.log(`✅ 文字已儲存到: ${filename}`);

        res.json({
            success: true,
            message: '文字儲存成功',
            filename,
            filepath
        });

    } catch (error) {
        console.error('❌ 儲存文字時發生錯誤:', error);
        res.status(500).json({
            success: false,
            message: '儲存失敗',
            error: error.message
        });
    }
});

// 取得最新 inventory 的 API
app.get('/api/get-latest-inventory', (req, res) => {
    try {
        const scriptsDir = path.join(__dirname, 'scripts');
        if (!fs.existsSync(scriptsDir)) {
            return res.json({ success: false, message: '沒有找到 inventory 檔案' });
        }
        
        const files = fs.readdirSync(scriptsDir)
            .filter(file => file.startsWith('dolls_inventory_') && file.endsWith('.json'))
            .sort()
            .reverse();
        
        if (files.length === 0) {
            return res.json({ success: false, message: '沒有找到 inventory 檔案' });
        }
        
        const latestFile = files[0];
        const filepath = path.join(scriptsDir, latestFile);
        const inventory = JSON.parse(fs.readFileSync(filepath, 'utf8'));
        
        res.json({
            success: true,
            inventory: inventory,
            filename: latestFile
        });
        
    } catch (error) {
        console.error('❌ 讀取 inventory 時發生錯誤:', error);
        res.status(500).json({
            success: false,
            message: '讀取失敗',
            error: error.message
        });
    }
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 後端伺服器運行在 http://localhost:${PORT}`);
    console.log(`📁 靜態檔案服務於 http://localhost:${PORT}`);
    console.log(`🔗 API 端點:`);
    console.log(`   POST /api/save-inventory - 儲存 inventory`);
    console.log(`   GET  /api/get-latest-inventory - 取得最新 inventory`);
    console.log(`   POST /api/save-text - 儲存文字`);
});

module.exports = app; 