const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Go to vc.ru login
  console.log('Opening vc.ru...');
  await page.goto('https://vc.ru', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.screenshot({ path: '/tmp/vc-1.png' });
  console.log('Screenshot saved: /tmp/vc-1.png');
  
  // Check current state
  const title = await page.title();
  console.log('Title:', title);
  const url = page.url();
  console.log('URL:', url);
  
  await browser.close();
})();
