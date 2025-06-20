const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 讀取 dolls_inventory.json 檔案
const inventoryPath = path.join(__dirname, 'dolls_inventory.json');
const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));

// 來源資料夾
const folder = path.join(__dirname, '../WebContent/assets/sprites');
// 目標輸出檔案
const output = path.join(__dirname, '../assets/combined.png');
const webContentOutput = path.join(__dirname, '../WebContent/assets/combined.png');

// 從 inventory 中取得所有 img 檔名，並按照 type 排序
const typeOrder = ['head', 'body', 'foot'];
const imageFiles = inventory
  .filter(item => item.img && item.img.endsWith('.png'))
  .sort((a, b) => {
    const aIndex = typeOrder.indexOf(a.type);
    const bIndex = typeOrder.indexOf(b.type);
    return aIndex - bIndex;
  })
  .map(item => item.img);

if (imageFiles.length === 0) {
  console.error('在 dolls_inventory.json 中找不到 PNG 檔案');
  process.exit(1);
}

// 取得完整的檔案路徑
const files = imageFiles.map(img => path.join(folder, img));

console.log('要組合的圖片檔案：', imageFiles);

// 讀取所有圖片
Promise.all(files.map(f => sharp(f).toBuffer()))
  .then(buffers => {
    // 取得每張圖片的 metadata
    return Promise.all(buffers.map(buf => sharp(buf).metadata()))
      .then(metas => ({ buffers, metas }));
  })
  .then(({ buffers, metas }) => {
    // 計算所有圖片的總高度
    const totalHeight = metas.reduce((sum, m) => sum + m.height, 0);
    // 以最寬的圖片寬度為主
    const maxWidth = Math.max(...metas.map(m => m.width));
    
    // 使用較大的值作為正方形的邊長
    const squareSize = Math.max(maxWidth, totalHeight);
    
    // 計算垂直排列的起始位置（居中）
    const startY = Math.floor((squareSize - totalHeight) / 2);

    console.log(`組合 ${metas.length} 張圖片，正方形尺寸：${squareSize}x${squareSize}`);
    console.log(`圖片總高度：${totalHeight}，最大寬度：${maxWidth}`);

    // 建立空白畫布（正方形）
    const composite = [];
    let currentTop = startY;
    
    buffers.forEach((buffer, index) => {
      // 計算水平居中位置
      const imageWidth = metas[index].width;
      const startX = Math.floor((squareSize - imageWidth) / 2);
      
      composite.push({
        input: buffer,
        top: currentTop,
        left: startX
      });
      currentTop += metas[index].height;
    });

    return sharp({
      create: {
        width: squareSize,
        height: squareSize,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite(composite)
      .png()
      .toFile(output)
      .then(() => {
        // 同時複製到 WebContent/assets 資料夾
        return sharp(output).png().toFile(webContentOutput);
      });
  })
  .then(() => {
    console.log('合成完成，輸出檔案：', output);
    console.log('同時複製到：', webContentOutput);
  })
  .catch(err => {
    console.error('合成失敗：', err);
  }); 