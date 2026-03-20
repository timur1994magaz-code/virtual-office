const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ 
    headless: true,
    executablePath: '/usr/bin/chromium',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('1. Opening vc.ru with auth modal...');
  await page.goto('https://vc.ru/?modal=auth', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);
  
  // Get full HTML to search for email login option
  const html = await page.content();
  
  // Look for "email" or "почт" or "пароль" anywhere
  const emailMentions = html.match(/email|почт|пароль|password|login|логин/gi);
  console.log('Auth-related mentions:', emailMentions ? emailMentions.length : 0);
  
  // Check all frames for inputs
  for (const frame of page.frames()) {
    const url = frame.url();
    if (url === 'about:blank') continue;
    
    try {
      const frameHtml = await frame.content();
      const hasAuth = frameHtml.match(/email|почт|пароль|password/gi);
      if (hasAuth) {
        console.log(`\nFrame with auth content: ${url.substring(0, 80)}`);
        
        // Look for all clickable elements
        const clickables = await frame.$$('button, a, [role="button"], .link, [class*="link"], [class*="button"]');
        for (const el of clickables) {
          const text = await el.textContent().catch(() => '');
          if (text.trim()) console.log(`  clickable: "${text.trim().substring(0, 80)}"`);
        }
        
        const inputs = await frame.$$('input');
        for (const inp of inputs) {
          const attrs = await inp.evaluate(el => ({
            type: el.type, name: el.name, placeholder: el.placeholder, 
            id: el.id, className: el.className
          }));
          console.log(`  input:`, JSON.stringify(attrs));
        }
      }
    } catch(e) {}
  }
  
  // Also check for iframes that loaded late
  await page.waitForTimeout(3000);
  const allFrames = page.frames();
  console.log('\nAll frames after wait:', allFrames.length);
  for (const f of allFrames) {
    console.log(`  ${f.url().substring(0, 120)}`);
  }
  
  // Try finding "другой способ" or "email" link in iframe
  for (const frame of page.frames()) {
    try {
      const links = await frame.$$('a, button, [role="button"]');
      for (const link of links) {
        const text = await link.textContent().catch(() => '');
        const t = text.trim().toLowerCase();
        if (t.includes('email') || t.includes('почт') || t.includes('друг') || t.includes('пароль') || t.includes('password') || t.includes('логин')) {
          console.log(`\nFOUND AUTH OPTION in frame ${frame.url().substring(0, 60)}: "${text.trim()}"`);
        }
      }
    } catch(e) {}
  }
  
  await page.screenshot({ path: '/tmp/vc-full-auth.png', fullPage: true });
  
  await browser.close();
})();
