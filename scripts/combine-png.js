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
    // 以最寬的圖片寬度為主
    const width = Math.max(...metas.map(m => m.width));
    const totalHeight = metas.reduce((sum, m) => sum + m.height, 0);

    console.log(`組合 ${metas.length} 張圖片，總寬度：${width}，總高度：${totalHeight}`);

    // 建立空白畫布
    const composite = [];
    let currentTop = 0;
    
    buffers.forEach((buffer, index) => {
      composite.push({
        input: buffer,
        top: currentTop,
        left: 0
      });
      currentTop += metas[index].height;
    });

    return sharp({
      create: {
        width: width,
        height: totalHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite(composite)
      .png()
      .toFile(output);
  })
  .then(() => {
    console.log('合成完成，輸出檔案：', output);
  })
  .catch(err => {
    console.error('合成失敗：', err);
  }); 