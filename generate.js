const fs = require('fs');
let html = fs.readFileSync('E:\\Nabil Nur Fauzan\\Belajar Ngoding\\Akasa-Demo\\Template Azuraya\\index.html', 'utf8');
let mainMatch = html.match(/<main>([\s\S]*?)<\/main>/);
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
  
  // Replace google maps image with iframe
  main = main.replace(
    /<img src="\/images\/google-maps.png"[^>]*\/>/g,
    `<iframe 
                src={gmapsUrl} 
                className="absolute inset-0 w-full h-full border-0 rounded-2xl"
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>`
  );
  
  // Also we need to wrap the main content correctly for page.tsx
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
        ${main}
      </main>
    </>
  );
}
`;
  
  fs.writeFileSync('src/app/page.tsx', pageContent);
}
