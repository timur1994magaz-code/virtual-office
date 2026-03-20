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
    // Step 1: Login to mail.ru
    console.log('1. Opening mail.ru login...');
    await page.goto('https://account.mail.ru/login', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    // Fill email
    const emailInput = await page.$('input[type="text"]');
    if (emailInput) {
      await emailInput.fill('89670933300@mail.ru');
      console.log('Email filled');
      
      // Click Sign in
      const signInBtn = await page.$('button:has-text("Sign in")');
      if (signInBtn) {
        await signInBtn.click();
        await page.waitForTimeout(3000);
        
        // Fill password
        const passInput = await page.$('input[type="password"]');
        if (passInput) {
          console.log('2. Filling password...');
          await passInput.fill('wwwww1994T0514wwwww');
          await passInput.press('Enter');
          await page.waitForTimeout(5000);
          console.log('URL after login:', page.url());
          
          // Navigate to inbox
          console.log('3. Going to inbox...');
          await page.goto('https://e.mail.ru/inbox/', { waitUntil: 'domcontentloaded', timeout: 30000 });
          await page.waitForTimeout(5000);
          await page.screenshot({ path: '/tmp/mailru-inbox.png' });
          console.log('Inbox URL:', page.url());
          
          // Get page content to find vc.ru email
          const bodyText = await page.textContent('body');
          if (bodyText.includes('vc.ru') || bodyText.includes('подтвер') || bodyText.includes('confirm')) {
            console.log('✅ Found vc.ru email mentions');
          }
          
          // Try to find and click vc.ru email
          const emailLinks = await page.$$('a');
          for (const link of emailLinks) {
            const text = await link.textContent().catch(() => '');
            if (text.includes('vc.ru') || text.includes('Подтвер') || text.includes('confirm') || text.includes('Confirm')) {
              console.log('Found email:', text.trim().substring(0, 80));
              const href = await link.getAttribute('href');
              if (href) console.log('  href:', href.substring(0, 100));
            }
          }
          
          // Try clicking first unread email
          try {
            const firstEmail = await page.$('[class*="letter"]:first-child, [class*="message"]:first-child, a[href*="inbox/"]');
            if (firstEmail) {
              await firstEmail.click();
              await page.waitForTimeout(3000);
              await page.screenshot({ path: '/tmp/mailru-email.png' });
              
              // Find confirmation link
              const allLinks = await page.$$('a');
              for (const link of allLinks) {
                const href = await link.getAttribute('href');
                if (href && (href.includes('vc.ru') && (href.includes('confirm') || href.includes('verify') || href.includes('auth')))) {
                  console.log('🔗 CONFIRMATION LINK:', href);
                  // Navigate to it
                  console.log('4. Confirming email...');
                  await page.goto(href, { waitUntil: 'domcontentloaded', timeout: 30000 });
                  await page.waitForTimeout(5000);
                  await page.screenshot({ path: '/tmp/vc-confirmed.png' });
                  console.log('Confirmed URL:', page.url());
                  break;
                }
              }
            }
          } catch(e) {
            console.log('Error finding email:', e.message);
          }
          
        } else {
          console.log('Password input not found');
          await page.screenshot({ path: '/tmp/mailru-nopass.png' });
          // Check what's on page
          const inputs = await page.$$('input');
          for (const inp of inputs) {
            const type = await inp.getAttribute('type');
            console.log('  input type:', type);
          }
        }
      }
    }
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/mailru-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
