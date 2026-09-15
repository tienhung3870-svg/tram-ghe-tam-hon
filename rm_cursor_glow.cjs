const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Find function CursorGlow and remove it exactly
const startIndex = code.indexOf('function CursorGlow() {');
if (startIndex !== -1) {
  let depth = 0;
  let endIndex = -1;
  for (let i = startIndex; i < code.length; i++) {
    if (code[i] === '{') depth++;
    if (code[i] === '}') {
      depth--;
      if (depth === 0) {
        endIndex = i;
        break;
      }
    }
  }
  if (endIndex !== -1) {
    code = code.substring(0, startIndex) + code.substring(endIndex + 1);
  }
}

fs.writeFileSync('src/App.tsx', code);
