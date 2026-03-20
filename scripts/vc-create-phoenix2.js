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
    
    console.log('2. Clicking "Почта"...');
    await page.click('text=Почта', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    console.log('3. Filling credentials...');
    await page.fill('input[name="email"]', 'timur1994magaz@gmail.com');
    await page.fill('input[name="password"]', 'wwwww1994T0514wwwww');
    
    console.log('4. Submitting...');
    // Press Enter to submit
    await page.press('input[name="password"]', 'Enter');
    await page.waitForTimeout(8000);
    await page.screenshot({ path: '/tmp/vc-login-result.png' });
    console.log('URL:', page.url());
    
    // Check login state
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => c.name.includes('token') || c.name.includes('auth') || c.name.includes('session'));
    console.log('Auth cookies:', authCookies.map(c => c.name));
    
    // Save all cookies
    const fs = require('fs');
    fs.writeFileSync('/tmp/vc-cookies.json', JSON.stringify(cookies, null, 2));
    console.log('Total cookies saved:', cookies.length);
    
    // Navigate to account
    console.log('\n5. Going to account page...');
    await page.goto('https://vc.ru/account', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    console.log('Account URL:', page.url());
    await page.screenshot({ path: '/tmp/vc-account.png' });
    
    // Check if we see user info
    const pageText = await page.textContent('body');
    if (pageText.includes('timur') || pageText.includes('Тимур') || pageText.includes('Настройки')) {
      console.log('✅ Logged in!');
      
      // Now try to create a subsite (blog)
      console.log('\n6. Looking for blog creation...');
      await page.goto('https://vc.ru/new_subsite', { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      console.log('New subsite URL:', page.url());
      await page.screenshot({ path: '/tmp/vc-new-subsite.png' });
    } else {
      console.log('❌ Not logged in or different page');
      // Show first 500 chars
      console.log('Page text:', pageText.substring(0, 500));
    }
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/vc-error.png' });
  }
  
  await browser.close();
})();
