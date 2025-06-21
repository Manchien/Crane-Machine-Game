// End screen control logic
class EndScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.successScreen = document.getElementById('successScreen');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.celebration = document.getElementById('celebration');
        
        // Get status from URL parameters
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
        
        // Force reload image to avoid cache issues
        const nftImage = document.getElementById('nftImage');
        if (nftImage) {
            // Add timestamp to force reload
            const timestamp = new Date().getTime();
            nftImage.src = `assets/combined.png?t=${timestamp}`;
            
            // If image fails to load, show default image or error message
            nftImage.onerror = function() {
                console.error('Failed to load NFT image');
                this.style.display = 'none';
                // Can display a default placeholder
                const placeholder = document.createElement('div');
                placeholder.style.width = '200px';
                placeholder.style.height = '200px';
                placeholder.style.backgroundColor = '#f0f0f0';
                placeholder.style.borderRadius = '15px';
                placeholder.style.margin = '20px auto';
                placeholder.style.display = 'flex';
                placeholder.style.alignItems = 'center';
                placeholder.style.justifyContent = 'center';
                placeholder.innerHTML = '🎉 NFT Minting Complete!';
                this.parentNode.insertBefore(placeholder, this);
            };
        }
        
        this.createConfetti();
    }

    simulateMintingProgress() {
        const steps = [
            { progress: 20, text: 'Preparing minting environment...' },
            { progress: 40, text: 'Uploading image to IPFS...' },
            { progress: 60, text: 'Generating metadata...' },
            { progress: 80, text: 'Submitting blockchain transaction...' },
            { progress: 100, text: 'Minting complete!' }
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
                // Delay showing success screen after minting is complete
                setTimeout(() => {
                    this.showSuccessScreen();
                }, 1000);
            }
        }, 2000); // Update progress every 2 seconds
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

        // Clean up confetti
        setTimeout(() => {
            this.celebration.innerHTML = '';
        }, 5000);
    }
}

// Global functions
function restartGame() {
    // Clear inventory from localStorage
    localStorage.removeItem('myDolls');
    // Return to game main page
    window.location.href = 'index.html';
}

function viewNFT() {
    // Here you can add logic to view NFT
    // For example, redirect to blockchain explorer or NFT marketplace
    alert('NFT viewing feature under development...');
}

// Initialize end screen
document.addEventListener('DOMContentLoaded', () => {
    new EndScreen();
});

// Listen for messages from parent window
window.addEventListener('message', (event) => {
    if (event.data.type === 'showMintingScreen') {
        new EndScreen().showMintingScreen();
    } else if (event.data.type === 'showSuccessScreen') {
        new EndScreen().showSuccessScreen();
    }
}); 