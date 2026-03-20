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
    console.log('1. Opening sostav.ru login...');
    await page.goto('https://www.sostav.ru/auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('URL:', page.url());
    await page.screenshot({ path: '/tmp/sostav-login.png' });
    
    // Look for inputs
    const inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
    }
    
    // Try filling
    const emailInput = await page.$('input[name="email"], input[type="email"], input[name="login"]');
    const passInput = await page.$('input[type="password"]');
    
    if (emailInput && passInput) {
      console.log('\n2. Filling credentials...');
      await emailInput.fill('timur1994magaz@gmail.com');
      await passInput.fill('jR4Cwbao');
      await page.screenshot({ path: '/tmp/sostav-filled.png' });
      
      // Submit
      console.log('3. Submitting...');
      await passInput.press('Enter');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: '/tmp/sostav-after-login.png' });
      console.log('URL after login:', page.url());
      
      // Check if logged in
      const bodyText = await page.textContent('body');
      console.log('Page text (first 500):', bodyText.substring(0, 500));
    } else {
      console.log('Email or password input not found');
      // Search for all forms/links
      const links = await page.$$('a');
      for (const link of links) {
        const text = await link.textContent();
        const href = await link.getAttribute('href');
        if (text.trim() && text.trim().length < 40) {
          console.log(`  link: "${text.trim()}" → ${href}`);
        }
      }
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
