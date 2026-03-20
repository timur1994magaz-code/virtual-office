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
    await page.goto('https://account.proton.me/signup?plan=free', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Check if we need to select free plan first
    const freeBtn = await page.$('text=Get Proton for free');
    if (freeBtn) {
      console.log('Clicking free plan...');
      await freeBtn.click();
      await page.waitForTimeout(3000);
    }
    
    // Fill username
    console.log('2. Filling username...');
    const usernameInput = await page.$('#username');
    if (usernameInput) {
      await usernameInput.fill('phoenix.phygital');
      await page.waitForTimeout(1000);
    }
    
    // Fill password
    console.log('3. Filling password...');
    const passInput = await page.$('#password');
    if (passInput) {
      await passInput.fill('Ph0en1x_Phyg1tal_2026!');
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ path: '/tmp/proton-filled.png' });
    
    // Look for submit/create button
    const createBtn = await page.$('button:has-text("Start using"), button:has-text("Create"), button:has-text("Sign up"), button:has-text("Get started")');
    if (createBtn) {
      const btnText = await createBtn.textContent();
      console.log('4. Clicking:', btnText.trim());
      await createBtn.click();
      await page.waitForTimeout(10000);
      await page.screenshot({ path: '/tmp/proton-after-create.png' });
      console.log('URL:', page.url());
      
      // Check for captcha or verification
      const bodyText = await page.textContent('body');
      if (bodyText.includes('captcha') || bodyText.includes('verify') || bodyText.includes('robot')) {
        console.log('⚠️ Captcha/verification required');
      }
      if (bodyText.includes('Welcome') || bodyText.includes('congratulations') || bodyText.includes('inbox')) {
        console.log('✅ Account created!');
      }
      
      // Show any visible inputs/prompts
      const inputs = await page.$$('input');
      console.log('Inputs now:', inputs.length);
      for (const inp of inputs) {
        const type = await inp.getAttribute('type');
        const id = await inp.getAttribute('id');
        console.log(`  input: type=${type}, id=${id}`);
      }
      
      const btns = await page.$$('button');
      for (const btn of btns) {
        const text = await btn.textContent();
        if (text.trim() && text.trim().length < 50) console.log(`  button: "${text.trim()}"`);
      }
    } else {
      console.log('Create button not found');
    }
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/proton-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
