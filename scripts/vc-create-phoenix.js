const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Step 1: Login
  console.log('1. Opening vc.ru auth...');
  await page.goto('https://vc.ru/?modal=auth', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  console.log('2. Clicking "Почта"...');
  await page.click('text=Почта');
  await page.waitForTimeout(3000);
  
  console.log('3. Filling email and password...');
  await page.fill('input[name="email"]', 'timur1994magaz@gmail.com');
  await page.fill('input[name="password"]', 'wwwww1994T0514wwwww');
  await page.screenshot({ path: '/tmp/vc-filled.png' });
  
  console.log('4. Clicking Войти...');
  // Find the login submit button inside the auth modal
  const loginBtns = await page.$$('button:has-text("Войти")');
  console.log('Found Войти buttons:', loginBtns.length);
  // Click the last one (likely in modal)
  if (loginBtns.length > 0) {
    await loginBtns[loginBtns.length - 1].click();
  }
  await page.waitForTimeout(5000);
  await page.screenshot({ path: '/tmp/vc-after-login.png' });
  console.log('URL after login:', page.url());
  
  // Check if logged in - look for user menu
  const userElements = await page.$$('[class*="user"], [class*="profile"], [class*="avatar"]');
  console.log('User elements found:', userElements.length);
  
  // Save cookies for reuse
  const cookies = await context.cookies();
  const fs = require('fs');
  fs.writeFileSync('/tmp/vc-cookies.json', JSON.stringify(cookies, null, 2));
  console.log('Cookies saved:', cookies.length);
  
  // Check page state
  const bodyText = await page.textContent('body');
  if (bodyText.includes('Выйти') || bodyText.includes('Профиль') || bodyText.includes('Настройки')) {
    console.log('✅ Logged in successfully!');
  } else {
    console.log('Login status unclear, checking...');
    // Look for error messages
    const errors = await page.$$('[class*="error"], [class*="alert"]');
    for (const err of errors) {
      const text = await err.textContent();
      if (text.trim()) console.log('  Error:', text.trim().substring(0, 100));
    }
  }
  
  // Try to navigate to profile/blog settings
  console.log('\n5. Checking account...');
  await page.goto('https://vc.ru/account', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  console.log('Account URL:', page.url());
  await page.screenshot({ path: '/tmp/vc-account.png' });
  
  await browser.close();
})();
