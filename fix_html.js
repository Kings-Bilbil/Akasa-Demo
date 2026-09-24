const fs = require('fs');
const cheerio = require('cheerio');

let html = fs.readFileSync('E:\\Nabil Nur Fauzan\\Belajar Ngoding\\Akasa-Demo\\Template Azuraya\\index.html', 'utf8');

// Load HTML using cheerio (this automatically fixes mismatched tags!)
const $ = cheerio.load(html, { xmlMode: false, decodeEntities: false });

// Get the main element's inner HTML (which is now perfectly balanced)
let mainHTML = $('main').html();

// Now do the JSX conversions
mainHTML = mainHTML.replace(/class=/g, 'className=');
mainHTML = mainHTML.replace(/<!--([\s\S]*?)-->/g, '{/* $1 */}');
mainHTML = mainHTML.replace(/<img([^>]*?)>/g, '<img$1 />');
mainHTML = mainHTML.replace(/<br>/g, '<br />');
mainHTML = mainHTML.replace(/<hr>/g, '<hr />');
mainHTML = mainHTML.replace(/<input([^>]*?)>/g, '<input$1 />');
mainHTML = mainHTML.replace(/style="([^"]*)"/g, '');
mainHTML = mainHTML.replace(/stroke-width/g, 'strokeWidth');
mainHTML = mainHTML.replace(/stroke-linecap/g, 'strokeLinecap');
mainHTML = mainHTML.replace(/stroke-linejoin/g, 'strokeLinejoin');
mainHTML = mainHTML.replace(/fill-rule/g, 'fillRule');
mainHTML = mainHTML.replace(/clip-rule/g, 'clipRule');
mainHTML = mainHTML.replace(/src="images\//g, 'src="/images/');
mainHTML = mainHTML.replace(/src='images\//g, 'src=\'/images/');
mainHTML = mainHTML.replace(/url\('?images\//g, 'url(\'/images/');

// Replace SVG paths/circles/lines if they are missing closing tags (Cheerio might have expanded them or kept them)
// Since cheerio output might not be strictly XML, let's load it in XML mode to enforce self-closing tags
const xmlOpts = { xmlMode: true, decodeEntities: false };
const $xml = cheerio.load(mainHTML, xmlOpts);

// The problem with XML mode is it might close <div /> if empty, which JSX supports!
let jsxHTML = $xml.html();

// Replace Google Maps image with iframe
jsxHTML = jsxHTML.replace(
  /<img src="\/images\/google-maps\.png"[^>]*\/>/g,
  `<iframe 
              src={gmapsUrl} 
              className="absolute inset-0 w-full h-full border-0 rounded-2xl"
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>`
);

let pageContent = `import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';
import TemplateHeader from '@/components/TemplateHeader';

export default async function Home() {
  const supabase = await createClient();
  const { data: gmapsData } = await supabase.from('settings').select('value').eq('key', 'gmaps_iframe_url').single();
  const gmapsUrl = gmapsData?.value || "https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d1020084.7176140683!2d109.19199321307527!3d0.32924157053039146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sid!4v1716382023912!5m2!1sen!2sid";

  return (
    <>
      <TemplateHeader />
      <main>
        ${jsxHTML}
      </main>
    </>
  );
}
`;
  
fs.writeFileSync('src/app/page.tsx', pageContent);
