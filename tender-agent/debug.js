const { chromium } = require('playwright');
const fs = require('fs');

async function debug() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  // Test Kontour Zakupki
  console.log('=== Контур.Закупки ===');
  try {
    await page.goto('https://zakupki.kontur.ru/Search?Query=%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE%D1%80%D0%BE%D0%BB%D0%B8%D0%BA&OnlyActive=true', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/kontur.png', fullPage: false });
    const html = await page.content();
    fs.writeFileSync('/tmp/kontur.html', html.substring(0, 50000));
    console.log('Screenshot + HTML saved');
    
    // Try to find any list items
    const allLinks = await page.$$eval('a', els => els.slice(0, 50).map(e => ({ text: e.textContent?.trim().substring(0, 100), href: e.href })));
    console.log('Links found:', allLinks.length);
    const relevant = allLinks.filter(l => l.text && (l.text.includes('видео') || l.text.includes('ролик') || l.text.includes('закупк')));
    console.log('Relevant links:', JSON.stringify(relevant.slice(0, 10), null, 2));
  } catch(e) { console.error('Error:', e.message); }

  // Test Synapsenet
  console.log('\n=== Синапс ===');
  try {
    await page.goto('https://synapsenet.ru/zakupki/search/%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE%D1%80%D0%BE%D0%BB%D0%B8%D0%BA', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/synapse.png', fullPage: false });
    const bodyText = await page.$eval('body', el => el.textContent?.substring(0, 5000));
    console.log('Body text preview:', bodyText?.substring(0, 500));
  } catch(e) { console.error('Error:', e.message); }

  // Test TenderGuru
  console.log('\n=== TenderGuru ===');
  try {
    await page.goto('https://www.tenderguru.ru/search?query=%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE%D1%80%D0%BE%D0%BB%D0%B8%D0%BA', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/tenderguru.png', fullPage: false });
    const bodyText = await page.$eval('body', el => el.textContent?.substring(0, 5000));
    console.log('Body text preview:', bodyText?.substring(0, 500));
  } catch(e) { console.error('Error:', e.message); }

  // Test Bicotender  
  console.log('\n=== Bicotender ===');
  try {
    await page.goto('https://bicotender.ru/trade/all/?search=%D0%B2%D0%B8%D0%B4%D0%B5%D0%BE%D1%80%D0%BE%D0%BB%D0%B8%D0%BA', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/bicotender.png', fullPage: false });
    const bodyText = await page.$eval('body', el => el.textContent?.substring(0, 5000));
    console.log('Body text preview:', bodyText?.substring(0, 500));
  } catch(e) { console.error('Error:', e.message); }

  await browser.close();
  console.log('\nDone! Check /tmp/*.png');
}

debug().catch(e => { console.error('FATAL:', e); process.exit(1); });
