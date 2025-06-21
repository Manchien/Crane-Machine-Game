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

        // 先執行 combine 圖片組合
        exec('node scripts/combine-png.js', (err, stdout, stderr) => {
            if (err) {
                console.error('❌ combine 錯誤：', err);
                return res.status(500).json({
                    success: false,
                    message: 'combine 執行失敗',
                    error: err.message
                });
            }
            console.log('✅ combine 成功：', stdout);
            
            // combine 成功後再執行 mint
            exec('npm run mint', (mintErr, mintStdout, mintStderr) => {
                if (mintErr) {
                    console.error('❌ mint 錯誤：', mintErr);
                    return res.status(500).json({
                        success: false,
                        message: 'mint 執行失敗',
                        error: mintErr.message
                    });
                }
                console.log('✅ mint 成功：', mintStdout);
                res.json({
                    success: true,
                    message: 'Inventory 儲存、圖片組合並自動 mint 完成',
                    filename,
                    filepath,
                    combineOutput: stdout,
                    mintOutput: mintStdout
                });
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
        const filepath = path.join(__dirname, 'assets', filename);

        fs.writeFileSync(filepath, text, 'utf8');
        console.log(`✅ 文字已儲存到: ${filepath}`);

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

// 新增：生成 combined.png 的 API
app.post('/api/generate-combined-image', (req, res) => {
    try {
        const inventory = req.body.inventory;
        if (!inventory || !Array.isArray(inventory)) {
            return res.status(400).json({ success: false, message: '沒有提供有效的 inventory 資料' });
        }

        // 先更新 dolls_inventory.json
        const inventoryPath = path.join(__dirname, 'scripts', 'dolls_inventory.json');
        fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
        console.log('✅ 已更新 dolls_inventory.json');

        // 執行 combine-png.js 腳本
        exec('node scripts/combine-png.js', (err, stdout, stderr) => {
            if (err) {
                console.error('❌ 生成 combined.png 時發生錯誤:', err);
                return res.status(500).json({
                    success: false,
                    message: '生成 combined.png 失敗',
                    error: err.message
                });
            }
            
            console.log('✅ combined.png 生成成功:', stdout);
            
            // 檢查檔案是否真的生成了
            const combinedPath = path.join(__dirname, 'WebContent', 'assets', 'combined.png');
            if (fs.existsSync(combinedPath)) {
                const stats = fs.statSync(combinedPath);
                res.json({
                    success: true,
                    message: 'combined.png 生成成功',
                    filepath: combinedPath,
                    filesize: stats.size,
                    output: stdout
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: 'combined.png 檔案未生成',
                    output: stdout
                });
            }
        });

    } catch (error) {
        console.error('❌ 生成 combined.png 時發生錯誤:', error);
        res.status(500).json({
            success: false,
            message: '生成失敗',
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

// API 端點，用于處理NFT鑄造請求
app.post('/mint', (req, res) => {
    // 从游戏客户端接收钱包地址
    const { recipientAddress } = req.body;

    if (!recipientAddress) {
        return res.status(400).json({ error: 'Missing recipientAddress' });
    }
    
    // 在这里，我们假设组合好的娃娃图片已经存在，或者您可以先运行组合脚本
    // 为简单起见，我们直接指定一个要铸造的图片
    const imageToMint = "WebContent/assets/sprites/01.png"; // 您可以动态决定这张图片

    console.log(`收到铸造请求:
      接收地址: ${recipientAddress}
      铸造图片: ${imageToMint}`);

    // 使用您的 upload-and-mint.js 脚本
    const command = `node scripts/upload-and-mint.js "${imageToMint}"`;
    
    // 注意：您需要修改 upload-and-mint.js 来从 .env 文件读取 RECIPIENT_ADDRESS
    // 或者直接将地址作为参数传递（如果脚本支持）

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`执行脚本出错: ${error.message}`);
            return res.status(500).json({ error: 'Failed to execute minting script.', details: stderr });
        }
        console.log(`脚本输出: ${stdout}`);
        res.status(200).json({ success: true, message: 'NFT Minting process started!', output: stdout });
    });
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`🚀 後端伺服器運行在 http://localhost:${PORT}`);
    console.log(`📁 靜態檔案服務於 http://localhost:${PORT}`);
    console.log(`🔗 API 端點:`);
    console.log(`   POST /api/save-inventory - 儲存 inventory`);
    console.log(`   GET  /api/get-latest-inventory - 取得最新 inventory`);
    console.log(`   POST /api/save-text - 儲存文字`);
    console.log(`   POST /api/generate-combined-image - 生成 combined.png`);
    console.log(`   POST /mint - 處理NFT鑄造請求`);
});

module.exports = app; 