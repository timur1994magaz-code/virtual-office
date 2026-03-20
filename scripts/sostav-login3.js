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
    console.log('1. Opening sostav.ru...');
    await page.goto('https://www.sostav.ru', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Close any overlays/banners
    console.log('2. Closing overlays...');
    try {
      // Try clicking common close buttons
      await page.evaluate(() => {
        // Remove any blocking overlays
        document.querySelectorAll('[class*="overlay"], [class*="modal"], [class*="popup"], [class*="banner"], [class*="cookie"]').forEach(el => {
          if (el.style) el.style.display = 'none';
        });
        // Also try g4fdba670 class
        document.querySelectorAll('.g4fdba670').forEach(el => el.remove());
      });
      await page.waitForTimeout(1000);
    } catch(e) {}
    
    console.log('3. Clicking "Войти" with force...');
    await page.click('text=Войти', { force: true, timeout: 5000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/sostav-after-click.png' });
    
    // Check inputs
    const inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
    }
    
    // Fill email/pass if found
    const emailInput = await page.$('input[type="email"], input[name="email"], input[name="login"], input[placeholder*="mail"]');
    const passInput = await page.$('input[type="password"]');
    
    if (emailInput && passInput) {
      console.log('\n4. Filling credentials...');
      await emailInput.fill('timur1994magaz@gmail.com');
      await passInput.fill('jR4Cwbao');
      await passInput.press('Enter');
      await page.waitForTimeout(5000);
      console.log('URL:', page.url());
      await page.screenshot({ path: '/tmp/sostav-loggedin.png' });
      
      // Go to blogs
      console.log('\n5. Going to blogs...');
      await page.goto('https://www.sostav.ru/blogs', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/tmp/sostav-blogs.png' });
      console.log('Blogs URL:', page.url());
      
      const bodyText = await page.textContent('body');
      console.log('First 500:', bodyText.substring(0, 500));
    } else {
      console.log('No email/pass inputs found');
    }
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/sostav-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
