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
    console.log('1. Opening mail.ru...');
    await page.goto('https://mail.ru', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Find all inputs and buttons
    const inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      const id = await inp.getAttribute('id');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`);
    }
    
    // Check all frames
    for (const frame of page.frames()) {
      if (frame.url() === 'about:blank') continue;
      const frameInputs = await frame.$$('input').catch(() => []);
      if (frameInputs.length > 0) {
        console.log(`\nFrame ${frame.url().substring(0, 80)}: ${frameInputs.length} inputs`);
        for (const inp of frameInputs) {
          const type = await inp.getAttribute('type');
          const name = await inp.getAttribute('name');
          const id = await inp.getAttribute('id');
          console.log(`  input: type=${type}, name=${name}, id=${id}`);
        }
      }
    }
    
    // Try the login form on mail.ru main page
    const loginInput = await page.$('#mailbox\\:login, input[name="login"], input[id*="login"]');
    if (loginInput) {
      console.log('\n2. Found login input, filling...');
      await loginInput.fill('89670933300');
      
      // Click Войти
      const loginBtn = await page.$('button:has-text("Войти"), input[type="submit"], button[type="submit"]');
      if (loginBtn) {
        await loginBtn.click();
        await page.waitForTimeout(3000);
      }
      await page.screenshot({ path: '/tmp/mailru-step1.png' });
      console.log('After step1 URL:', page.url());
      
      // Check for password
      const passInput = await page.$('input[type="password"]');
      if (passInput) {
        console.log('3. Filling password...');
        await passInput.fill('wwwww1994T0514wwwww');
        await passInput.press('Enter');
        await page.waitForTimeout(5000);
        console.log('After login URL:', page.url());
        await page.screenshot({ path: '/tmp/mailru-loggedin.png' });
      }
    } else {
      console.log('Login input not found on main page');
      await page.screenshot({ path: '/tmp/mailru-main.png' });
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
