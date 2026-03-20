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
  await page.goto('https://vc.ru/?modal=auth', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(3000);
  
  // Find the Yandex auth iframe
  const frames = page.frames();
  console.log('Frames:', frames.length);
  for (const f of frames) {
    console.log('  Frame:', f.url().substring(0, 100));
  }
  
  // Try to find the Yandex iframe
  const yandexFrame = frames.find(f => f.url().includes('yandex'));
  if (yandexFrame) {
    console.log('\n2. Found Yandex frame, looking for inputs...');
    await page.waitForTimeout(2000);
    
    const inputs = await yandexFrame.$$('input');
    console.log('Inputs in iframe:', inputs.length);
    for (const inp of inputs) {
      const type = await inp.getAttribute('type');
      const name = await inp.getAttribute('name');
      const placeholder = await inp.getAttribute('placeholder');
      const id = await inp.getAttribute('id');
      console.log(`  input: type=${type}, name=${name}, placeholder=${placeholder}, id=${id}`);
    }
    
    const buttons = await yandexFrame.$$('button');
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text.trim()) console.log(`  button: "${text.trim().substring(0, 60)}"`);
    }
    
    const links = await yandexFrame.$$('a');
    for (const link of links) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      if (text.trim()) console.log(`  link: "${text.trim().substring(0, 60)}" → ${href ? href.substring(0, 80) : ''}`);
    }
    
    await yandexFrame.screenshot({ path: '/tmp/vc-yandex-frame.png' });
    console.log('Yandex frame screenshot saved');
  }
  
  await browser.close();
})();
