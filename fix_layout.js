const fs = require('fs');
let layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf8');
layoutContent = layoutContent.replace('text-gray-900 bg-gray-50', '');
fs.writeFileSync('src/app/layout.tsx', layoutContent);
