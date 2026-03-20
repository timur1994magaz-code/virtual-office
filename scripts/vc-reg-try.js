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
    
    // Look for "Регистрация" anywhere on page
    const allElements = await page.$$('*');
    let regFound = false;
    for (const el of allElements) {
      const text = await el.textContent().catch(() => '');
      if (text.trim() === 'Регистрация' || text.trim() === 'Зарегистрироваться' || text.trim() === 'Sign up' || text.trim() === 'Register') {
        const tag = await el.evaluate(e => e.tagName);
        const isVisible = await el.isVisible();
        console.log(`Found "${text.trim()}" in <${tag}>, visible: ${isVisible}`);
        regFound = true;
      }
    }
    
    if (!regFound) {
      // Check all frames
      for (const frame of page.frames()) {
        if (frame.url() === 'about:blank') continue;
        try {
          const frameHtml = await frame.content();
          if (frameHtml.includes('Регистрация') || frameHtml.includes('регистрац')) {
            console.log('Found registration in frame:', frame.url().substring(0, 80));
            // Get the element
            const regEls = await frame.$$('text=Регистрация');
            console.log('Reg elements:', regEls.length);
          }
        } catch(e) {}
      }
    }
    
    // Also check the full modal content
    console.log('\nLooking for auth modal content...');
    const modalContent = await page.evaluate(() => {
      const modal = document.querySelector('[class*="modal"], [class*="auth"], [class*="popup"]');
      return modal ? modal.innerHTML.substring(0, 2000) : 'No modal found';
    });
    
    // Extract key text from modal
    const textMatches = modalContent.match(/[А-Яа-яA-Za-z\s]{3,}/g);
    if (textMatches) {
      const unique = [...new Set(textMatches.map(t => t.trim()).filter(t => t.length > 2 && t.length < 40))];
      console.log('Modal text fragments:', unique.slice(0, 30));
    }
    
  } catch(e) {
    console.log('Error:', e.message);
  }
  
  await browser.close();
})();
