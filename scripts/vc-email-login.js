const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. Opening vc.ru...');
  await page.goto('https://vc.ru/?modal=auth', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  // Click "Почта" button
  console.log('2. Looking for "Почта" button...');
  const emailBtn = await page.$('text=Почта');
  if (emailBtn) {
    console.log('Found "Почта" button, clicking...');
    await emailBtn.click();
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/vc-email-form.png', fullPage: true });
    console.log('URL after click:', page.url());
    
    // Now look for email/password inputs
    const inputs = await page.$$('input');
    console.log('Inputs:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      const id = await inp.getAttribute('id');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`);
    }
    
    // Also check frames
    for (const frame of page.frames()) {
      if (frame.url() === 'about:blank') continue;
      const frameInputs = await frame.$$('input');
      if (frameInputs.length > 0) {
        console.log(`\nFrame ${frame.url().substring(0, 80)} inputs:`);
        for (const inp of frameInputs) {
          const type = await inp.getAttribute('type');
          const name = await inp.getAttribute('name');
          const placeholder = await inp.getAttribute('placeholder');
          console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
        }
      }
    }
    
    // Look for buttons
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await btn.textContent();
      const t = text.trim();
      if (t && t.length < 40) console.log(`  button: "${t}"`);
    }
    
  } else {
    console.log('"Почта" button NOT found');
  }
  
  await browser.close();
})();
