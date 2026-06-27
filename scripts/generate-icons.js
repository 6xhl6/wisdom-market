/**
 * 生成 PWA 所需的所有图标文件
 * 用 node 内置模块生成简单的购物车主题图标（纯 zlib 生成 PNG，无需第三方依赖）
 */
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../public/img/icons');
fs.mkdirSync(OUT, { recursive: true });

const COLORS = {
  bg: [238, 10, 36],    // #ee0a24 品牌红
  fg: [255, 255, 255],  // 白色
};

// ============================================================
// 方案：生成简单的 SVG favicon，用途广泛
// ============================================================
const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="48" fill="#ee0a24"/>
  <text x="50" y="62" font-size="40" font-family="sans-serif" fill="white" text-anchor="middle" font-weight="bold">智</text>
</svg>`;

fs.writeFileSync(path.join(OUT, 'favicon.svg'), svgIcon);
fs.writeFileSync(path.join(OUT, 'safari-pinned-tab.svg'), svgIcon);

// ============================================================
// 纯色 PNG 生成（不依赖第三方库）
// 生成所有需要的 PNG 图标
// ============================================================

function createPNG(size, outputPath) {
  // 创建简单的彩色方块 PNG
  // PNG 结构: signature | IHDR | IDAT | IEND
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData.writeUInt8(8, 8);        // bit depth
  ihdrData.writeUInt8(2, 9);        // color type (RGB)
  ihdrData.writeUInt8(0, 10);       // compression
  ihdrData.writeUInt8(0, 11);       // filter
  ihdrData.writeUInt8(0, 12);       // interlace
  const ihdr = createChunk('IHDR', ihdrData);

  // Raw pixel data: each row has filter byte (0) + RGB * width
  const rawData = Buffer.alloc(size * (1 + 3 * size));
  for (let y = 0; y < size; y++) {
    const rowStart = y * (1 + 3 * size);
    rawData.writeUInt8(0, rowStart); // filter: none
    for (let x = 0; x < size; x++) {
      const cx = size / 2;
      const cy = size / 2;
      const r = size * 0.42;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const pixelStart = rowStart + 1 + x * 3;

      if (dist < r) {
        // 圆形内部：品牌红色
        rawData.writeUInt8(238, pixelStart);
        rawData.writeUInt8(10, pixelStart + 1);
        rawData.writeUInt8(36, pixelStart + 2);
      } else if (dist < r + 1.5) {
        // 边缘抗锯齿
        rawData.writeUInt8(200, pixelStart);
        rawData.writeUInt8(10, pixelStart + 1);
        rawData.writeUInt8(30, pixelStart + 2);
      } else {
        // 背景透明/白色
        rawData.writeUInt8(255, pixelStart);
        rawData.writeUInt8(255, pixelStart + 1);
        rawData.writeUInt8(255, pixelStart + 2);
      }
    }
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idat = createChunk('IDAT', compressed);
  const iend = createChunk('IEND', Buffer.alloc(0));

  fs.writeFileSync(outputPath, Buffer.concat([signature, ihdr, idat, iend]));
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  // CRC32
  const crc = crc32(crcData);
  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

// CRC32 lookup table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ============================================================
// 生成所有需要的 PNG 图标
// ============================================================
const sizes = [
  // manifest.json 里引用的
  { size: 192, name: 'android-chrome-192x192.png' },
  { size: 512, name: 'android-chrome-512x512.png' },
  { size: 192, name: 'android-chrome-maskable-192x192.png' },
  { size: 512, name: 'android-chrome-maskable-512x512.png' },
  // index.html 里引用的
  { size: 32, name: 'favicon-32x32.png' },
  { size: 16, name: 'favicon-16x16.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 144, name: 'msapplication-icon-144x144.png' },
];

sizes.forEach(({ size, name }) => {
  createPNG(size, path.join(OUT, name));
  console.log(`✓ ${name} (${size}x${size})`);
});

console.log('\n所有图标文件已生成！');
