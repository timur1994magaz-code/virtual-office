const { chromium } = require('playwright');
const fs = require('fs');

async function extract() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  // 1. TenderGuru — we know the URL works
  console.log('=== TenderGuru ===');
  let page = await browser.newPage();
  try {
    await page.goto('https://www.tenderguru.ru/search?kwords=%E2%E8%E4%E5%EE%F0%EE%EB%E8%EA&submit=%CD%E0%E9%F2%E8&irazd=0&tenpage=1&tenders=1', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/home/node/.openclaw/workspace/tender-agent/tg-results.png', fullPage: true });
    
    // Get full text to understand structure
    const text = await page.$eval('body', el => el.innerText);
    fs.writeFileSync('/home/node/.openclaw/workspace/tender-agent/tg-text.txt', text.substring(0, 20000));
    
    // Get HTML structure of results
    const html = await page.content();
    fs.writeFileSync('/home/node/.openclaw/workspace/tender-agent/tg-html.txt', html.substring(0, 50000));
    
    console.log('Saved text + html + screenshot');
  } catch(e) { console.error('Error:', e.message); }
  await page.close();

  // 2. Bicotender
  console.log('\n=== Bicotender ===');
  page = await browser.newPage();
  try {
    await page.goto('https://www.bicotender.ru/tender/search/?keywordsStrict=0&smartSearch=0&regionPreference=0&keywords=%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE%D1%80%D0%BE%D0%BB%D0%B8%D0%BA&submit=1', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/home/node/.openclaw/workspace/tender-agent/bico-results.png', fullPage: true });
    
    const text = await page.$eval('body', el => el.innerText);
    fs.writeFileSync('/home/node/.openclaw/workspace/tender-agent/bico-text.txt', text.substring(0, 20000));
    
    const html = await page.content();
    fs.writeFileSync('/home/node/.openclaw/workspace/tender-agent/bico-html.txt', html.substring(0, 50000));
    
    console.log('Saved text + html + screenshot');
  } catch(e) { console.error('Error:', e.message); }
  await page.close();

  // 3. Синапс — use correct input
  console.log('\n=== Синапс ===');
  page = await browser.newPage();
  try {
    await page.goto('https://synapsenet.ru', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    await page.fill('#main-input-script', 'видеоролик');
    await page.press('#main-input-script', 'Enter');
    await page.waitForTimeout(5000);
    console.log('Search URL:', page.url());
    await page.screenshot({ path: '/home/node/.openclaw/workspace/tender-agent/synapse-results.png', fullPage: true });
    
    const text = await page.$eval('body', el => el.innerText);
    fs.writeFileSync('/home/node/.openclaw/workspace/tender-agent/synapse-text.txt', text.substring(0, 20000));
    console.log('Saved');
  } catch(e) { console.error('Error:', e.message); }
  await page.close();

  await browser.close();
  console.log('\nDone!');
}

extract().catch(e => { console.error('FATAL:', e); process.exit(1); });
