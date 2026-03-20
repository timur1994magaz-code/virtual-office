const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    console.log('1. Opening mail.ru login...');
    await page.goto('https://account.mail.ru/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Fill email
    await page.fill('input[type="text"]', '89670933300@mail.ru');
    console.log('Email filled');
    
    // Submit email step
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: '/tmp/mailru-step1.png' });
    console.log('After email URL:', page.url());
    
    // Now look for password or other auth
    const inputs = await page.$$('input');
    console.log('Inputs after email:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
    }
    
    const btns = await page.$$('button');
    for (const b of btns) {
      const t = await b.textContent();
      if (t.trim() && t.trim().length < 50) console.log(`  btn: "${t.trim()}"`);
    }
    
    // Try password
    const passInput = await page.$('input[type="password"]');
    if (passInput) {
      console.log('2. Password field found, filling...');
      await passInput.fill('wwwww1994T0514wwwww');
      await passInput.press('Enter');
      await page.waitForTimeout(5000);
      console.log('After password URL:', page.url());
    } else {
      // Maybe it asks for phone or other method
      console.log('No password field. Checking page...');
      const bodyText = await page.textContent('body');
      console.log('Page text:', bodyText.substring(0, 500));
    }
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/mailru-error2.png' }).catch(() => {});
  }
  
  await browser.close();
})();
