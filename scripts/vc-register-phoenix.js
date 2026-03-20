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
    
    // Click "Почта"
    console.log('2. Clicking "Почта"...');
    await page.click('text=Почта', { timeout: 10000 });
    await page.waitForTimeout(3000);
    
    // Click "Регистрация"
    console.log('3. Looking for "Регистрация"...');
    const regBtn = await page.$('text=Регистрация');
    if (regBtn) {
      await regBtn.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '/tmp/vc-reg-form.png' });
      console.log('URL:', page.url());
      
      // Find all inputs
      const inputs = await page.$$('input');
      console.log('Inputs:', inputs.length);
      for (const inp of inputs) {
        const type = await inp.getAttribute('type');
        const name = await inp.getAttribute('name');
        const placeholder = await inp.getAttribute('placeholder');
        console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
      }
      
      // Fill registration
      const emailInput = await page.$('input[name="email"]');
      const passInput = await page.$('input[name="password"]');
      const nameInput = await page.$('input[name="name"]');
      
      if (emailInput) {
        console.log('4. Filling email...');
        await emailInput.fill('89670933300@mail.ru');
      }
      if (passInput) {
        console.log('5. Filling password...');
        await passInput.fill('wwwww1994T0514wwwww');
      }
      if (nameInput) {
        console.log('6. Filling name...');
        await nameInput.fill('Phoenix Phygital');
      }
      
      await page.screenshot({ path: '/tmp/vc-reg-filled.png' });
      
      // Look for submit button
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await btn.textContent();
        const t = text.trim();
        if (t && t.length < 40) console.log(`  button: "${t}"`);
      }
      
      // Try to submit
      console.log('7. Submitting...');
      if (passInput) {
        await passInput.press('Enter');
      }
      await page.waitForTimeout(8000);
      await page.screenshot({ path: '/tmp/vc-reg-result.png' });
      console.log('URL after submit:', page.url());
      
      // Check result
      const bodyText = await page.textContent('body');
      if (bodyText.includes('подтверд') || bodyText.includes('письмо') || bodyText.includes('верифик')) {
        console.log('📧 Email verification required');
      }
      if (bodyText.includes('ошиб') || bodyText.includes('error') || bodyText.includes('Error')) {
        console.log('❌ Error detected');
      }
      // Look for error messages
      const errors = await page.$$('[class*="error"], [class*="Error"]');
      for (const err of errors) {
        const t = await err.textContent();
        if (t.trim()) console.log('  error:', t.trim().substring(0, 100));
      }
      
    } else {
      console.log('"Регистрация" not found');
      // Show what we see
      const allText = await page.$$('button, a');
      for (const el of allText) {
        const t = await el.textContent();
        if (t.trim() && t.trim().length < 40) console.log(`  element: "${t.trim()}"`);
      }
    }
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/vc-reg-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
