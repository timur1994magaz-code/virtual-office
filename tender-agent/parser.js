#!/usr/bin/env node
/**
 * Тендерный парсер — мониторинг тендеров на видеопродакшн
 * Парсит агрегаторы и прямые площадки через Playwright
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, 'config.json');
const RESULTS_PATH = path.join(__dirname, 'results');
const SEEN_PATH = path.join(__dirname, 'seen.json');

// Load config
const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

// Track seen tenders
let seen = {};
if (fs.existsSync(SEEN_PATH)) {
  seen = JSON.parse(fs.readFileSync(SEEN_PATH, 'utf8'));
}

function saveSeen() {
  fs.writeFileSync(SEEN_PATH, JSON.stringify(seen, null, 2));
}

// Ensure results dir
if (!fs.existsSync(RESULTS_PATH)) {
  fs.mkdirSync(RESULTS_PATH, { recursive: true });
}

// Keywords for search
const SEARCH_QUERIES = [
  'видеоролик',
  'видеопродакшн',
  'рекламный ролик',
  'производство видео',
  'креативная концепция видео',
  'анимационный ролик',
  'промо ролик'
];

const EXCLUDE = config.filters.excludeKeywords;

function isRelevant(text) {
  const lower = text.toLowerCase();
  // Must contain at least one relevant keyword
  const hasKeyword = config.keywords.some(kw => lower.includes(kw.toLowerCase()));
  // Must NOT contain exclude words
  const hasExclude = EXCLUDE.some(ex => lower.includes(ex.toLowerCase()));
  return hasKeyword && !hasExclude;
}

function parsePrice(text) {
  if (!text) return 0;
  // Extract number from price string like "1 500 000,00 ₽"
  const cleaned = text.replace(/[^\d,\.]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// ============ PARSERS ============

async function parseZakupkiKontur(browser) {
  console.log('🔍 Парсинг Контур.Закупки...');
  const results = [];
  const page = await browser.newPage();
  
  try {
    for (const query of SEARCH_QUERIES.slice(0, 3)) {
      const url = `https://zakupki.kontur.ru/Search?Query=${encodeURIComponent(query)}&OnlyActive=true&SortField=PublicationDate&SortDirection=Desc`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      const items = await page.$$eval('.search-results__item, .tender-item, [class*="search-result"]', (elements) => {
        return elements.slice(0, 20).map(el => ({
          title: el.querySelector('a, h3, [class*="title"], [class*="name"]')?.textContent?.trim() || '',
          link: el.querySelector('a')?.href || '',
          price: el.querySelector('[class*="price"], [class*="sum"], [class*="nmck"]')?.textContent?.trim() || '',
          date: el.querySelector('[class*="date"], [class*="deadline"], time')?.textContent?.trim() || '',
          org: el.querySelector('[class*="customer"], [class*="org"], [class*="company"]')?.textContent?.trim() || '',
          source: 'Контур.Закупки'
        }));
      });
      
      results.push(...items);
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.error('  ⚠️ Контур.Закупки ошибка:', e.message);
  } finally {
    await page.close();
  }
  return results;
}

async function parseSynapsenet(browser) {
  console.log('🔍 Парсинг Синапс...');
  const results = [];
  const page = await browser.newPage();
  
  try {
    for (const query of SEARCH_QUERIES.slice(0, 3)) {
      const url = `https://synapsenet.ru/zakupki/search/${encodeURIComponent(query)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      const items = await page.$$eval('.tender-card, .search-item, [class*="tender"], [class*="zakupka"], tr[class], .card', (elements) => {
        return elements.slice(0, 20).map(el => ({
          title: el.querySelector('a, h3, h4, [class*="name"], [class*="title"]')?.textContent?.trim() || el.textContent?.trim().substring(0, 200),
          link: el.querySelector('a')?.href || '',
          price: el.querySelector('[class*="price"], [class*="sum"], [class*="cost"]')?.textContent?.trim() || '',
          date: el.querySelector('[class*="date"], time')?.textContent?.trim() || '',
          org: el.querySelector('[class*="customer"], [class*="org"]')?.textContent?.trim() || '',
          source: 'Синапс'
        }));
      });
      
      results.push(...items);
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.error('  ⚠️ Синапс ошибка:', e.message);
  } finally {
    await page.close();
  }
  return results;
}

async function parseTenderGuru(browser) {
  console.log('🔍 Парсинг TenderGuru...');
  const results = [];
  const page = await browser.newPage();
  
  try {
    for (const query of SEARCH_QUERIES.slice(0, 3)) {
      const url = `https://www.tenderguru.ru/search?query=${encodeURIComponent(query)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      const items = await page.$$eval('.search-result, .tender-row, tr.result, [class*="tender"], [class*="result-item"]', (elements) => {
        return elements.slice(0, 20).map(el => ({
          title: el.querySelector('a, [class*="title"], [class*="name"]')?.textContent?.trim() || el.textContent?.trim().substring(0, 200),
          link: el.querySelector('a')?.href || '',
          price: el.querySelector('[class*="price"], [class*="sum"]')?.textContent?.trim() || '',
          date: el.querySelector('[class*="date"], time')?.textContent?.trim() || '',
          org: el.querySelector('[class*="customer"], [class*="org"]')?.textContent?.trim() || '',
          source: 'TenderGuru'
        }));
      });
      
      results.push(...items);
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.error('  ⚠️ TenderGuru ошибка:', e.message);
  } finally {
    await page.close();
  }
  return results;
}

async function parseBicotender(browser) {
  console.log('🔍 Парсинг Bicotender...');
  const results = [];
  const page = await browser.newPage();
  
  try {
    for (const query of SEARCH_QUERIES.slice(0, 3)) {
      const url = `https://bicotender.ru/trade/all/?search=${encodeURIComponent(query)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      const items = await page.$$eval('.tender-item, .search-item, [class*="tender"], tr[class], .card', (elements) => {
        return elements.slice(0, 20).map(el => ({
          title: el.querySelector('a, [class*="title"], [class*="name"]')?.textContent?.trim() || el.textContent?.trim().substring(0, 200),
          link: el.querySelector('a')?.href || '',
          price: el.querySelector('[class*="price"], [class*="sum"]')?.textContent?.trim() || '',
          date: el.querySelector('[class*="date"], time')?.textContent?.trim() || '',
          org: el.querySelector('[class*="customer"], [class*="org"]')?.textContent?.trim() || '',
          source: 'Bicotender'
        }));
      });
      
      results.push(...items);
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.error('  ⚠️ Bicotender ошибка:', e.message);
  } finally {
    await page.close();
  }
  return results;
}

async function parseB2BCenter(browser) {
  console.log('🔍 Парсинг B2B-Center...');
  const results = [];
  const page = await browser.newPage();
  
  try {
    for (const query of SEARCH_QUERIES.slice(0, 2)) {
      const url = `https://www.b2b-center.ru/market/?search=${encodeURIComponent(query)}`;
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(3000);
      
      const items = await page.$$eval('.search-result, .tender-item, [class*="lot"], tr[class*="item"]', (elements) => {
        return elements.slice(0, 20).map(el => ({
          title: el.querySelector('a, [class*="title"]')?.textContent?.trim() || el.textContent?.trim().substring(0, 200),
          link: el.querySelector('a')?.href || '',
          price: el.querySelector('[class*="price"], [class*="sum"]')?.textContent?.trim() || '',
          date: el.querySelector('[class*="date"]')?.textContent?.trim() || '',
          org: el.querySelector('[class*="org"], [class*="company"]')?.textContent?.trim() || '',
          source: 'B2B-Center'
        }));
      });
      
      results.push(...items);
      await page.waitForTimeout(2000);
    }
  } catch (e) {
    console.error('  ⚠️ B2B-Center ошибка:', e.message);
  } finally {
    await page.close();
  }
  return results;
}

// ============ MAIN ============

async function run() {
  console.log('🎯 Тендерный агент запущен');
  console.log(`📋 Ключевые слова: ${SEARCH_QUERIES.length}`);
  console.log(`💰 Мин. цена: ${config.minPrice.toLocaleString()} ₽`);
  console.log('---');
  
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  let allResults = [];
  
  try {
    // Parse all available sources
    const parsers = [
      parseZakupkiKontur,
      parseSynapsenet,
      parseTenderGuru,
      parseBicotender,
      parseB2BCenter
    ];
    
    for (const parser of parsers) {
      try {
        const results = await parser(browser);
        allResults.push(...results);
        console.log(`  ✅ Найдено записей: ${results.length}`);
      } catch (e) {
        console.error(`  ❌ Ошибка парсера:`, e.message);
      }
    }
  } finally {
    await browser.close();
  }
  
  // Deduplicate by title
  const uniqueMap = new Map();
  for (const item of allResults) {
    if (item.title && item.title.length > 10) {
      const key = item.title.substring(0, 100).toLowerCase();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, item);
      }
    }
  }
  
  let unique = Array.from(uniqueMap.values());
  console.log(`\n📊 Всего уникальных: ${unique.length}`);
  
  // Filter relevant
  let relevant = unique.filter(item => isRelevant(item.title));
  console.log(`🎯 Релевантных: ${relevant.length}`);
  
  // Filter by price
  let filtered = relevant.filter(item => {
    const price = parsePrice(item.price);
    return price === 0 || price >= config.minPrice; // 0 = price unknown, include
  });
  console.log(`💰 После фильтра по цене (>= ${config.minPrice.toLocaleString()}): ${filtered.length}`);
  
  // Filter new (not seen)
  let newTenders = filtered.filter(item => {
    const key = item.title.substring(0, 100).toLowerCase();
    return !seen[key];
  });
  console.log(`🆕 Новых: ${newTenders.length}`);
  
  // Mark as seen
  for (const item of filtered) {
    const key = item.title.substring(0, 100).toLowerCase();
    seen[key] = { date: new Date().toISOString(), source: item.source };
  }
  saveSeen();
  
  // Save results
  const timestamp = new Date().toISOString().split('T')[0];
  const resultFile = path.join(RESULTS_PATH, `${timestamp}.json`);
  
  const output = {
    date: new Date().toISOString(),
    total: unique.length,
    relevant: relevant.length,
    filtered: filtered.length,
    new: newTenders.length,
    tenders: newTenders
  };
  
  fs.writeFileSync(resultFile, JSON.stringify(output, null, 2));
  console.log(`\n💾 Результаты: ${resultFile}`);
  
  // Output for notification
  if (newTenders.length > 0) {
    console.log('\n=== НОВЫЕ ТЕНДЕРЫ ===');
    for (const t of newTenders) {
      console.log(`\n📌 ${t.title}`);
      if (t.price) console.log(`   💰 ${t.price}`);
      if (t.org) console.log(`   🏢 ${t.org}`);
      if (t.date) console.log(`   📅 ${t.date}`);
      if (t.link) console.log(`   🔗 ${t.link}`);
      console.log(`   📍 ${t.source}`);
    }
  } else {
    console.log('\n✅ Новых тендеров не найдено');
  }
  
  return output;
}

run().catch(e => {
  console.error('FATAL:', e);
  process.exit(1);
});
