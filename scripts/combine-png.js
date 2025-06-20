const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 來源資料夾
const folder = path.join(__dirname, '../WebContent/assets/sprites/01');
// 目標輸出檔案
const output = path.join(__dirname, '../assets/combined.png');

// 取得資料夾下的前三個 PNG 檔案
const files = fs.readdirSync(folder)
  .filter(f => f.endsWith('.png'))
  .slice(0, 3)
  .map(f => path.join(folder, f));

if (files.length < 3) {
  console.error('找不到三個 PNG 檔案');
  process.exit(1);
}

// 讀取三張圖片
Promise.all(files.map(f => sharp(f).toBuffer()))
  .then(buffers => {
    // 取得每張圖片的 metadata
    return Promise.all(buffers.map(buf => sharp(buf).metadata()))
      .then(metas => ({ buffers, metas }));
  })
  .then(({ buffers, metas }) => {
    // 以第一張圖片的寬度為主
    const width = Math.max(metas[0].width, metas[1].width, metas[2].width);
    const totalHeight = metas.reduce((sum, m) => sum + m.height, 0);

    // 建立空白畫布
    return sharp({
      create: {
        width: width,
        height: totalHeight,
        channels: 4,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      }
    })
      .composite([
        { input: buffers[0], top: 0, left: 0 },
        { input: buffers[1], top: metas[0].height, left: 0 },
        { input: buffers[2], top: metas[0].height + metas[1].height, left: 0 }
      ])
      .png()
      .toFile(output);
  })
  .then(() => {
    console.log('合成完成，輸出檔案：', output);
  })
  .catch(err => {
    console.error('合成失敗：', err);
  }); 