const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Step 1: Go to vc.ru auth
  console.log('1. Opening vc.ru/auth...');
  await page.goto('https://vc.ru/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: '/tmp/vc-auth.png', fullPage: true });
  console.log('URL:', page.url());
  
  // Dump page content
  const html = await page.content();
  // Find form elements
  const emailInputs = await page.$$('input[type="email"], input[type="text"], input[name="email"], input[placeholder*="mail"], input[placeholder*="почт"]');
  console.log('Email-like inputs:', emailInputs.length);
  
  // Try clicking Войти button first
  try {
    const loginBtn = await page.$('button:has-text("Войти")');
    if (loginBtn) {
      console.log('Clicking Войти...');
      await loginBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/tmp/vc-auth2.png', fullPage: true });
      console.log('After click URL:', page.url());
      
      // Check for inputs now
      const inputs2 = await page.$$('input');
      console.log('Inputs after click:', inputs2.length);
      for (const inp of inputs2) {
        const type = await inp.getAttribute('type');
        const name = await inp.getAttribute('name');
        const placeholder = await inp.getAttribute('placeholder');
        console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
      }
      
      // Check for social login buttons
      const allBtns = await page.$$('button, a[href*="auth"]');
      for (const btn of allBtns) {
        const text = await btn.textContent();
        if (text.trim()) console.log(`  btn/link: "${text.trim().substring(0, 80)}"`);
      }
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
