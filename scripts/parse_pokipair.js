const fs = require('fs');
const content = fs.readFileSync('C:/Users/pablo/.gemini/antigravity/brain/8badf30c-0ee6-426e-9d64-26432120a13e/.system_generated/steps/3605/content.md', 'utf8');

const regex = /<li class="pp-card"[^>]*>([\s\S]*?)<\/li>/gi;
let m;
while ((m = regex.exec(content)) !== null) {
  if (/CSV9|CSV10|CSV11|CSV12/i.test(m[1])) {
    const cardHtml = m[1];
    const nameMatch = cardHtml.match(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/i) || cardHtml.match(/alt="([^"]*)"/i);
    const imgMatch = cardHtml.match(/data-full="([^"]*)"/i) || cardHtml.match(/src="([^"]*)"/i);
    console.log(nameMatch ? nameMatch[1].trim() : '', '|', imgMatch ? imgMatch[1] : '');
  }
}
