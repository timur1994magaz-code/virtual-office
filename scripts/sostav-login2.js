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
    
    console.log('2. Clicking "Войти"...');
    await page.click('text=Войти', { timeout: 10000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/sostav-modal.png' });
    
    // Look for inputs now
    const inputs = await page.$$('input');
    console.log('Inputs after click:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      const id = await inp.getAttribute('id');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`);
    }
    
    // Try to fill email and password
    const emailInput = await page.$('input[type="email"], input[name="email"], input[name="login"], input[placeholder*="mail"], input[placeholder*="Почта"], input[placeholder*="логин"], input[placeholder*="Логин"]');
    const passInput = await page.$('input[type="password"]');
    
    if (emailInput && passInput) {
      console.log('\n3. Filling credentials...');
      await emailInput.fill('timur1994magaz@gmail.com');
      await passInput.fill('jR4Cwbao');
      
      console.log('4. Submitting...');
      await passInput.press('Enter');
      await page.waitForTimeout(5000);
      await page.screenshot({ path: '/tmp/sostav-after-login.png' });
      console.log('URL:', page.url());
      
      // Check page
      const body = await page.textContent('body');
      console.log('Logged in check:', body.includes('Выйти') || body.includes('Профиль') || body.includes('Мой блог'));
    } else {
      console.log('Inputs not found, looking at what appeared...');
      // Check all visible elements
      const allVisible = await page.$$('input, button, a[href*="auth"], [class*="modal"]');
      for (const el of allVisible) {
        const tag = await el.evaluate(e => e.tagName);
        const text = await el.textContent().catch(() => '');
        const type = await el.getAttribute('type').catch(() => '');
        if (text.trim() && text.trim().length < 50) console.log(`  ${tag}: "${text.trim()}" type=${type}`);
      }
    }
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/sostav-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
