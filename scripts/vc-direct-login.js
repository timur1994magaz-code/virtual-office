const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Try direct password auth on vc.ru
  console.log('1. Trying email login on vc.ru...');
  
  // vc.ru has email auth at /auth/email
  await page.goto('https://vc.ru/auth/email', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  await page.screenshot({ path: '/tmp/vc-email-auth.png', fullPage: true });
  
  // Check all inputs
  const inputs = await page.$$('input');
  console.log('Inputs:', inputs.length);
  for (const inp of inputs) {
    const type = await inp.getAttribute('type');
    const name = await inp.getAttribute('name');
    const placeholder = await inp.getAttribute('placeholder');
    console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
  }
  
  // Try /auth/simple 
  console.log('\n2. Trying /auth/simple...');
  await page.goto('https://vc.ru/auth/simple', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('URL:', page.url());
  
  const inputs2 = await page.$$('input');
  console.log('Inputs:', inputs2.length);
  for (const inp of inputs2) {
    const type = await inp.getAttribute('type');
    const name = await inp.getAttribute('name');
    const placeholder = await inp.getAttribute('placeholder');
    console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
  }
  
  // Look for any email/password fields in all frames
  for (const frame of page.frames()) {
    const frameInputs = await frame.$$('input');
    if (frameInputs.length > 0) {
      console.log(`\nFrame ${frame.url().substring(0, 60)} has ${frameInputs.length} inputs`);
      for (const inp of frameInputs) {
        const type = await inp.getAttribute('type');
        const name = await inp.getAttribute('name');
        const placeholder = await inp.getAttribute('placeholder');
        console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
      }
    }
  }
  
  await browser.close();
})();
