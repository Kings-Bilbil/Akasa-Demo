const fs = require('fs');
const cheerio = require('cheerio');

let html = fs.readFileSync('E:\\Nabil Nur Fauzan\\Belajar Ngoding\\Akasa-Demo\\Template Azuraya\\index.html', 'utf8');
const $ = cheerio.load(html, { xmlMode: false, decodeEntities: false });

let footerHTML = $('footer').parent().html() || $('footer').prop('outerHTML') || '';
if (!footerHTML && $('footer').length) {
    footerHTML = $.html($('footer'));
}

// Convert HTML to JSX
footerHTML = footerHTML.replace(/class=/g, 'className=');
footerHTML = footerHTML.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
footerHTML = footerHTML.replace(/<img([^>]*?)>/g, '<img$1 />');
footerHTML = footerHTML.replace(/<br>/g, '<br />');
footerHTML = footerHTML.replace(/<hr>/g, '<hr />');
footerHTML = footerHTML.replace(/<input([^>]*?)>/g, '<input$1 />');
footerHTML = footerHTML.replace(/style="([^"]*)"/g, '');
footerHTML = footerHTML.replace(/stroke-width/g, 'strokeWidth');
footerHTML = footerHTML.replace(/stroke-linecap/g, 'strokeLinecap');
footerHTML = footerHTML.replace(/stroke-linejoin/g, 'strokeLinejoin');
footerHTML = footerHTML.replace(/fill-rule/g, 'fillRule');
footerHTML = footerHTML.replace(/clip-rule/g, 'clipRule');
footerHTML = footerHTML.replace(/src="images\//g, 'src="/images/');
footerHTML = footerHTML.replace(/src='images\//g, 'src=\'/images/');
footerHTML = footerHTML.replace(/url\('?images\//g, 'url(\'/images/');

// Ensure self closing tags
const xmlOpts = { xmlMode: true, decodeEntities: false };
const $xml = cheerio.load(footerHTML, xmlOpts);
let jsxFooter = $xml.html();

let pageContent = fs.readFileSync('src/app/page.tsx', 'utf8');
// Insert before </main> or after </main> depending on layout. Wait, I'll just put it after </main>.
pageContent = pageContent.replace('</main>', '</main>\n' + jsxFooter);
fs.writeFileSync('src/app/page.tsx', pageContent);
