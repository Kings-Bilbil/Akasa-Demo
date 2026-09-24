const fs = require('fs');

// Fix TemplateHeader.tsx
let headerContent = fs.readFileSync('src/components/TemplateHeader.tsx', 'utf8');
headerContent = headerContent.replace('useState(null)', 'useState<any>(null)');
fs.writeFileSync('src/components/TemplateHeader.tsx', headerContent);

// Fix cabang/page.tsx
let cabangContent = fs.readFileSync('src/app/cabang/page.tsx', 'utf8');
if (!cabangContent.includes("import Link from 'next/link'")) {
    cabangContent = cabangContent.replace("import TemplateHeader", "import Link from 'next/link';\nimport TemplateHeader");
    fs.writeFileSync('src/app/cabang/page.tsx', cabangContent);
}

// Fix produk/page.tsx
let produkContent = fs.readFileSync('src/app/produk/page.tsx', 'utf8');
if (!produkContent.includes("import Link from 'next/link'")) {
    produkContent = produkContent.replace("import TemplateHeader", "import Link from 'next/link';\nimport TemplateHeader");
    fs.writeFileSync('src/app/produk/page.tsx', produkContent);
}

