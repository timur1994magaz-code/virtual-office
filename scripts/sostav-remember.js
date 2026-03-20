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
    await page.goto('https://www.sostav.ru/auth/remember', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Remove overlays
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        const s = getComputedStyle(el);
        if (s.position === 'fixed' && parseInt(s.zIndex) > 10) el.remove();
      });
    });
    
    const inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
    }
    
    // Fill email
    const emailInput = await page.$('input[name="email"]');
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
      });
      
      await page.waitForTimeout(5000);
      await page.screenshot({ path: '/tmp/sostav-remember.png', fullPage: true });
      console.log('URL:', page.url());
      
      const bodyText = await page.textContent('body');
      if (bodyText.includes('отправлен') || bodyText.includes('письмо') || bodyText.includes('email')) {
        console.log('✅ Password reset email sent!');
      }
      console.log('Body:', bodyText.substring(0, 300));
    } else {
      console.log('No email input found');
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
