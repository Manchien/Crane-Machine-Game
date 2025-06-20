// 結束畫面控制邏輯
class EndScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.successScreen = document.getElementById('successScreen');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.celebration = document.getElementById('celebration');
        
        // 從 URL 參數獲取狀態
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get('status');
        
        if (status === 'minting') {
            this.showMintingScreen();
        } else if (status === 'success') {
            this.showSuccessScreen();
        }
    }

    showMintingScreen() {
        this.loadingScreen.style.display = 'block';
        this.successScreen.style.display = 'none';
        this.simulateMintingProgress();
    }

    showSuccessScreen() {
        this.loadingScreen.style.display = 'none';
        this.successScreen.style.display = 'block';
        this.createConfetti();
    }

    simulateMintingProgress() {
        const steps = [
            { progress: 20, text: '準備鑄造環境...' },
            { progress: 40, text: '上傳圖片到 IPFS...' },
            { progress: 60, text: '生成元數據...' },
            { progress: 80, text: '提交區塊鏈交易...' },
            { progress: 100, text: '鑄造完成！' }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                this.progressFill.style.width = step.progress + '%';
                this.progressText.textContent = step.text;
                currentStep++;
            } else {
                clearInterval(interval);
                // 鑄造完成後延遲一下再顯示成功畫面
                setTimeout(() => {
                    this.showSuccessScreen();
                }, 1000);
            }
        }, 2000); // 每2秒更新一次進度
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            this.celebration.appendChild(confetti);
        }

        // 清理 confetti
        setTimeout(() => {
            this.celebration.innerHTML = '';
        }, 5000);
    }
}

// 全局函數
function restartGame() {
    // 清除 localStorage 中的 inventory
    localStorage.removeItem('myDolls');
    // 返回遊戲主頁
    window.location.href = 'index.html';
}

function viewNFT() {
    // 這裡可以添加查看 NFT 的邏輯
    // 例如跳轉到區塊鏈瀏覽器或 NFT 市場
    alert('NFT 查看功能開發中...');
}

// 初始化結束畫面
document.addEventListener('DOMContentLoaded', () => {
    new EndScreen();
});

// 監聽來自父窗口的消息
window.addEventListener('message', (event) => {
    if (event.data.type === 'showMintingScreen') {
        new EndScreen().showMintingScreen();
    } else if (event.data.type === 'showSuccessScreen') {
        new EndScreen().showSuccessScreen();
    }
}); 