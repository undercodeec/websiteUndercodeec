const fs = require('fs');
const path = require('path');

function walk(dir, fn) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    let dp = path.join(dir, f);
    if(fs.statSync(dp).isDirectory()) walk(dp, fn);
    else fn(dp);
  });
}

const dir = path.join(__dirname, 'src');

walk(dir, file => {
  const base = path.basename(file);
  if (base.toLowerCase().includes('rtl')) {
    console.log('Deleting', file);
    fs.unlinkSync(file);
    return;
  }
  
  if (!file.match(/\.(js|jsx)$/)) return;
  
  let code = fs.readFileSync(file, 'utf8');
  let newCode = code;
  
  // 1. Remove RTL JSON imports
  newCode = newCode.replace(/import\s+[a-zA-Z0-9_]+[rR][tT][lL]\s+from\s+['"][^'"]+rtl(?:\.json)?['"];?/g, '');
  newCode = newCode.replace(/import\s+[^{]+RTL[^\n]+rtl[^\n]+;/g, '');
  
  // 2. Remove prop 'rtl' from destructuring, e.g. `{ rtl, style }`
  newCode = newCode.replace(/\{\s*rtl\s*,\s*/g, '{ ');
  newCode = newCode.replace(/,\s*rtl\s*\}/g, ' }');
  newCode = newCode.replace(/\{\s*rtl\s*\}/g, '{}');
  newCode = newCode.replace(/,\s*rtl\s*,/g, ',');
  newCode = newCode.replace(/\(\{\s*rtl\s*\}\)/g, '()');
  
  // 3. Remove conditional assignment: `const data = rtl ? dataRTL : normalData;`
  // also handles useMemo
  newCode = newCode.replace(/(const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:useMemo\(\(\)\s*=>\s*)?rtl\s*\?\s*[a-zA-Z0-9_]+\s*:\s*([a-zA-Z0-9_]+)(?:,\s*\[rtl\]\))?;?/g, '$1 $2 = $3;');
  
  // 4. Inline ternary strings
  newCode = newCode.replace(/rtl\s*\?\s*('[^']+')\s*:\s*('[^']+')/g, '$2');
  newCode = newCode.replace(/rtl\s*\?\s*("[^"]+")\s*:\s*("[^"]+")/g, '$2');
  newCode = newCode.replace(/rtl\s*\?\s*(`[^`]+`)\s*:\s*(`[^`]+`)/g, '$2');
  newCode = newCode.replace(/rtl\s*\?\s*([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_]+)/g, '$2');
  // Simple parens ternary: `rtl ? (<a>) : (<b>)` -> `(<b>)`
  newCode = newCode.replace(/rtl\s*\?\s*\(([^()]+)\)\s*:\s*\(([^()]+)\)/g, '($2)');
  // JSX ternary: `rtl ? <NavbarRTL /> : <Navbar />`
  newCode = newCode.replace(/rtl\s*\?\s*(<[A-Za-z0-9_]+\s*\/>)\s*:\s*(<[A-Za-z0-9_]+\s*\/>)/g, '$2');
  
  // 5. Remove `<Component rtl={rtl} />`
  newCode = newCode.replace(/\s+rtl=\{rtl\}/g, '');
  newCode = newCode.replace(/\s+rtl=\{true\}/g, '');
  newCode = newCode.replace(/\s+rtl=\{false\}/g, '');
  
  // Ensure we don't have stray "rtl?" without removal (if any missed)
  // Let's not blindly replace them, to avoid breaking syntax.
  
  if (code !== newCode) {
    fs.writeFileSync(file, newCode, 'utf8');
    console.log('Modified', file);
  }
});
