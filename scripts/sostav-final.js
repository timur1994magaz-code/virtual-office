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
    console.log('1. Opening sostav.ru registration...');
    await page.goto('https://www.sostav.ru/auth/register', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);
    
    // Remove ALL overlays aggressively
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        const s = getComputedStyle(el);
        if (s.position === 'fixed' && s.zIndex > 10) el.remove();
      });
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
    console.log('Form filled, checkbox checked');
    
    // Use form submit via JS
    console.log('3. Submitting form via JS...');
    const result = await page.evaluate(() => {
      const form = document.querySelector('form');
      if (form) {
        form.submit();
        return 'Form submitted';
      }
      return 'No form found';
    });
    console.log(result);
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/tmp/sostav-final.png', fullPage: true });
    console.log('URL:', page.url());
    
    const bodyText = await page.textContent('body');
    console.log('Body (first 800):', bodyText.substring(0, 800));
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/sostav-final-err.png' }).catch(() => {});
  }
  
  await browser.close();
})();
