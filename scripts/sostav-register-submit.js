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
    
    console.log('2. Filling form...');
    await page.fill('input[name="firstName"]', 'Phoenix');
    await page.fill('input[name="lastName"]', 'Phygital');
    await page.fill('input[name="email"]', '89670933300@mail.ru');
    await page.fill('input[name="phone"]', '+7(967)093-33-00');
    await page.fill('input[name="company"]', 'Phoenix Phygital Design');
    await page.fill('input[name="position"]', 'Creative Director');
    await page.fill('input[name="site"]', 'https://t.me/phoenix_phygital');
    await page.fill('input[name="social_page"]', 'https://t.me/phoenix_phygital');
    
    const checkbox = await page.$('input[name="access_rules"]');
    if (checkbox) await checkbox.check();
    
    console.log('3. Scrolling to submit and clicking...');
    // Scroll submit button into view and click
    await page.evaluate(() => {
      const btn = document.querySelector('button[type="submit"]');
      if (btn) {
        btn.scrollIntoView();
        btn.click();
      }
    });
    
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/tmp/sostav-submit-result.png', fullPage: true });
    console.log('URL after submit:', page.url());
    
    // Check result
    const bodyText = await page.textContent('body');
    if (bodyText.includes('пароль') && bodyText.includes('выслан')) {
      console.log('✅ Password will be sent to email!');
    }
    if (bodyText.includes('Спасибо') || bodyText.includes('успеш')) {
      console.log('✅ Registration successful!');
    }
    if (bodyText.includes('уже существует') || bodyText.includes('already')) {
      console.log('⚠️ Account already exists');
    }
    
    // Look for any visible messages
    const messages = await page.$$('[class*="success"], [class*="alert"], [class*="message"], [class*="error"], [class*="notice"]');
    for (const msg of messages) {
      const t = await msg.textContent();
      if (t.trim() && t.trim().length < 200) console.log('Message:', t.trim());
    }
    
    console.log('Body (first 500):', bodyText.substring(0, 500));
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
