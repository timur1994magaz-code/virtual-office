#!/usr/bin/env node
/**
 * Тендерный парсер v2 — через innerText + regex
 * Работает с Bicotender (634 тендера) + TenderGuru (1768) + Синапс
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const RESULTS_PATH = path.join(__dirname, 'results');
const SEEN_PATH = path.join(__dirname, 'seen.json');

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

let seen = {};
if (fs.existsSync(SEEN_PATH)) {
  try { seen = JSON.parse(fs.readFileSync(SEEN_PATH, 'utf8')); } catch(e) { seen = {}; }
}
function saveSeen() { fs.writeFileSync(SEEN_PATH, JSON.stringify(seen, null, 2)); }
if (!fs.existsSync(RESULTS_PATH)) fs.mkdirSync(RESULTS_PATH, { recursive: true });

const EXCLUDE = config.filters.excludeKeywords.map(k => k.toLowerCase());

function isExcluded(text) {
  const lower = text.toLowerCase();
  return EXCLUDE.some(ex => lower.includes(ex));
}

function parseRubPrice(text) {
  if (!text) return 0;
  // Match patterns like "5 000 000 Руб." or "499 000 Руб."
  const match = text.match(/([\d\s]+)\s*Руб/i);
  if (!match) return 0;
  return parseInt(match[1].replace(/\s/g, ''), 10) || 0;
}

// ============ BICOTENDER (main source — shows prices) ============
async function parseBicotender(browser, queries) {
  console.log('🔍 Парсинг Bicotender...');
  const results = [];
  
  for (const query of queries) {
    const page = await browser.newPage();
    try {
      const url = `https://www.bicotender.ru/tender/search/?keywordsStrict=0&smartSearch=0&regionPreference=0&keywords=${encodeURIComponent(query)}&submit=1&showPerPage=50`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3000);
      
      const text = await page.$eval('body', el => el.innerText);
      
      // Parse tender blocks from text
      const blocks = text.split(/Тендер №(\d+)/);
      for (let i = 1; i < blocks.length; i += 2) {
        const id = blocks[i];
        const body = blocks[i + 1] || '';
        
        // Extract title — first meaningful line
        const lines = body.split('\n').map(l => l.trim()).filter(l => l.length > 10);
        const titleLine = lines.find(l => l.includes('объявляет тендер:') || l.includes('Позиции') || l.includes('Лоты'));
        let title = '';
        if (titleLine && titleLine.includes('объявляет тендер:')) {
          title = titleLine.split('объявляет тендер:')[1]?.trim() || titleLine;
        } else {
          title = lines[0] || '';
        }
        
        // Extract organization
        let org = '';
        const orgMatch = body.match(/^([А-ЯЁ\s"«»\-\.]+)\s+объявляет/m);
        if (orgMatch) org = orgMatch[1].trim();
        
        // Extract price  
        const priceMatch = body.match(/([\d\s]+)\s*Руб\./i);
        const price = priceMatch ? priceMatch[0].trim() : '';
        const priceNum = parseRubPrice(price);
        
        // Extract dates
        const dateMatch = body.match(/(\d{2}\.\d{2}\.\d{4})/g);
        const startDate = dateMatch ? dateMatch[0] : '';
        const endDate = dateMatch && dateMatch[1] ? dateMatch[1] : '';
        
        // Extract region
        const regionMatch = body.match(/(Центральный|Северо-западный|Южный|Приволжский|Уральский|Сибирский|Дальневосточный)\s+ФО\s*\/\s*([^\n]+)/);
        const region = regionMatch ? regionMatch[0].trim() : '';
        
        // Extract type
        const typeMatch = body.match(/(Запрос цен|Запрос предложений|Конкурс|Аукцион|Единственный поставщик|Запрос котировок)/);
        const tenderType = typeMatch ? typeMatch[1] : '';
        
        // Check if active
        const isExpired = body.includes('срок истек');
        
        results.push({
          id: `bico-${id}`,
          tenderId: id,
          title: title.substring(0, 300),
          org,
          price,
          priceNum,
          startDate,
          endDate,
          region,
          type: tenderType,
          active: !isExpired,
          link: `https://www.bicotender.ru/tender/${id}/`,
          source: 'Bicotender',
          query
        });
      }
      
      console.log(`  "${query}": ${Math.floor((blocks.length - 1) / 2)} тендеров`);
    } catch(e) {
      console.error(`  ⚠️ "${query}": ${e.message}`);
    }
    await page.close();
    await new Promise(r => setTimeout(r, 2000)); // rate limit
  }
  
  return results;
}

// ============ TENDERGURU (lots of results, prices hidden for free) ============
async function parseTenderGuru(browser, queries) {
  console.log('🔍 Парсинг TenderGuru...');
  const results = [];
  
  for (const query of queries) {
    const page = await browser.newPage();
    try {
      // TenderGuru uses windows-1251 encoding for search params
      const url = `https://www.tenderguru.ru/search?kwords=${encodeURIComponent(query)}&submit=Найти&irazd=0&tenpage=1&tenders=1`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
      await page.waitForTimeout(3000);
      
      const text = await page.$eval('body', el => el.innerText);
      
      // Parse tender blocks
      const datePattern = /(\d{2}-\d{2}-\d{4})\n\n\n([^\n]+)\nНомер тендера:\s*(\d+)\nРегион:\s*([^\n]*)\nРаздел закупок:\s*([^\n]*)/g;
      let match;
      while ((match = datePattern.exec(text)) !== null) {
        const [, date, title, tenderId, region, category] = match;
        
        // Try to get price (often hidden)
        const afterMatch = text.substring(match.index + match[0].length, match.index + match[0].length + 500);
        const priceMatch = afterMatch.match(/Цена контракта:\s*([^\n]+)/);
        const price = priceMatch ? priceMatch[1].replace('░', '').trim() : '';
        
        const daysMatch = afterMatch.match(/Осталось (\d+) дней/);
        const active = !!daysMatch;
        
        results.push({
          id: `tg-${tenderId}`,
          tenderId,
          title: title.trim().substring(0, 300),
          org: '',
          price,
          priceNum: 0, // hidden on free plan
          startDate: date,
          endDate: '',
          region,
          type: category,
          active,
          link: `https://www.tenderguru.ru/tender/${tenderId}`,
          source: 'TenderGuru',
          query
        });
      }
      
      console.log(`  "${query}": ${results.length} тендеров`);
    } catch(e) {
      console.error(`  ⚠️ "${query}": ${e.message}`);
    }
    await page.close();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  return results;
}

// ============ SYNAPSENET ============
async function parseSynapsenet(browser, queries) {
  console.log('🔍 Парсинг Синапс...');
  const results = [];
  
  for (const query of queries) {
    const page = await browser.newPage();
    try {
      await page.goto('https://synapsenet.ru', { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);
      await page.fill('#main-input-script', query);
      await page.press('#main-input-script', 'Enter');
      await page.waitForTimeout(5000);
      
      const text = await page.$eval('body', el => el.innerText);
      
      // Try to parse whatever structure Synapse shows
      const tendersMatch = text.match(/Найдено.*?(\d+)/);
      console.log(`  "${query}": ${tendersMatch ? tendersMatch[1] : '?'} тендеров (структура Синапс)`);
      
      // Parse items if visible
      const lines = text.split('\n').filter(l => l.trim().length > 20);
      // Look for price patterns
      for (const line of lines) {
        if (line.match(/\d{1,3}[\s\u00a0]\d{3}/) && line.length < 500) {
          // Potential tender line
        }
      }
      
    } catch(e) {
      console.error(`  ⚠️ "${query}": ${e.message}`);
    }
    await page.close();
    await new Promise(r => setTimeout(r, 2000));
  }
  
  return results;
}

// ============ MAIN ============
async function run() {
  const startTime = Date.now();
  console.log('🎯 Тендерный агент v2 запущен');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log('---');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  // Main search queries
  const queries = [
    'видеоролик',
    'производство видео',
    'рекламный ролик',
    'анимационный ролик',
    'видеопродакшн'
  ];
  
  let allResults = [];
  
  try {
    // Bicotender — best source (shows prices)
    const bicoResults = await parseBicotender(browser, queries);
    allResults.push(...bicoResults);
    
    // TenderGuru — large database
    const tgResults = await parseTenderGuru(browser, queries);
    allResults.push(...tgResults);
    
    // Synapsenet 
    await parseSynapsenet(browser, queries.slice(0, 2));
    
  } finally {
    await browser.close();
  }
  
  // Deduplicate
  const uniqueMap = new Map();
  for (const item of allResults) {
    if (item.title && item.title.length > 5) {
      const key = item.tenderId || item.title.substring(0, 80).toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
  }
  
  let all = Array.from(uniqueMap.values());
  console.log(`\n📊 Всего уникальных: ${all.length}`);
  
  // Filter out excluded
  all = all.filter(item => !isExcluded(item.title));
  console.log(`🚫 После исключений: ${all.length}`);
  
  // Active only
  const active = all.filter(item => item.active);
  console.log(`✅ Активных: ${active.length}`);
  
  // Filter by price (only for items with known price)
  const withPrice = active.filter(item => item.priceNum >= config.minPrice);
  const noPrice = active.filter(item => item.priceNum === 0);
  console.log(`💰 С ценой >= ${config.minPrice.toLocaleString()} ₽: ${withPrice.length}`);
  console.log(`❓ Без цены (неизвестна): ${noPrice.length}`);
  
  // Combine — prioritize those with price
  const relevant = [...withPrice, ...noPrice];
  
  // Filter new
  const newTenders = relevant.filter(item => {
    const key = item.id;
    return !seen[key];
  });
  console.log(`🆕 Новых: ${newTenders.length}`);
  
  // Mark seen
  for (const item of relevant) {
    seen[item.id] = { date: new Date().toISOString(), source: item.source };
  }
  saveSeen();
  
  // Save results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
  const resultFile = path.join(RESULTS_PATH, `${timestamp}.json`);
  
  const output = {
    date: new Date().toISOString(),
    duration: `${Math.round((Date.now() - startTime) / 1000)}s`,
    stats: {
      total: all.length,
      active: active.length,
      withPrice: withPrice.length,
      noPrice: noPrice.length,
      new: newTenders.length
    },
    tenders: newTenders.sort((a, b) => b.priceNum - a.priceNum) // highest price first
  };
  
  fs.writeFileSync(resultFile, JSON.stringify(output, null, 2));
  console.log(`\n💾 Результаты: ${resultFile}`);
  
  // Format report
  if (newTenders.length > 0) {
    console.log('\n========= НОВЫЕ ТЕНДЕРЫ =========\n');
    
    const byCategory = {
      high: newTenders.filter(t => t.priceNum >= 8000000),
      mid: newTenders.filter(t => t.priceNum >= 1500000 && t.priceNum < 8000000),
      low: newTenders.filter(t => t.priceNum >= 250000 && t.priceNum < 1500000),
      unknown: newTenders.filter(t => t.priceNum === 0)
    };
    
    if (byCategory.high.length > 0) {
      console.log('🔴 КРУПНЫЕ (от 8М ₽) — съёмочные ролики:');
      byCategory.high.forEach(t => {
        console.log(`  📌 ${t.title}`);
        console.log(`     💰 ${t.price} | 🏢 ${t.org || '—'} | 📍 ${t.region || '—'}`);
        console.log(`     🔗 ${t.link}`);
      });
    }
    
    if (byCategory.mid.length > 0) {
      console.log('\n🟡 СРЕДНИЕ (1.5М-8М ₽) — креативные концепции:');
      byCategory.mid.forEach(t => {
        console.log(`  📌 ${t.title}`);
        console.log(`     💰 ${t.price} | 🏢 ${t.org || '—'} | 📍 ${t.region || '—'}`);
        console.log(`     🔗 ${t.link}`);
      });
    }
    
    if (byCategory.low.length > 0) {
      console.log('\n🟢 СТАНДАРТНЫЕ (250К-1.5М ₽) — AI видеоролики:');
      byCategory.low.forEach(t => {
        console.log(`  📌 ${t.title}`);
        console.log(`     💰 ${t.price} | 🏢 ${t.org || '—'} | 📍 ${t.region || '—'}`);
        console.log(`     🔗 ${t.link}`);
      });
    }
    
    if (byCategory.unknown.length > 0) {
      console.log(`\n⚪ БЕЗ ЦЕНЫ (${byCategory.unknown.length} шт.) — нужна проверка`);
      byCategory.unknown.slice(0, 5).forEach(t => {
        console.log(`  📌 ${t.title}`);
        console.log(`     🔗 ${t.link}`);
      });
    }
  } else {
    console.log('\n✅ Новых тендеров не найдено');
  }
  
  console.log(`\n⏱ Выполнено за ${Math.round((Date.now() - startTime) / 1000)} сек`);
  
  return output;
}

run().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
