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
    console.log('1. Opening mail.ru login...');
    await page.goto('https://account.mail.ru/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    // Find username input
    const usernameInput = await page.$('input[name="username"], input[name="login"], input[type="email"], #username');
    if (usernameInput) {
      console.log('2. Filling email...');
      await usernameInput.fill('89670933300@mail.ru');
      
      // Click next/submit
      const nextBtn = await page.$('button[type="submit"], button:has-text("Ввести пароль"), button:has-text("Далее"), button:has-text("Next")');
      if (nextBtn) {
        await nextBtn.click();
        await page.waitForTimeout(3000);
      } else {
        await usernameInput.press('Enter');
        await page.waitForTimeout(3000);
      }
      
      await page.screenshot({ path: '/tmp/mailru-step2.png' });
      console.log('URL:', page.url());
      
      // Find password input
      const passInput = await page.$('input[type="password"], input[name="password"]');
      if (passInput) {
        console.log('3. Filling password...');
        await passInput.fill('wwwww1994T0514wwwww');
        await passInput.press('Enter');
        await page.waitForTimeout(5000);
        await page.screenshot({ path: '/tmp/mailru-after-login.png' });
        console.log('URL after login:', page.url());
        
        // Go to inbox
        console.log('4. Going to inbox...');
        await page.goto('https://e.mail.ru/inbox/', { waitUntil: 'domcontentloaded', timeout: 30000 });
        await page.waitForTimeout(5000);
        await page.screenshot({ path: '/tmp/mailru-inbox.png' });
        
        // Look for vc.ru confirmation email
        const links = await page.$$('a[href*="vc.ru"], a[href*="confirm"], a[href*="verify"]');
        console.log('VC.ru links found:', links.length);
        
        // Look for email subjects
        const subjects = await page.$$('[class*="subject"], [class*="letter"], [data-subject]');
        console.log('Email subjects found:', subjects.length);
        for (const subj of subjects.slice(0, 5)) {
          const text = await subj.textContent();
          if (text.trim()) console.log(`  Subject: "${text.trim().substring(0, 80)}"`);
        }
        
        // Try clicking the first vc.ru email
        const vcEmail = await page.$('text=vc.ru');
        if (vcEmail) {
          console.log('5. Found vc.ru email, clicking...');
          await vcEmail.click();
          await page.waitForTimeout(3000);
          await page.screenshot({ path: '/tmp/mailru-vc-email.png' });
          
          // Find confirmation link
          const confirmLinks = await page.$$('a[href*="confirm"], a[href*="verify"], a[href*="auth"]');
          console.log('Confirmation links:', confirmLinks.length);
          for (const link of confirmLinks) {
            const href = await link.getAttribute('href');
            console.log('  Confirm link:', href);
          }
        }
        
      } else {
        console.log('Password input not found');
        // Show what's on page
        const inputs = await page.$$('input');
        for (const inp of inputs) {
          const type = await inp.getAttribute('type');
          const name = await inp.getAttribute('name');
          console.log(`  input: type=${type}, name=${name}`);
        }
      }
    } else {
      console.log('Username input not found');
    }
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/mailru-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
