const fs = require('fs');
let content = fs.readFileSync('src/app/page.tsx', 'utf8');
content = content.replace('className="absolute inset-0 w-full h-full border-0 rounded-2xl"', 'style={{ width: "100%", height: "100%", border: 0, borderRadius: "24px" }}');
fs.writeFileSync('src/app/page.tsx', content);
