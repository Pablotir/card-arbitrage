const fs = require('fs');
const content = fs.readFileSync('C:/Users/pablo/.gemini/antigravity/brain/8badf30c-0ee6-426e-9d64-26432120a13e/.system_generated/steps/3595/content.md', 'utf8');

const m = content.match(/<article[\s\S]*?<\/article>/i);
if (m) {
  const imgs = m[0].match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) || [];
  imgs.slice(0, 30).forEach((i, idx) => console.log(`#${idx+1}:`, i));
}
