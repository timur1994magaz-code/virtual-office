const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 2000 } });
  const page = await context.newPage();
  
  try {
    // Sostav - try password reset
    console.log('1. Sostav password reset...');
    await page.goto('https://www.sostav.ru/auth/restore', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Remove overlays
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        const s = getComputedStyle(el);
        if (s.position === 'fixed' && parseInt(s.zIndex) > 10) el.remove();
      });
    });
    
    let inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
    }
    
    // Fill email for reset
    const emailInput = await page.$('input[name="email"], input[type="email"], input[type="text"][name!="q"]');
    if (emailInput) {
      await emailInput.fill('89670933300@mail.ru');
      console.log('Email filled');
      
      // Submit
      await page.evaluate(() => {
        const forms = document.querySelectorAll('form');
        for (const form of forms) {
          if (form.querySelector('input[name="email"]')) {
            form.submit();
            return;
          }
        }
        // Try button click
        const btn = document.querySelector('button[type="submit"]');
        if (btn) btn.click();
      });
      
      await page.waitForTimeout(5000);
      console.log('URL:', page.url());
      await page.screenshot({ path: '/tmp/sostav-reset.png', fullPage: true });
      
      const bodyText = await page.textContent('body');
      console.log('Body:', bodyText.substring(0, 500));
    } else {
      console.log('No email input found on reset page');
      // Try /auth/forgot, /forgot, /restore
      for (const path of ['/auth/forgot', '/forgot-password', '/auth/password/reset']) {
        await page.goto('https://www.sostav.ru' + path, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
        await page.waitForTimeout(2000);
        const url = page.url();
        const ins = await page.$$('input');
        if (ins.length > 1) {
          console.log(`Found form at ${path}: ${ins.length} inputs`);
          break;
        }
      }
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
