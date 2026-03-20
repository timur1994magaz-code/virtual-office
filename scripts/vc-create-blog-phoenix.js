const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Login first
    console.log('1. Logging in...');
    await page.goto('https://vc.ru/?modal=auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(6000);
    await page.click('text=Почта', { timeout: 10000 });
    await page.waitForTimeout(3000);
    await page.fill('input[name="email"]', 'timur1994magaz@gmail.com');
    await page.fill('input[name="password"]', 'wwwww1994T0514wwwww');
    await page.press('input[name="password"]', 'Enter');
    await page.waitForTimeout(8000);
    console.log('Logged in, URL:', page.url());
    
    // Go to new subsite page
    console.log('\n2. Going to new_subsite...');
    await page.goto('https://vc.ru/new_subsite', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/vc-new-subsite.png' });
    console.log('URL:', page.url());
    
    // Find all inputs and textareas
    const inputs = await page.$$('input, textarea');
    console.log('Inputs/textareas:', inputs.length);
    for (const inp of inputs) {
      const tag = await inp.evaluate(el => el.tagName);
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      const id = await inp.getAttribute('id');
      console.log(`  ${tag}: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`);
    }
    
    // Look for buttons
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent();
      const t = text.trim();
      if (t && t.length < 60) console.log(`  button: "${t}"`);
    }
    
    // Look for form structure
    const forms = await page.$$('form');
    console.log('Forms:', forms.length);
    
    // Get page text to understand structure
    const bodyText = await page.textContent('body');
    const relevantText = bodyText.substring(0, 2000);
    console.log('\nPage text (first 2000):', relevantText);
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/vc-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
