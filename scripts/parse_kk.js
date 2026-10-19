const fs = require('fs');
const content = fs.readFileSync('C:/Users/pablo/.gemini/antigravity/brain/8badf30c-0ee6-426e-9d64-26432120a13e/.system_generated/steps/3605/content.md', 'utf8');

console.log('Length:', content.length);
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (/exclusive|chinese|trainer|galar|alola|lisia|hilda|rika|larry|brock|carmine|blacksmith/i.test(l)) {
    console.log(`L${idx}:`, l.trim().substring(0, 160));
  }
});
