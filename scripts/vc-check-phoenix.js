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
    // Login to vc.ru with Phoenix account
    console.log('1. Logging in to vc.ru as Phoenix...');
    await page.goto('https://vc.ru/?modal=auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000);
    await page.click('text=Почта', { timeout: 10000 });
    await page.waitForTimeout(3000);
    await page.fill('input[name="email"]', '89670933300@mail.ru');
    await page.fill('input[name="password"]', 'wwwww1994T0514wwwww');
    await page.press('input[name="password"]', 'Enter');
    await page.waitForTimeout(8000);
    
    const cookies = await context.cookies();
    const authCookies = cookies.filter(c => c.name.includes('auth') || c.name.includes('token'));
    console.log('Auth cookies:', authCookies.map(c => c.name));
    
    if (authCookies.length > 0) {
      console.log('✅ Logged in to vc.ru as Phoenix!');
      
      // Go to profile/settings
      await page.goto('https://vc.ru/account', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      console.log('Account URL:', page.url());
      
      // Get profile info
      const bodyText = await page.textContent('body');
      if (bodyText.includes('Phoenix')) {
        console.log('✅ Phoenix profile confirmed!');
      }
      console.log('Body:', bodyText.substring(0, 300));
      
      // Save cookies for future use
      const fs = require('fs');
      fs.writeFileSync('/tmp/vc-phoenix-cookies.json', JSON.stringify(cookies, null, 2));
      console.log('Cookies saved');
      
    } else {
      console.log('❌ Login failed');
      await page.screenshot({ path: '/tmp/vc-phoenix-fail.png' });
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
