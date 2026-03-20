const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Step 1: Go to vc.ru login
  console.log('1. Opening vc.ru login...');
  await page.goto('https://vc.ru/auth/simple', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/vc-login.png', fullPage: true });
  console.log('Login page screenshot: /tmp/vc-login.png');
  console.log('URL:', page.url());
  
  // Look for email input
  const inputs = await page.$$('input');
  console.log('Found inputs:', inputs.length);
  for (const inp of inputs) {
    const type = await inp.getAttribute('type');
    const name = await inp.getAttribute('name');
    const placeholder = await inp.getAttribute('placeholder');
    console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
  }
  
  // Look for all buttons
  const buttons = await page.$$('button');
  for (const btn of buttons) {
    const text = await btn.textContent();
    console.log(`  button: "${text.trim()}"`);
  }
  
  // Look for links
  const links = await page.$$('a');
  for (const link of links.slice(0, 20)) {
    const href = await link.getAttribute('href');
    const text = await link.textContent();
    if (text.trim()) console.log(`  link: "${text.trim()}" → ${href}`);
  }
  
  await browser.close();
})();
