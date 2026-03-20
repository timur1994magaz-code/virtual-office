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
    // Try direct registration URL
    console.log('1. Trying sostav.ru/register...');
    await page.goto('https://www.sostav.ru/register', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    console.log('URL:', page.url());
    
    let inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
    }
    
    // Try /registration
    console.log('\n2. Trying /registration...');
    await page.goto('https://www.sostav.ru/registration', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    console.log('URL:', page.url());
    
    inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      console.log(`  input: type=${type}, name=${name}`);
    }
    
    // Try /signup
    console.log('\n3. Trying /signup...');
    await page.goto('https://www.sostav.ru/signup', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    console.log('URL:', page.url());
    
    // Try /auth/register
    console.log('\n4. Trying /auth/register...');
    await page.goto('https://www.sostav.ru/auth/register', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    console.log('URL:', page.url());
    
    inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
    }
    
    await page.screenshot({ path: '/tmp/sostav-register-page.png' });
    
    // Check body for registration form
    const bodyText = await page.textContent('body');
    console.log('\nPage text (first 500):', bodyText.substring(0, 500));
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
