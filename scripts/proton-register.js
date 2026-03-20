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
    console.log('1. Opening ProtonMail signup...');
    await page.goto('https://account.proton.me/signup', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    await page.screenshot({ path: '/tmp/proton-signup.png' });
    console.log('URL:', page.url());
    
    const inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      const id = await inp.getAttribute('id');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`);
    }
    
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent();
      if (text.trim() && text.trim().length < 50) console.log(`  button: "${text.trim()}"`);
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
