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
    await page.goto('https://www.sostav.ru/auth/register', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);
    
    // Remove overlays
    await page.evaluate(() => {
      document.querySelectorAll('*').forEach(el => {
        const s = getComputedStyle(el);
        if (s.position === 'fixed' && parseInt(s.zIndex) > 10) el.remove();
      });
    });
    
    // List all forms
    const forms = await page.$$('form');
    console.log('Forms count:', forms.length);
    for (let i = 0; i < forms.length; i++) {
      const action = await forms[i].getAttribute('action');
      const method = await forms[i].getAttribute('method');
      const id = await forms[i].getAttribute('id');
      const cls = await forms[i].getAttribute('class');
      const inputs = await forms[i].$$('input');
      console.log(`Form ${i}: action=${action}, method=${method}, id=${id}, class=${cls}, inputs=${inputs.length}`);
    }
    
    // Fill the registration form (should be the one with firstName)
    await page.fill('input[name="firstName"]', 'Phoenix');
    await page.fill('input[name="lastName"]', 'Phygital');
    await page.fill('input[name="email"]', '89670933300@mail.ru');
    await page.fill('input[name="phone"]', '+7(967)093-33-00');
    await page.fill('input[name="company"]', 'Phoenix Phygital Design');
    await page.fill('input[name="position"]', 'Creative Director');
    await page.fill('input[name="site"]', 'https://t.me/phoenix_phygital');
    await page.fill('input[name="social_page"]', 'https://t.me/phoenix_phygital');
    await page.check('input[name="access_rules"]');
    
    // Submit the correct form (the one containing firstName)
    console.log('Submitting correct form...');
    const result = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      for (const form of forms) {
        if (form.querySelector('input[name="firstName"]')) {
          form.submit();
          return 'Registration form submitted! Action: ' + form.action;
        }
      }
      return 'Registration form not found';
    });
    console.log(result);
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/tmp/sostav-final2.png', fullPage: true });
    console.log('URL:', page.url());
    
    const bodyText = await page.textContent('body');
    console.log('Body:', bodyText.substring(0, 500));
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
