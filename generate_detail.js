const fs = require('fs');
let html = fs.readFileSync('E:\\Nabil Nur Fauzan\\Belajar Ngoding\\Akasa-Demo\\Template Azuraya\\detail-produk.html', 'utf8');
let mainMatch = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/);
if (mainMatch) {
  let main = mainMatch[1];
  main = main.replace(/class=/g, 'className=');
  main = main.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
  main = main.replace(/<img([^>]*?)>/g, '<img$1 />');
  main = main.replace(/<br>/g, '<br />');
  main = main.replace(/<hr>/g, '<hr />');
  main = main.replace(/<input([^>]*?)>/g, '<input$1 />');
  main = main.replace(/style="([^"]*)"/g, '');
  main = main.replace(/stroke-width/g, 'strokeWidth');
  main = main.replace(/stroke-linecap/g, 'strokeLinecap');
  main = main.replace(/fill-rule/g, 'fillRule');
  main = main.replace(/clip-rule/g, 'clipRule');
  main = main.replace(/src="images\//g, 'src="/images/');
  fs.writeFileSync('temp-detail.jsx', main);
}
