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
    
    // List all forms
    const forms = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('form')).map((f, i) => ({
        index: i,
        action: f.action,
        method: f.method,
        id: f.id,
        inputs: Array.from(f.querySelectorAll('input')).map(inp => inp.name).filter(Boolean)
      }));
    });
    console.log('Forms:', JSON.stringify(forms, null, 2));
    
    console.log('\n2. Filling registration form...');
    await page.fill('input[name="firstName"]', 'Phoenix');
    await page.fill('input[name="lastName"]', 'Phygital');
    await page.fill('input[name="email"]', '89670933300@mail.ru');
    await page.fill('input[name="phone"]', '+7(967)093-33-00');
    await page.fill('input[name="company"]', 'Phoenix Phygital Design');
    await page.fill('input[name="position"]', 'Creative Director');
    await page.fill('input[name="site"]', 'https://t.me/phoenix_phygital');
    await page.fill('input[name="social_page"]', 'https://t.me/phoenix_phygital');
    await page.check('input[name="access_rules"]');
    
    console.log('3. Submitting registration form...');
    // Submit the correct form (the one with firstName field)
    const result = await page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      for (const f of forms) {
        if (f.querySelector('input[name="firstName"]')) {
          f.submit();
          return 'Registration form submitted!';
        }
      }
      return 'Registration form not found';
    });
    console.log(result);
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/tmp/sostav-final.png' });
    console.log('URL:', page.url());
    
    const bodyText = await page.textContent('body');
    const successIndicators = ['пароль', 'подтвер', 'письмо', 'отправ', 'успеш', 'Спасибо', 'зарегистрир'];
    for (const indicator of successIndicators) {
      if (bodyText.toLowerCase().includes(indicator)) {
        console.log(`✅ Found "${indicator}"`);
      }
    }
    console.log('Body:', bodyText.substring(0, 300));
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
