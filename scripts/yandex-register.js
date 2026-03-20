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
    console.log('1. Opening Yandex registration...');
    await page.goto('https://passport.yandex.ru/registration', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/yandex-reg.png' });
    console.log('URL:', page.url());
    
    // Find all inputs
    const inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      const id = await inp.getAttribute('id');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`);
    }
    
    // Find buttons
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent();
      if (text.trim()) console.log(`  button: "${text.trim().substring(0, 60)}"`);
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
