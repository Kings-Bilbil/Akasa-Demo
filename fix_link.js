const fs = require('fs');
let content = fs.readFileSync('src/app/product/[id]/page.tsx', 'utf8');
if (!content.includes('import Link from')) {
    content = content.replace('import TemplateHeader', "import Link from 'next/link';\nimport TemplateHeader");
    fs.writeFileSync('src/app/product/[id]/page.tsx', content);
}
