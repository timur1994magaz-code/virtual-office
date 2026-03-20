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
    console.log('1. Opening registration...');
    await page.goto('https://www.sostav.ru/auth/register', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Remove overlays
    await page.evaluate(() => {
      document.querySelectorAll('[style*="position: fixed"], [style*="position:fixed"]').forEach(el => el.remove());
      document.querySelectorAll('.g4fdba670').forEach(el => el.remove());
    });
    await page.waitForTimeout(500);
    
    console.log('2. Filling form...');
    await page.fill('input[name="firstName"]', 'Phoenix');
    await page.fill('input[name="lastName"]', 'Phygital');
    await page.fill('input[name="email"]', '89670933300@mail.ru');
    await page.fill('input[name="phone"]', '+7(967)093-33-00');
    await page.fill('input[name="company"]', 'Phoenix Phygital Design');
    await page.fill('input[name="position"]', 'Creative Director');
    await page.fill('input[name="site"]', 'https://t.me/phoenix_phygital');
    await page.fill('input[name="social_page"]', 'https://t.me/phoenix_phygital');
    await page.check('input[name="access_rules"]');
    
    console.log('3. Submitting form via JS...');
    await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.submit();
        return 'Form submitted';
      }
      // Try button click
      const btn = document.querySelector('button[type="submit"]');
      if (btn) {
        btn.click();
        return 'Button clicked';
      }
      return 'No form or button found';
    });
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/tmp/sostav-submitted.png' });
    console.log('URL after submit:', page.url());
    
    const bodyText = await page.textContent('body');
    // Check for success indicators
    const successIndicators = ['пароль', 'подтвер', 'письмо', 'отправ', 'успеш', 'Спасибо', 'зарегистрир'];
    for (const indicator of successIndicators) {
      if (bodyText.toLowerCase().includes(indicator)) {
        console.log(`✅ Found "${indicator}" in page`);
      }
    }
    
    console.log('Body (first 500):', bodyText.substring(0, 500));
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/sostav-submit-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
