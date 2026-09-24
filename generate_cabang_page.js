const fs = require('fs');

let pageContent = `import TemplateHeader from '@/components/TemplateHeader';

export default function CabangPage() {
  return (
    <>
      <TemplateHeader />
      <main className="store-locator-page bg-black text-white min-h-screen pt-20">
        ${fs.readFileSync('temp-cabang.jsx', 'utf8').replace(/stroke-linejoin/g, 'strokeLinejoin')}
      </main>
    </>
  );
}
`;

fs.mkdirSync('src/app/cabang', { recursive: true });
fs.writeFileSync('src/app/cabang/page.tsx', pageContent);
