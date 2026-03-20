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
    console.log('1. Opening sostav.ru registration...');
    await page.goto('https://www.sostav.ru/auth/register', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Remove overlays
    await page.evaluate(() => {
      document.querySelectorAll('[class*="overlay"], [class*="modal"], [class*="popup"]').forEach(el => {
        if (getComputedStyle(el).position === 'fixed') el.remove();
      });
      document.querySelectorAll('.g4fdba670').forEach(el => el.remove());
    });
    
    console.log('2. Filling registration form...');
    await page.fill('input[name="firstName"]', 'Phoenix');
    await page.fill('input[name="lastName"]', 'Phygital');
    await page.fill('input[name="email"]', '89670933300@mail.ru');
    await page.fill('input[name="phone"]', '+7(967)093-33-00');
    await page.fill('input[name="company"]', 'Phoenix Phygital Design');
    await page.fill('input[name="position"]', 'Creative Director');
    await page.fill('input[name="site"]', 'https://t.me/phoenix_phygital');
    await page.fill('input[name="social_page"]', 'https://t.me/phoenix_phygital');
    
    // Check the access rules checkbox
    const checkbox = await page.$('input[name="access_rules"]');
    if (checkbox) {
      await checkbox.check();
      console.log('Checkbox checked');
    }
    
    await page.screenshot({ path: '/tmp/sostav-reg-filled.png' });
    console.log('Form filled!');
    
    // Find and click submit button
    const btns = await page.$$('button, input[type="submit"]');
    for (const btn of btns) {
      const text = await btn.textContent().catch(() => '');
      const type = await btn.getAttribute('type');
      if (text.trim() && text.trim().length < 50) console.log(`  button: "${text.trim()}" type=${type}`);
    }
    
    // Click register/submit
    const submitBtn = await page.$('button[type="submit"], input[type="submit"], button:has-text("Зарегистрироваться"), button:has-text("Регистрация"), button:has-text("Создать")');
    if (submitBtn) {
      const btnText = await submitBtn.textContent().catch(() => 'submit');
      console.log('3. Clicking submit:', btnText.trim());
      await submitBtn.click();
      await page.waitForTimeout(8000);
      await page.screenshot({ path: '/tmp/sostav-reg-result.png' });
      console.log('URL after submit:', page.url());
      
      // Check result
      const bodyText = await page.textContent('body');
      if (bodyText.includes('подтверд') || bodyText.includes('письмо') || bodyText.includes('успеш') || bodyText.includes('Спасибо')) {
        console.log('✅ Registration submitted!');
      }
      if (bodyText.includes('ошиб') || bodyText.includes('Error') || bodyText.includes('error')) {
        console.log('❌ Error detected');
        // Find error text
        const errors = await page.$$('[class*="error"], [class*="alert"], .text-danger');
        for (const err of errors) {
          const t = await err.textContent();
          if (t.trim()) console.log('  Error:', t.trim().substring(0, 100));
        }
      }
      
      console.log('Body (first 300):', bodyText.substring(0, 300));
    } else {
      console.log('Submit button not found');
    }
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/sostav-reg-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
