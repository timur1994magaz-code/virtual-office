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
    console.log('1. Opening sostav.ru...');
    await page.goto('https://www.sostav.ru', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(5000);
    
    // Remove overlays
    await page.evaluate(() => {
      document.querySelectorAll('[class*="overlay"], [class*="modal"], [class*="popup"], [class*="banner"]').forEach(el => {
        if (getComputedStyle(el).position === 'fixed' || getComputedStyle(el).position === 'absolute') {
          el.remove();
        }
      });
      // Remove specific blocking class
      document.querySelectorAll('.g4fdba670').forEach(el => el.remove());
    });
    await page.waitForTimeout(1000);
    
    // Click Войти
    console.log('2. Clicking Войти...');
    await page.evaluate(() => {
      const links = document.querySelectorAll('a, span, button');
      for (const l of links) {
        if (l.textContent.trim() === 'Войти') {
          l.click();
          break;
        }
      }
    });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: '/tmp/sostav-after-login-click.png' });
    
    // Check for login form
    const inputs = await page.$$('input');
    console.log('Inputs after Войти:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      const id = await inp.getAttribute('id');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`);
    }
    
    // Look for registration link
    const allLinks = await page.$$('a');
    for (const link of allLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      if (text.trim().includes('егистр') || text.trim().includes('егист') || (href && href.includes('regist'))) {
        console.log(`Registration link: "${text.trim()}" → ${href}`);
      }
    }
    
    // Check all frames
    for (const frame of page.frames()) {
      if (frame.url() === 'about:blank') continue;
      const fInputs = await frame.$$('input').catch(() => []);
      if (fInputs.length > 0) {
        console.log(`\nFrame ${frame.url().substring(0, 80)}: ${fInputs.length} inputs`);
        for (const inp of fInputs) {
          const type = await inp.getAttribute('type');
          const name = await inp.getAttribute('name');
          const placeholder = await inp.getAttribute('placeholder');
          console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}`);
        }
      }
    }
    
    // Dump visible text of modal area
    const bodyText = await page.textContent('body');
    // Find auth-related text
    const authSection = bodyText.match(/Войти.{0,300}/);
    if (authSection) console.log('\nAuth section:', authSection[0].substring(0, 200));
    
  } catch(e) {
    console.log('Error:', e.message);
    await page.screenshot({ path: '/tmp/sostav-error.png' }).catch(() => {});
  }
  
  await browser.close();
})();
