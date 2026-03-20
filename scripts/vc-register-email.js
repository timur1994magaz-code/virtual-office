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
    console.log('1. Opening vc.ru signup...');
    await page.goto('https://vc.ru/?modal=auth/signup', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000);
    
    // Close Yandex popup if exists
    try {
      await page.evaluate(() => {
        document.querySelectorAll('[class*="yandex"], [class*="suggest"]').forEach(el => el.remove());
      });
    } catch(e) {}
    
    // Click "Почта" on signup page
    console.log('2. Clicking "Почта" on signup...');
    const emailBtns = await page.$$('text=Почта');
    console.log('Found "Почта" buttons:', emailBtns.length);
    if (emailBtns.length > 0) {
      // Click the last one (likely in modal)
      await emailBtns[emailBtns.length - 1].click({ force: true });
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/tmp/vc-signup-email.png' });
      console.log('URL:', page.url());
      
      // Find inputs
      const inputs = await page.$$('input');
      console.log('Inputs:', inputs.length);
      for (const inp of inputs) {
        const type = await inp.getAttribute('type');
        const name = await inp.getAttribute('name');
        const placeholder = await inp.getAttribute('placeholder');
        console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
      }
      
      // Fill
      const emailInput = await page.$('input[name="email"], input[type="email"], input[placeholder*="Почта"], input[placeholder*="mail"]');
      const passInput = await page.$('input[name="password"], input[type="password"]');
      const nameInput = await page.$('input[name="name"], input[placeholder*="Имя"], input[placeholder*="имя"]');
      
      if (emailInput) {
        await emailInput.fill('89670933300@mail.ru');
        console.log('✅ Email filled');
      }
      if (passInput) {
        await passInput.fill('wwwww1994T0514wwwww');
        console.log('✅ Password filled');
      }
      if (nameInput) {
        await nameInput.fill('Phoenix Phygital');
        console.log('✅ Name filled');
      }
      
      await page.screenshot({ path: '/tmp/vc-signup-filled.png' });
      
      // Look for submit button
      const allBtns = await page.$$('button');
      for (const btn of allBtns) {
        const text = await btn.textContent();
        const t = text.trim();
        if (t && (t.includes('Зарег') || t.includes('Создать') || t.includes('Продолжить') || t.includes('Sign') || t.includes('Submit') || t.includes('Далее'))) {
          console.log('Submit button found:', t);
          await btn.click();
          break;
        }
      }
      
      // Also try Enter
      if (passInput) await passInput.press('Enter');
      
      await page.waitForTimeout(8000);
      await page.screenshot({ path: '/tmp/vc-signup-result.png' });
      console.log('Result URL:', page.url());
      
      const cookies = await context.cookies();
      const authCookies = cookies.filter(c => c.name.includes('auth') || c.name.includes('token'));
      console.log('Auth cookies:', authCookies.map(c => c.name));
      
    }
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/vc-signup-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
