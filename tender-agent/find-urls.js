const { chromium } = require('playwright');
const fs = require('fs');

async function findURLs() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  
  // 1. Контур.Закупки - find correct search URL
  console.log('=== 1. Контур.Закупки ===');
  let page = await browser.newPage();
  try {
    await page.goto('https://zakupki.kontur.ru', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    const url1 = page.url();
    console.log('Main page URL:', url1);
    
    // Find search input and type
    const searchInput = await page.$('input[type="search"], input[type="text"], input[name*="search"], input[name*="query"], input[placeholder*="поиск"], input[placeholder*="Поиск"], input[placeholder*="Введите"]');
    if (searchInput) {
      await searchInput.fill('видеоролик');
      await searchInput.press('Enter');
      await page.waitForTimeout(5000);
      console.log('Search URL:', page.url());
      await page.screenshot({ path: '/home/node/.openclaw/workspace/tender-agent/kontur-search.png' });
      
      // Get page content
      const text = await page.$eval('body', el => el.innerText.substring(0, 3000));
      console.log('Body text:', text.substring(0, 500));
    } else {
      console.log('No search input found');
      // Get all inputs
      const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id })));
      console.log('All inputs:', JSON.stringify(inputs));
    }
  } catch(e) { console.error('Error:', e.message); }
  await page.close();

  // 2. Синапс - correct search URL  
  console.log('\n=== 2. Синапс ===');
  page = await browser.newPage();
  try {
    await page.goto('https://synapsenet.ru', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    console.log('Main page URL:', page.url());
    
    const searchInput = await page.$('input[type="search"], input[type="text"], input[name*="search"], input[name*="query"], input[placeholder*="поиск"], input[placeholder*="Поиск"], input[placeholder*="тендер"]');
    if (searchInput) {
      await searchInput.fill('видеоролик');
      await searchInput.press('Enter');
      await page.waitForTimeout(5000);
      console.log('Search URL:', page.url());
      await page.screenshot({ path: '/home/node/.openclaw/workspace/tender-agent/synapse-search.png' });
      const text = await page.$eval('body', el => el.innerText.substring(0, 3000));
      console.log('Body text:', text.substring(0, 500));
    } else {
      console.log('No search input found');
      const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id })));
      console.log('All inputs:', JSON.stringify(inputs));
    }
  } catch(e) { console.error('Error:', e.message); }
  await page.close();

  // 3. TenderGuru - search from homepage
  console.log('\n=== 3. TenderGuru ===');
  page = await browser.newPage();
  try {
    await page.goto('https://www.tenderguru.ru', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const searchInput = await page.$('input[type="search"], input[type="text"], input[name*="query"], input[name*="search"]');
    if (searchInput) {
      await searchInput.fill('видеоролик');
      await searchInput.press('Enter');
      await page.waitForTimeout(5000);
      console.log('Search URL:', page.url());
      await page.screenshot({ path: '/home/node/.openclaw/workspace/tender-agent/tenderguru-search.png' });
      const text = await page.$eval('body', el => el.innerText.substring(0, 3000));
      console.log('Body text:', text.substring(0, 500));
    } else {
      console.log('No search input found, trying all inputs...');
      const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id, className: e.className })));
      console.log('All inputs:', JSON.stringify(inputs.slice(0, 10)));
    }
  } catch(e) { console.error('Error:', e.message); }
  await page.close();

  // 4. Bicotender
  console.log('\n=== 4. Bicotender ===');
  page = await browser.newPage();
  try {
    await page.goto('https://bicotender.ru', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);
    
    const searchInput = await page.$('input[type="search"], input[type="text"], input[name*="query"], input[name*="search"], input[placeholder*="поиск"], input[placeholder*="Поиск"]');
    if (searchInput) {
      await searchInput.fill('видеоролик');
      await searchInput.press('Enter');
      await page.waitForTimeout(5000);
      console.log('Search URL:', page.url());
      await page.screenshot({ path: '/home/node/.openclaw/workspace/tender-agent/bico-search.png' });
      const text = await page.$eval('body', el => el.innerText.substring(0, 3000));
      console.log('Body text:', text.substring(0, 500));
    } else {
      const inputs = await page.$$eval('input', els => els.map(e => ({ type: e.type, name: e.name, placeholder: e.placeholder, id: e.id })));
      console.log('All inputs:', JSON.stringify(inputs.slice(0, 10)));
    }
  } catch(e) { console.error('Error:', e.message); }
  await page.close();

  // 5. zakupki.gov.ru
  console.log('\n=== 5. zakupki.gov.ru ===');
  page = await browser.newPage();
  try {
    await page.goto('https://zakupki.gov.ru', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    console.log('URL:', page.url());
    await page.screenshot({ path: '/home/node/.openclaw/workspace/tender-agent/zakupki-main.png' });
    const text = await page.$eval('body', el => el.innerText.substring(0, 1000));
    console.log('Body:', text.substring(0, 300));
  } catch(e) { console.error('Error:', e.message); }
  await page.close();

  await browser.close();
  console.log('\nDone!');
}

findURLs().catch(e => { console.error('FATAL:', e); process.exit(1); });
