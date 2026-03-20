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
    console.log('1. Opening vc.ru auth...');
    await page.goto('https://vc.ru/?modal=auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000);
    
    // Click Регистрация link
    console.log('2. Clicking Регистрация...');
    await page.click('a:has-text("Регистрация")', { force: true, timeout: 5000 });
    await page.waitForTimeout(4000);
    await page.screenshot({ path: '/tmp/vc-reg-page.png' });
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
    
    // Fill registration form
    const emailInput = await page.$('input[name="email"], input[type="email"]');
    const passInput = await page.$('input[name="password"], input[type="password"]');
    const nameInput = await page.$('input[name="name"]');
    
    if (emailInput) {
      await emailInput.fill('89670933300@mail.ru');
      console.log('Email filled');
    }
    if (passInput) {
      await passInput.fill('wwwww1994T0514wwwww');
      console.log('Password filled');
    }
    if (nameInput) {
      await nameInput.fill('Phoenix Phygital');
      console.log('Name filled');
    }
    
    await page.screenshot({ path: '/tmp/vc-reg-filled.png' });
    
    // Submit
    console.log('3. Submitting...');
    // Try pressing Enter on last filled field
    const lastField = passInput || emailInput;
    if (lastField) await lastField.press('Enter');
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/tmp/vc-reg-result.png' });
    console.log('URL after submit:', page.url());
    
    // Check result
    const bodyText = await page.textContent('body');
    const first500 = bodyText.substring(0, 500);
    console.log('Page text:', first500);
    
    // Check cookies for auth
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => c.name.includes('token') || c.name.includes('auth') || c.name.includes('session'));
    console.log('Auth cookies:', authCookies.map(c => c.name));
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/vc-reg-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
