const fs = require('fs');
let content = fs.readFileSync('./src/services/geminiService.ts', 'utf8');
content = content.replace(
  /      - Examples: \$\{params\.brandVoice\.examples\}/g,
  `      - Examples: \${params.brandVoice.examples}
      \${params.brandVoice.productDetails ? \`- Product Details: \${params.brandVoice.productDetails}\` : ''}
      \${params.brandVoice.colors && params.brandVoice.colors.length > 0 ? \`- Brand Colors: \${params.brandVoice.colors.join(', ')}\` : ''}`
);
fs.writeFileSync('./src/services/geminiService.ts', content);
console.log('Updated geminiService.ts');
