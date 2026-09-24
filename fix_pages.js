const fs = require('fs');

// CABANG PAGE
let cabangContent = fs.readFileSync('src/app/cabang/page.tsx', 'utf8');

// Replace header
cabangContent = cabangContent.replace(
  /<div className="store-locator__header">[\s\S]*?<\/div>/,
  `<div className="store-locator__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '24px', margin: 0 }}>Cari <span style={{ color: '#F5C518' }}>Cabang Azuraya</span></h2>
      <Link href="/#cabang" className="store-locator__close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Link>
    </div>`
);

// Remove search
cabangContent = cabangContent.replace(/<div className="store-locator__search">[\s\S]*?<\/div>\s*<div className="store-locator__list">/, '<div className="store-locator__list">');

// Remove checkboxes
cabangContent = cabangContent.replace(/<div className="store-locator__checkbox"><\/div>/g, '');

fs.writeFileSync('src/app/cabang/page.tsx', cabangContent);

// PRODUK PAGE
let produkContent = fs.readFileSync('src/app/produk/page.tsx', 'utf8');
produkContent = produkContent.replace(
  /<div className="store-locator__header">[\s\S]*?<\/div>/,
  `<div className="store-locator__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '24px', marginBottom: '24px' }}>
      <h2 style={{ fontSize: '24px', margin: 0 }}>Cari <span style={{ color: '#F5C518' }}>Produk Azuraya</span></h2>
      <Link href="/#produk" className="store-locator__close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Link>
    </div>`
);
fs.writeFileSync('src/app/produk/page.tsx', produkContent);

// DETAIL PRODUK PAGE
let detailContent = fs.readFileSync('src/app/product/[id]/page.tsx', 'utf8');
// Check if detail has a header to replace, or inject one below TemplateHeader
if (detailContent.includes('className="product-detail"')) {
  detailContent = detailContent.replace(
    /<section className="product-detail">/,
    `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '24px 8%' }}>
      <h2 style={{ fontSize: '24px', margin: 0 }}>Detail <span style={{ color: '#F5C518' }}>Produk Azuraya</span></h2>
      <Link href="/produk">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F5C518" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </Link>
    </div>
    <section className="product-detail">`
  );
}
fs.writeFileSync('src/app/product/[id]/page.tsx', detailContent);

