// Generate 80 thematic SVG illustrations for PDD questions
// Each SVG is 320x180, dark theme compatible

const svgs = [];

// Helper: basic road background
const roadBg = (extra='') => `<rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="100" x2="320" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="12,8"/>${extra}`;
const sky = `<rect fill="#1a2a3a" width="320" height="80"/><rect fill="#1a2a1a" width="320" height="100" y="80"/>`;
const car = (x,y,color='#c00',flip=false) => `<rect fill="${color}" x="${x}" y="${y}" width="45" height="22" rx="4"/><rect fill="#222" x="${x+4}" y="${y+22}" width="10" height="5" rx="2"/><rect fill="#222" x="${x+31}" y="${y+22}" width="10" height="5" rx="2"/><rect fill="#88ccff" x="${x+(flip?2:28)}" y="${y+3}" width="15" height="10" rx="2" opacity="0.6"/>`;
const sign = (x,y,type) => {
  const pole = `<rect fill="#888" x="${x-2}" y="${y}" width="4" height="50"/>`;
  switch(type) {
    case 'yield': return pole+`<polygon points="${x},${y-25} ${x-18},${y+5} ${x+18},${y+5}" fill="#fff" stroke="#c00" stroke-width="3"/>`;
    case 'stop': return pole+`<polygon points="${x-15},${y-20} ${x+15},${y-20} ${x+22},${y-5} ${x+22},${y+10} ${x+15},${y+18} ${x-15},${y+18} ${x-22},${y+10} ${x-22},${y-5}" fill="#c00" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="11" font-weight="bold" fill="#fff">STOP</text>`;
    case 'main': return pole+`<rect fill="#C8FF00" x="${x-14}" y="${y-14}" width="28" height="28" rx="2" transform="rotate(45,${x},${y})"/><rect fill="#fff" x="${x-10}" y="${y-10}" width="20" height="20" rx="1" transform="rotate(45,${x},${y})"/>`;
    case 'noentry': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#c00" stroke="#fff" stroke-width="2"/><rect fill="#fff" x="${x-12}" y="${y-11}" width="24" height="6" rx="1"/>`;
    case 'noovertake': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#fff" stroke="#c00" stroke-width="3"/><rect fill="#c00" x="${x-8}" y="${y-15}" width="8" height="14" rx="2"/><rect fill="#333" x="${x+1}" y="${y-15}" width="8" height="14" rx="2"/>`;
    case 'speed60': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#fff" stroke="#c00" stroke-width="3"/><text x="${x}" y="${y-2}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">60</text>`;
    case 'speed90': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#fff" stroke="#c00" stroke-width="3"/><text x="${x}" y="${y-2}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">90</text>`;
    case 'speed110': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#fff" stroke="#c00" stroke-width="3"/><text x="${x}" y="${y-2}" text-anchor="middle" font-size="14" font-weight="bold" fill="#333">110</text>`;
    case 'speed20': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#fff" stroke="#c00" stroke-width="3"/><text x="${x}" y="${y-2}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">20</text>`;
    case 'speed50': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#fff" stroke="#c00" stroke-width="3"/><text x="${x}" y="${y-2}" text-anchor="middle" font-size="16" font-weight="bold" fill="#333">50</text>`;
    case 'straight': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#36f" stroke="#fff" stroke-width="2"/><polygon points="${x},${y-22} ${x-6},${y-12} ${x-3},${y-12} ${x-3},${y+4} ${x+3},${y+4} ${x+3},${y-12} ${x+6},${y-12}" fill="#fff"/>`;
    case 'right': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#36f" stroke="#fff" stroke-width="2"/><polygon points="${x+10},${y-8} ${x},${y-14} ${x},${y-11} ${x-8},${y-11} ${x-8},${y-5} ${x},${y-5} ${x},${y-2}" fill="#fff"/>`;
    case 'roundabout': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#36f" stroke="#fff" stroke-width="2"/><path d="M${x-8},${y-4} A10,10 0 1,1 ${x+4},${y-16}" fill="none" stroke="#fff" stroke-width="3"/><polygon points="${x+4},${y-20} ${x+8},${y-14} ${x},${y-14}" fill="#fff"/>`;
    case 'nopark': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#36f" stroke="#fff" stroke-width="2"/><text x="${x}" y="${y-2}" text-anchor="middle" font-size="18" font-weight="bold" fill="#fff">P</text><line x1="${x-13}" y1="${y+5}" x2="${x+13}" y2="${y-21}" stroke="#c00" stroke-width="3"/>`;
    case 'nostop': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#36f" stroke="#fff" stroke-width="2"/><line x1="${x-12}" y1="${y-8}" x2="${x+12}" y2="${y-8}" stroke="#c00" stroke-width="3"/><line x1="${x-12}" y1="${y+5}" x2="${x+12}" y2="${y-21}" stroke="#c00" stroke-width="3"/>`;
    case 'pedestrian': return pole+`<rect fill="#36f" x="${x-18}" y="${y-22}" width="36" height="36" rx="3"/><circle cx="${x}" cy="${y-14}" r="4" fill="#fff"/><line x1="${x}" y1="${y-10}" x2="${x}" y2="${y+2}" stroke="#fff" stroke-width="2"/><line x1="${x}" y1="${y+2}" x2="${x-5}" y2="${y+10}" stroke="#fff" stroke-width="2"/><line x1="${x}" y1="${y+2}" x2="${x+5}" y2="${y+10}" stroke="#fff" stroke-width="2"/>`;
    case 'bike': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#36f" stroke="#fff" stroke-width="2"/><circle cx="${x-5}" cy="${y-3}" r="5" fill="none" stroke="#fff" stroke-width="1.5"/><circle cx="${x+5}" cy="${y-3}" r="5" fill="none" stroke="#fff" stroke-width="1.5"/><line x1="${x-5}" y1="${y-3}" x2="${x}" y2="${y-13}" stroke="#fff" stroke-width="1.5"/>`;
    case 'nosound': return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#fff" stroke="#c00" stroke-width="3"/><text x="${x}" y="${y-2}" text-anchor="middle" font-size="14" fill="#333">🔇</text><line x1="${x-12}" y1="${y+5}" x2="${x+12}" y2="${y-21}" stroke="#c00" stroke-width="3"/>`;
    default: return pole+`<circle cx="${x}" cy="${y-8}" r="18" fill="#fff" stroke="#c00" stroke-width="3"/>`;
  }
};

const trafficLight = (x,y,active='green') => {
  let r = active==='red'?'#f44':'#333', ye = active==='yellow'?'#ff0':'#333', g = active==='green'?'#4f4':'#333';
  return `<rect fill="#888" x="${x-2}" y="${y+30}" width="4" height="40"/><rect fill="#222" x="${x-10}" y="${y}" width="20" height="30" rx="3"/><circle cx="${x}" cy="${y+7}" r="5" fill="${r}"/><circle cx="${x}" cy="${y+15}" r="5" fill="${ye}"/><circle cx="${x}" cy="${y+23}" r="5" fill="${g}"/>`;
};

const zebra = (x,y,w=40) => {
  let s='';
  for(let i=0;i<w;i+=8) s+=`<rect fill="#fff" x="${x+i}" y="${y}" width="4" height="20"/>`;
  return s;
};

// Q0: Разрешённая максимальная масса
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${car(60,105,'#36f')}<rect fill="#c00" x="200" y="88" width="70" height="35" rx="4"/><rect fill="#222" x="208" y="123" width="12" height="6" rx="3"/><rect fill="#222" x="248" y="123" width="12" height="6" rx="3"/><text x="235" y="112" text-anchor="middle" font-size="14" fill="#fff" font-weight="bold">3.5т</text><text x="160" y="30" text-anchor="middle" font-size="13" fill="#C8FF00">Масса ТС</text></svg>`);

// Q1: Участники дорожного движения
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${car(140,105,'#09f')}<circle cx="60" cy="108" r="8" fill="#C8FF00"/><line x1="60" y1="116" x2="60" y2="135" stroke="#C8FF00" stroke-width="2"/><line x1="55" y1="125" x2="65" y2="125" stroke="#C8FF00" stroke-width="2"/><circle cx="280" cy="108" r="8" fill="#C8FF00"/><line x1="280" y1="116" x2="280" y2="135" stroke="#C8FF00" stroke-width="2"/><text x="160" y="30" text-anchor="middle" font-size="12" fill="#C8FF00">Водитель • Пешеход • Пассажир</text></svg>`);

// Q2: Обгон
svgs.push(`<svg viewBox="0 0 320 180">${roadBg()}<line x1="0" y1="100" x2="320" y2="100" stroke="#ff0" stroke-width="3"/>${car(80,75,'#36f')}<path d="M140,105 C160,80 190,80 210,105" stroke="#C8FF00" stroke-width="2" fill="none" stroke-dasharray="5,3"/>${car(200,105,'#c00')}<text x="160" y="30" text-anchor="middle" font-size="12" fill="#C8FF00">Обгон — выезд на встречную</text></svg>`);

// Q3: Недостаточная видимость
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#2a2a3a" width="320" height="180"/><rect fill="#555" x="0" y="100" width="320" height="40" opacity="0.5"/><rect fill="#fff" width="320" height="180" opacity="0.25"/>${car(140,105,'#c00')}<circle cx="175" cy="112" r="4" fill="#ff0" opacity="0.8"/><circle cx="150" cy="112" r="4" fill="#ff0" opacity="0.8"/><text x="160" y="30" text-anchor="middle" font-size="12" fill="#C8FF00">Видимость &lt; 300м</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#888">Туман • Дождь • Снег</text></svg>`);

// Q4: Тротуары и обочины — часть дороги
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#777" x="0" y="110" width="320" height="10"/><rect fill="#555" x="0" y="70" width="320" height="40"/><rect fill="#777" x="0" y="60" width="320" height="10"/><rect fill="#6a6" x="0" y="120" width="320" height="30"/><rect fill="#6a6" x="0" y="30" width="320" height="30"/><text x="160" y="50" text-anchor="middle" font-size="10" fill="#fff">Тротуар</text><text x="160" y="92" text-anchor="middle" font-size="10" fill="#fff">Проезжая часть</text><text x="160" y="67" text-anchor="middle" font-size="9" fill="#ddd">Обочина</text><text x="160" y="117" text-anchor="middle" font-size="9" fill="#ddd">Обочина</text><text x="160" y="140" text-anchor="middle" font-size="10" fill="#fff">Тротуар</text></svg>`);

// Q5: Мигание зелёного
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${trafficLight(160,30,'green')}<circle cx="160" cy="53" r="5" fill="#4f4" opacity="0.5"><animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite"/></circle>${car(80,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="11" fill="#C8FF00">Зелёный мигает — скоро жёлтый</text></svg>`);

// Q6: Перестроение
svgs.push(`<svg viewBox="0 0 320 180">${roadBg()}${car(80,78,'#36f')}<path d="M125,90 L180,108" stroke="#C8FF00" stroke-width="2" stroke-dasharray="5,3" marker-end="url(#arr)"/>${car(200,105,'#c00')}<defs><marker id="arr" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><polygon points="0,0 6,2 0,4" fill="#C8FF00"/></marker></defs><text x="160" y="30" text-anchor="middle" font-size="12" fill="#C8FF00">Перестроение</text></svg>`);

// Q7: Мопед с 16 лет
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="110" width="320" height="30"/><ellipse cx="145" cy="122" rx="8" ry="8" fill="none" stroke="#888" stroke-width="3"/><ellipse cx="175" cy="122" rx="8" ry="8" fill="none" stroke="#888" stroke-width="3"/><rect fill="#C8FF00" x="148" y="108" width="24" height="10" rx="3"/><circle cx="155" cy="100" r="6" fill="#C8FF00"/><text x="160" y="30" text-anchor="middle" font-size="13" fill="#C8FF00">🛵 Мопед — с 16 лет</text><text x="160" y="170" text-anchor="middle" font-size="20" fill="#C8FF00">16+</text></svg>`);

// Q8: Знак "Уступите дорогу"
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(80,50,'yield')}${car(180,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="11" fill="#C8FF00">Знак 2.4 — Уступите дорогу</text></svg>`);

// Q9: Мигающий жёлтый на перекрёстке
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="60" y="0" width="80" height="180"/><rect fill="#555" x="0" y="80" width="320" height="50"/>${trafficLight(100,15,'yellow')}${car(180,85,'#c00')}${car(20,85,'#36f')}<text x="260" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Жёлтый мигает</text></svg>`);

// Q10: Главная дорога
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(60,50,'main')}${car(150,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="11" fill="#C8FF00">Знак 2.1 — Главная дорога</text></svg>`);

// Q11: Знак СТОП
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(80,50,'stop')}<rect fill="#fff" x="100" y="118" width="40" height="3"/><text x="120" y="116" text-anchor="middle" font-size="8" fill="#fff">Стоп-линия</text>${car(170,105,'#36f')}<text x="250" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Обязательная остановка</text></svg>`);

// Q12: Помеха справа
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${car(120,40,'#c00')}<text x="145" y="38" text-anchor="middle" font-size="8" fill="#fff">→</text>${car(30,80,'#36f')}<text x="55" y="78" text-anchor="middle" font-size="8" fill="#fff">↑</text><text x="260" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Помеха справа</text></svg>`);

// Q13: Знаки приоритета на регулируемом
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(60,50,'main')}${trafficLight(160,25,'green')}${car(200,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Светофор работает → знаки приоритета НЕ действуют</text></svg>`);

// Q14: Преимущество встречного движения
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="80" y="80" width="160" height="40"/><rect fill="#777" x="60" y="80" width="20" height="40"/><rect fill="#777" x="240" y="80" width="20" height="40"/>${car(100,85,'#36f')}${car(190,95,'#c00',true)}<rect fill="#888" x="55" y="40" width="4" height="40"/><circle cx="57" cy="30" r="16" fill="#fff" stroke="#c00" stroke-width="2"/><polygon points="48,30 57,22 57,38" fill="#c00"/><polygon points="66,30 57,22 57,38" fill="none" stroke="#333" stroke-width="1"/><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Узкий участок — встречный первый</text></svg>`);

// Q15: Преимущество на главной
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${sign(70,40,'main')}${car(30,80,'#36f')}<text x="55" y="78" text-anchor="middle" font-size="10" fill="#C8FF00">→</text>${car(125,10,'#c00')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">На главной — у меня преимущество</text></svg>`);

// Q16: Въезд запрещён (кирпич)
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(160,50,'noentry')}${car(50,105,'#36f')}<line x1="130" y1="90" x2="130" y2="140" stroke="#c00" stroke-width="2" stroke-dasharray="4,4"/><text x="160" y="170" text-anchor="middle" font-size="11" fill="#F44336">Въезд запрещён!</text></svg>`);

// Q17: Обгон запрещён
svgs.push(`<svg viewBox="0 0 320 180">${roadBg()}${sign(60,30,'noovertake')}${car(120,78,'#36f')}${car(200,105,'#c00')}<line x1="150" y1="85" x2="180" y2="100" stroke="#F44336" stroke-width="3"/><text x="40" y="15" font-size="7" fill="#F44336">✗</text><text x="260" y="170" text-anchor="middle" font-size="10" fill="#F44336">Обгон запрещён</text></svg>`);

// Q18: Остановка запрещена — исключение маршрутные
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(80,50,'nostop')}<rect fill="#ff0" x="180" y="95" width="60" height="30" rx="5"/><text x="210" y="115" text-anchor="middle" font-size="9" fill="#333">Автобус</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Маршрутные ТС — исключение</text></svg>`);

// Q19: Зона действия ограничения скорости
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(40,50,'speed60')}${car(140,105,'#36f')}<rect fill="#888" x="268" y="50" width="4" height="50"/><circle cx="270" cy="42" r="18" fill="#fff" stroke="#333" stroke-width="2"/><text x="270" y="48" text-anchor="middle" font-size="14" fill="#333">⊘</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">До знака отмены / перекрёстка</text></svg>`);

// Q20: Движение запрещено
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><rect fill="#888" x="158" y="40" width="4" height="60"/><circle cx="160" cy="32" r="18" fill="#fff" stroke="#c00" stroke-width="3"/>${car(50,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#F44336">3.2 — Движение запрещено</text></svg>`);

// Q21: Поворот направо запрещён
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><rect fill="#888" x="68" y="30" width="4" height="40"/><circle cx="70" cy="22" r="16" fill="#fff" stroke="#c00" stroke-width="3"/><path d="M63,22 L70,15 C76,15 77,22 77,22" fill="none" stroke="#333" stroke-width="2"/><line x1="62" y1="30" x2="78" y2="14" stroke="#c00" stroke-width="3"/>${car(30,80,'#36f')}<text x="260" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Только поворот направо запрещён</text></svg>`);

// Q22: Подача звукового сигнала запрещена
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(80,50,'nosound')}${car(180,105,'#36f')}<text x="210" y="95" font-size="16" fill="#F44336">🔇</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#F44336">Звуковой сигнал запрещён</text></svg>`);

// Q23: Стоянка запрещена — инвалиды
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(60,50,'nopark')}${car(180,105,'#36f')}<rect fill="#36f" x="210" y="95" width="20" height="20" rx="2"/><text x="220" y="109" text-anchor="middle" font-size="11" fill="#fff">♿</text><text x="160" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Инвалиды I и II группы — исключение</text></svg>`);

// Q24: Движение прямо
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${sign(70,35,'straight')}${car(120,75,'#36f')}<polygon points="140,30 135,45 145,45" fill="#C8FF00"/><text x="260" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Только прямо</text></svg>`);

// Q25: Круговое движение
svgs.push(`<svg viewBox="0 0 320 180">${sky}<circle cx="160" cy="100" r="50" fill="#555" stroke="#888" stroke-width="3"/><circle cx="160" cy="100" r="25" fill="#1a2a1a" stroke="#888" stroke-width="2"/><path d="M160,50 A50,50 0 0,1 210,100" fill="none" stroke="#C8FF00" stroke-width="2" stroke-dasharray="5,3"/><polygon points="210,95 215,105 205,105" fill="#C8FF00"/>${sign(50,40,'roundabout')}${car(130,55,'#36f')}</svg>`);

// Q26: Движение направо
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${sign(70,35,'right')}${car(30,80,'#36f')}<path d="M75,90 C100,90 140,80 160,50" stroke="#C8FF00" stroke-width="2" fill="none" stroke-dasharray="5,3"/><text x="260" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Только направо</text></svg>`);

// Q27: Маршрутные — исключение для предписывающих
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(80,50,'straight')}<rect fill="#ff0" x="160" y="95" width="60" height="30" rx="5"/><text x="190" y="115" text-anchor="middle" font-size="8" fill="#333">Маршрут</text><path d="M190,95 L210,75" stroke="#C8FF00" stroke-width="2" stroke-dasharray="4,3"/><text x="220" y="70" font-size="9" fill="#C8FF00">Можно!</text></svg>`);

// Q28: Велосипедная дорожка
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="110" width="200" height="30"/><rect fill="#4a7" x="200" y="110" width="120" height="30" opacity="0.5"/>${sign(200,50,'bike')}<circle cx="260" cy="118" r="8" fill="none" stroke="#C8FF00" stroke-width="2"/><circle cx="275" cy="118" r="8" fill="none" stroke="#C8FF00" stroke-width="2"/><line x1="260" y1="118" x2="268" y2="105" stroke="#C8FF00" stroke-width="2"/><text x="100" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Велосипедная дорожка</text></svg>`);

// Q29: Минимальная скорость
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><rect fill="#888" x="78" y="40" width="4" height="60"/><circle cx="80" cy="32" r="18" fill="#36f" stroke="#fff" stroke-width="2"/><text x="80" y="38" text-anchor="middle" font-size="16" font-weight="bold" fill="#fff">40</text>${car(180,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Минимум 40 км/ч</text></svg>`);

// Q30: Пешеходная дорожка
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#999" x="0" y="100" width="320" height="40"/>${sign(80,50,'pedestrian')}<circle cx="200" cy="110" r="6" fill="#C8FF00"/><line x1="200" y1="116" x2="200" y2="132" stroke="#C8FF00" stroke-width="2"/><line x1="195" y1="125" x2="205" y2="125" stroke="#C8FF00" stroke-width="2"/><circle cx="240" cy="110" r="6" fill="#C8FF00"/><line x1="240" y1="116" x2="240" y2="132" stroke="#C8FF00" stroke-width="2"/><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Только пешеходы</text></svg>`);

// Q31: Прямо или направо — разворот запрещён
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><rect fill="#888" x="68" y="30" width="4" height="40"/><circle cx="70" cy="22" r="16" fill="#36f" stroke="#fff" stroke-width="2"/><polygon points="70,10 67,18 73,18" fill="#fff"/><polygon points="80,22 74,19 74,25" fill="#fff"/>${car(30,80,'#36f')}<text x="260" y="30" font-size="10" fill="#F44336">Разворот ✗</text><text x="260" y="50" font-size="10" fill="#F44336">Налево ✗</text></svg>`);

// Q32: Сплошная линия 1.1
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="100" x2="320" y2="100" stroke="#fff" stroke-width="3"/>${car(80,78,'#36f')}<text x="160" y="55" text-anchor="middle" font-size="14" fill="#F44336">✗ Пересекать запрещено!</text>${car(200,105,'#c00')}</svg>`);

// Q33: Жёлтая прерывистая — стоянка запрещена
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="130" x2="320" y2="130" stroke="#ff0" stroke-width="3" stroke-dasharray="15,8"/>${car(140,78,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="11" fill="#ff0">1.10 — Стоянка запрещена</text></svg>`);

// Q34: Разметка 1.11 — сплошная+прерывистая
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="98" x2="320" y2="98" stroke="#fff" stroke-width="2"/><line x1="0" y1="103" x2="320" y2="103" stroke="#fff" stroke-width="2" stroke-dasharray="12,8"/>${car(80,108,'#36f')}<path d="M125,115 L140,92" stroke="#C8FF00" stroke-width="2" marker-end="url(#arr2)"/><defs><marker id="arr2" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><polygon points="0,0 6,2 0,4" fill="#C8FF00"/></marker></defs><text x="200" y="88" font-size="9" fill="#C8FF00">Можно со стороны прерывистой</text></svg>`);

// Q35: Стрелки разметки 1.18
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="50" width="320" height="100"/><line x1="107" y1="50" x2="107" y2="150" stroke="#fff" stroke-width="2"/><line x1="213" y1="50" x2="213" y2="150" stroke="#fff" stroke-width="2"/><polygon points="55,70 50,85 60,85" fill="#fff"/><polygon points="160,70 155,85 165,85" fill="#fff"/><polygon points="160,85 155,85 165,85 165,90 175,80 165,70 165,75 155,75 155,70 145,80 155,90 155,85" fill="#fff"/><polygon points="270,75 260,85 265,85 265,95 275,95 275,85 280,85" fill="#fff" transform="rotate(45,270,85)"/><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Разметка 1.18 — направления по полосам</text></svg>`);

// Q36: Вафельная разметка
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><rect fill="#ff02" x="100" y="70" width="80" height="60"/><line x1="110" y1="70" x2="110" y2="130" stroke="#ff0" stroke-width="1"/><line x1="120" y1="70" x2="120" y2="130" stroke="#ff0" stroke-width="1"/><line x1="130" y1="70" x2="130" y2="130" stroke="#ff0" stroke-width="1"/><line x1="140" y1="70" x2="140" y2="130" stroke="#ff0" stroke-width="1"/><line x1="150" y1="70" x2="150" y2="130" stroke="#ff0" stroke-width="1"/><line x1="160" y1="70" x2="160" y2="130" stroke="#ff0" stroke-width="1"/><line x1="170" y1="70" x2="170" y2="130" stroke="#ff0" stroke-width="1"/><line x1="100" y1="80" x2="180" y2="80" stroke="#ff0" stroke-width="1"/><line x1="100" y1="90" x2="180" y2="90" stroke="#ff0" stroke-width="1"/><line x1="100" y1="100" x2="180" y2="100" stroke="#ff0" stroke-width="1"/><line x1="100" y1="110" x2="180" y2="110" stroke="#ff0" stroke-width="1"/><line x1="100" y1="120" x2="180" y2="120" stroke="#ff0" stroke-width="1"/><text x="160" y="170" text-anchor="middle" font-size="10" fill="#ff0">1.26 — Вафельница</text></svg>`);

// Q37: Двойная сплошная 1.3
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="50" width="320" height="100"/><line x1="0" y1="98" x2="320" y2="98" stroke="#fff" stroke-width="2"/><line x1="0" y1="103" x2="320" y2="103" stroke="#fff" stroke-width="2"/>${car(50,60,'#36f')}${car(100,60,'#09f')}${car(180,115,'#c00')}${car(230,115,'#f80')}<text x="160" y="30" text-anchor="middle" font-size="10" fill="#C8FF00">1.3 — Двойная сплошная (4+ полос)</text></svg>`);

// Q38: Зебра
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${zebra(120,80)}<circle cx="140" cy="65" r="6" fill="#C8FF00"/><line x1="140" y1="71" x2="140" y2="95" stroke="#C8FF00" stroke-width="2"/><line x1="135" y1="82" x2="145" y2="82" stroke="#C8FF00" stroke-width="2"/><line x1="140" y1="95" x2="135" y2="108" stroke="#C8FF00" stroke-width="2"/><line x1="140" y1="95" x2="145" y2="108" stroke="#C8FF00" stroke-width="2"/>${car(200,78,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">1.14 — Пешеходный переход</text></svg>`);

// Q39: Жёлтый зигзаг 1.17
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><path d="M80,130 L95,125 L110,130 L125,125 L140,130 L155,125 L170,130 L185,125 L200,130" fill="none" stroke="#ff0" stroke-width="3"/><rect fill="#ff0" x="100" y="95" width="60" height="30" rx="5"/><text x="130" y="115" text-anchor="middle" font-size="8" fill="#333">Автобус</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#ff0">1.17 — Остановка маршрутных ТС</text></svg>`);

// Q40: Красный + зелёная стрелка
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><rect fill="#888" x="158" y="60" width="4" height="50"/><rect fill="#222" x="148" y="20" width="24" height="40" rx="3"/><circle cx="160" cy="30" r="6" fill="#f44"/><circle cx="160" cy="42" r="6" fill="#333"/><circle cx="160" cy="54" r="6" fill="#333"/><rect fill="#222" x="172" y="46" width="18" height="14" rx="2"/><polygon points="186,53 178,48 178,58" fill="#4f4"/>${car(80,105,'#36f')}<path d="M125,110 L150,100 L180,95" stroke="#C8FF00" stroke-width="2" stroke-dasharray="4,3"/><text x="260" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Направо можно, но уступи!</text></svg>`);

// Q41: Красный + жёлтый
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><rect fill="#888" x="158" y="50" width="4" height="60"/><rect fill="#222" x="148" y="15" width="24" height="35" rx="3"/><circle cx="160" cy="24" r="6" fill="#f44"/><circle cx="160" cy="36" r="6" fill="#ff0"/><circle cx="160" cy="48" r="6" fill="#333"/>${car(60,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#ff0">Красный+жёлтый = скоро зелёный</text></svg>`);

// Q42: Пешеходный светофор
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><rect fill="#888" x="158" y="40" width="4" height="70"/><rect fill="#222" x="150" y="20" width="20" height="25" rx="3"/><circle cx="160" cy="28" r="6" fill="#333"/><circle cx="160" cy="40" r="6" fill="#4f4"/><circle cx="155" cy="38" r="2" fill="#4f4"/><line x1="160" y1="33" x2="160" y2="43" stroke="#4f4" stroke-width="1.5"/><circle cx="200" cy="108" r="6" fill="#C8FF00"/><line x1="200" y1="114" x2="200" y2="128" stroke="#C8FF00" stroke-width="2"/><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Только для пешеходов</text></svg>`);

// Q43: Жёлтый мигающий
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="80" width="320" height="50"/>${trafficLight(140,15,'yellow')}<text x="175" y="35" font-size="18" fill="#ff0">⚡</text>${car(20,85,'#36f')}${car(210,90,'#c00')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#ff0">Нерегулируемый перекрёсток</text></svg>`);

// Q44: Рука регулировщика вверх
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><circle cx="160" cy="55" r="10" fill="#C8FF00"/><line x1="160" y1="65" x2="160" y2="95" stroke="#C8FF00" stroke-width="3"/><line x1="160" y1="75" x2="145" y2="85" stroke="#C8FF00" stroke-width="2"/><line x1="160" y1="65" x2="160" y2="40" stroke="#C8FF00" stroke-width="2"/><rect fill="#333" x="155" y="35" width="10" height="12" rx="2"/>${car(40,105,'#36f')}${car(230,105,'#c00')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#F44336">СТОП для всех!</text></svg>`);

// Q45: Приоритет регулировщика
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><circle cx="160" cy="60" r="10" fill="#C8FF00"/><line x1="160" y1="70" x2="160" y2="100" stroke="#C8FF00" stroke-width="3"/><line x1="140" y1="80" x2="180" y2="80" stroke="#C8FF00" stroke-width="2"/>${trafficLight(80,30,'green')}<line x1="95" y1="30" x2="115" y2="60" stroke="#F44336" stroke-width="3"/><line x1="115" y1="30" x2="95" y2="60" stroke="#F44336" stroke-width="3"/><text x="260" y="30" font-size="9" fill="#C8FF00">Регулировщик &gt;</text><text x="260" y="45" font-size="9" fill="#C8FF00">светофор &gt; знаки</text></svg>`);

// Q46: Реверсивный светофор
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="50" width="320" height="100"/><line x1="107" y1="50" x2="107" y2="150" stroke="#fff" stroke-width="2"/><line x1="213" y1="50" x2="213" y2="150" stroke="#fff" stroke-width="2"/><rect fill="#222" x="145" y="10" width="30" height="20" rx="3"/><text x="153" y="24" font-size="14" fill="#f44">✗</text><text x="167" y="24" font-size="14" fill="#4f4">↓</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Реверсивные полосы</text></svg>`);

// Q47: Зелёный загорелся — уступи завершающим
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="80" width="320" height="50"/>${trafficLight(95,10,'green')}${car(110,40,'#c00')}<path d="M135,55 C150,60 160,90 155,110" stroke="#ff0" stroke-width="2" stroke-dasharray="4,3"/><text x="175" y="50" font-size="8" fill="#ff0">Завершает манёвр</text>${car(20,85,'#36f')}<text x="55" y="83" font-size="8" fill="#C8FF00">Ждёт</text></svg>`);

// Q48: Поворот налево на зелёный — уступи встречным
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${trafficLight(95,10,'green')}${car(30,80,'#36f')}<path d="M75,85 C110,85 120,50 140,30" stroke="#C8FF00" stroke-width="2" stroke-dasharray="4,3"/>${car(130,105,'#c00',true)}<text x="165" y="100" font-size="8" fill="#c00">←</text><text x="260" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Уступи встречным прямо/направо</text></svg>`);

// Q49: Трамвай на равнозначном
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="140" y1="0" x2="140" y2="180" stroke="#888" stroke-width="2"/><rect fill="#c00" x="120" y="20" width="40" height="55" rx="5"/><text x="140" y="50" text-anchor="middle" font-size="9" fill="#fff">Трамвай</text>${car(20,80,'#36f')}<text x="260" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Трамвай = всегда преимущество</text></svg>`);

// Q50: Затор на перекрёстке
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${car(190,75,'#c00')}${car(235,75,'#f80')}${car(280,75,'#c00')}<text x="250" y="70" text-anchor="middle" font-size="10" fill="#F44336">Затор!</text>${car(30,80,'#36f')}<text x="55" y="78" font-size="8" fill="#F44336">✗</text><text x="160" y="170" text-anchor="middle" font-size="9" fill="#F44336">Въезд запрещён при заторе</text></svg>`);

// Q51: Поворот направо — пешеходы
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${zebra(180,80,40)}${car(30,80,'#36f')}<path d="M75,90 C100,90 130,80 180,50" stroke="#C8FF00" stroke-width="2" fill="none" stroke-dasharray="4,3"/><circle cx="200" cy="80" r="5" fill="#C8FF00"/><line x1="200" y1="85" x2="200" y2="100" stroke="#C8FF00" stroke-width="2"/><text x="260" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Уступи пешеходам!</text></svg>`);

// Q52: Главная прямо vs встречный налево
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${sign(70,35,'main')}${car(20,80,'#36f')}<text x="45" y="78" font-size="8" fill="#C8FF00">→ Прямо</text>${car(130,105,'#c00',true)}<path d="M130,115 C115,115 110,95 120,50" stroke="#888" stroke-width="1.5" stroke-dasharray="3,3"/><text x="260" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Я прямо — я первый</text></svg>`);

// Q53: Регулировщик боком
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><circle cx="160" cy="55" r="10" fill="#C8FF00"/><line x1="160" y1="65" x2="160" y2="95" stroke="#C8FF00" stroke-width="3"/><line x1="140" y1="80" x2="180" y2="80" stroke="#C8FF00" stroke-width="2"/><rect fill="#333" x="175" y="76" width="12" height="4" rx="1"/>${car(40,105,'#36f')}<polygon points="85,110 95,105 95,115" fill="#C8FF00"/><text x="260" y="50" font-size="10" fill="#C8FF00">Прямо ✓</text><text x="260" y="65" font-size="10" fill="#C8FF00">Направо ✓</text></svg>`);

// Q54: Круговое + уступи
svgs.push(`<svg viewBox="0 0 320 180">${sky}<circle cx="170" cy="95" r="45" fill="#555" stroke="#888" stroke-width="2"/><circle cx="170" cy="95" r="20" fill="#1a2a1a"/>${sign(60,40,'roundabout')}${sign(60,80,'yield')}${car(140,55,'#c00')}<path d="M145,65 A40,40 0 0,1 205,85" fill="none" stroke="#C8FF00" stroke-width="1.5" stroke-dasharray="3,3"/>${car(100,100,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Уступи тем, кто на кольце</text></svg>`);

// Q55: Регулируемый перекрёсток
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="100" y="0" width="80" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${trafficLight(95,10,'green')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Работает светофор = регулируемый</text>${car(20,80,'#36f')}${car(210,85,'#c00')}</svg>`);

// Q56: Обгон запрещён где
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="100" x2="320" y2="100" stroke="#fff" stroke-width="3"/>${zebra(120,80)}<rect fill="#666" x="40" y="60" width="70" height="15" rx="2"/><text x="75" y="70" text-anchor="middle" font-size="7" fill="#fff">Мост</text><rect fill="#444" x="230" y="50" width="60" height="80" rx="5"/><text x="260" y="95" text-anchor="middle" font-size="7" fill="#fff">Тоннель</text><text x="160" y="170" text-anchor="middle" font-size="9" fill="#F44336">Обгон запрещён: переход, мост, тоннель</text></svg>`);

// Q57: Обгон на подъёме
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><polygon points="0,140 160,60 320,140" fill="#555"/><line x1="0" y1="130" x2="160" y2="55" stroke="#fff" stroke-width="2"/>${car(200,80,'#36f')}<text x="280" y="60" font-size="14" fill="#F44336">⛰️</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#F44336">Обгон в конце подъёма запрещён</text></svg>`);

// Q58: Перед обгоном — убедись
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="100" x2="320" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="12,8"/>${car(80,105,'#36f')}<path d="M125,110 C145,85 165,85 185,105" stroke="#C8FF00" stroke-width="2" stroke-dasharray="4,3"/>${car(200,105,'#c00')}<rect fill="#F44" x="260" y="75" width="40" height="20" rx="3"/><text x="280" y="89" text-anchor="middle" font-size="8" fill="#fff">← ?</text><text x="160" y="30" text-anchor="middle" font-size="10" fill="#C8FF00">Встречная свободна?</text></svg>`);

// Q59: Запрет препятствовать обгону
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="100" x2="320" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="12,8"/>${car(140,105,'#c00')}<text x="180" y="103" font-size="10" fill="#F44336">≠ ускоряться!</text>${car(80,78,'#36f')}<path d="M125,85 L185,85" stroke="#C8FF00" stroke-width="2" marker-end="url(#arr3)"/><defs><marker id="arr3" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto"><polygon points="0,0 6,2 0,4" fill="#C8FF00"/></marker></defs></svg>`);

// Q60: Встречная на 4+ полосах
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="40" width="320" height="110"/><line x1="0" y1="95" x2="320" y2="95" stroke="#fff" stroke-width="2"/><line x1="0" y1="98" x2="320" y2="98" stroke="#fff" stroke-width="2"/><line x1="0" y1="70" x2="320" y2="70" stroke="#fff" stroke-width="1" stroke-dasharray="10,8"/><line x1="0" y1="125" x2="320" y2="125" stroke="#fff" stroke-width="1" stroke-dasharray="10,8"/>${car(60,50,'#36f')}${car(120,105,'#c00')}${car(200,105,'#f80')}<text x="160" y="170" text-anchor="middle" font-size="9" fill="#F44336">4+ полос — на встречную нельзя</text></svg>`);

// Q61: Тихоходное ТС + обгон запрещён
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="100" x2="320" y2="100" stroke="#fff" stroke-width="3"/>${sign(40,30,'noovertake')}<rect fill="#f80" x="180" y="78" width="50" height="28" rx="4"/><polygon points="220,78 230,68 210,68" fill="#f80" stroke="#F44" stroke-width="2"/><text x="215" y="73" text-anchor="middle" font-size="7" fill="#fff">ТХ</text>${car(80,78,'#36f')}<path d="M125,85 C145,72 165,72 180,85" stroke="#C8FF00" stroke-width="2" stroke-dasharray="3,3"/><text x="160" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Тихоходное — можно обогнать</text></svg>`);

// Q62: Опережение
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="50" width="320" height="100"/><line x1="107" y1="50" x2="107" y2="150" stroke="#fff" stroke-width="2" stroke-dasharray="10,8"/><line x1="213" y1="50" x2="213" y2="150" stroke="#fff" stroke-width="2" stroke-dasharray="10,8"/><line x1="160" y1="50" x2="160" y2="150" stroke="#fff" stroke-width="3"/>${car(60,60,'#36f')}<text x="83" y="58" font-size="10" fill="#C8FF00">→→</text>${car(130,60,'#c00')}<text x="153" y="58" font-size="8" fill="#888">→</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Опережение ≠ обгон</text></svg>`);

// Q63: Обгон справа
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="50" width="320" height="100"/><line x1="160" y1="50" x2="160" y2="150" stroke="#fff" stroke-width="3"/><line x1="80" y1="50" x2="80" y2="150" stroke="#fff" stroke-width="1" stroke-dasharray="10,8"/><line x1="240" y1="50" x2="240" y2="150" stroke="#fff" stroke-width="1" stroke-dasharray="10,8"/>${car(90,65,'#c00')}${car(195,65,'#36f')}<text x="218" y="63" font-size="10" fill="#C8FF00">→→</text><text x="160" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Обгон = встречная. Справа = опережение</text></svg>`);

// Q64: 5м до перехода
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/>${zebra(180,80)}<line x1="175" y1="65" x2="175" y2="135" stroke="#ff0" stroke-width="1"/><text x="145" y="65" text-anchor="middle" font-size="10" fill="#C8FF00">5м</text><line x1="130" y1="70" x2="175" y2="70" stroke="#C8FF00" stroke-width="1" stroke-dasharray="3,2"/>${car(60,78,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Не менее 5м до перехода</text></svg>`);

// Q65: Остановка на мостах
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a3a" width="320" height="130"/><rect fill="#369" x="0" y="130" width="320" height="50"/><path d="M0,110 Q80,80 160,110 Q240,140 320,110" fill="#666" stroke="#888" stroke-width="2"/><line x1="40" y1="110" x2="40" y2="130" stroke="#888" stroke-width="4"/><line x1="160" y1="100" x2="160" y2="130" stroke="#888" stroke-width="4"/><line x1="280" y1="110" x2="280" y2="130" stroke="#888" stroke-width="4"/>${car(120,92,'#36f')}<text x="160" y="85" text-anchor="middle" font-size="14" fill="#F44336">P ✗</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#F44336">Мост — остановка запрещена</text></svg>`);

// Q66: 50м от ж/д
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="100" width="320" height="40"/><rect fill="#888" x="248" y="20" width="4" height="120"/><line x1="235" y1="30" x2="265" y2="30" stroke="#fff" stroke-width="4"/><line x1="235" y1="35" x2="265" y2="35" stroke="#c00" stroke-width="3"/><circle cx="250" cy="50" r="8" fill="#f44"/><text x="180" y="95" text-anchor="middle" font-size="12" fill="#C8FF00">← 50м →</text>${car(60,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Стоянка — не ближе 50м от ж/д</text></svg>`);

// Q67: Стоянка запрещена — остановка до 5 мин ОК
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(80,50,'nopark')}${car(180,105,'#36f')}<text x="220" y="100" font-size="12" fill="#C8FF00">⏱ 5 мин</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">До 5 минут — можно</text></svg>`);

// Q68: Стоянка у правого края
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="70" width="320" height="60"/><line x1="0" y1="100" x2="320" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="12,8"/>${car(80,108,'#36f')}${car(140,108,'#09f')}${car(200,108,'#888')}<rect fill="#777" x="0" y="130" width="320" height="10"/><text x="160" y="165" text-anchor="middle" font-size="10" fill="#C8FF00">У правого края / на обочине</text></svg>`);

// Q69: Остановка на остановке маршрутных
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="80" width="320" height="50"/><path d="M80,130 L95,125 L110,130 L125,125 L140,130 L155,125 L170,130" fill="none" stroke="#ff0" stroke-width="3"/>${sign(60,30,'pedestrian')}${car(180,85,'#36f')}<circle cx="210" cy="90" r="5" fill="#C8FF00"/><line x1="210" y1="95" x2="210" y2="105" stroke="#C8FF00" stroke-width="2"/><text x="260" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Посадка/высадка — можно</text></svg>`);

// Q70: Автомагистраль — только площадки
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="60" width="320" height="80"/><rect fill="#1a2a1a" x="155" y="60" width="10" height="80"/><line x1="80" y1="100" x2="320" y2="100" stroke="#fff" stroke-width="2" stroke-dasharray="12,8"/><rect fill="#36f" x="30" y="15" width="60" height="35" rx="4"/><text x="60" y="38" text-anchor="middle" font-size="10" fill="#fff">M</text>${car(200,70,'#36f')}<rect fill="#666" x="260" y="140" width="50" height="30" rx="3"/><text x="285" y="158" text-anchor="middle" font-size="7" fill="#fff">Площадка</text><text x="160" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Только на спец. площадках</text></svg>`);

// Q71: Стоянка на подъёме — колёса
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><polygon points="0,140 320,80 320,140" fill="#555"/><rect fill="#888" x="0" y="140" width="320" height="5"/>${car(120,100,'#36f')}<path d="M133,128 L140,122" stroke="#C8FF00" stroke-width="2"/><text x="150" y="118" font-size="8" fill="#C8FF00">↗ колёса</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">На подъёме — колёса от бордюра</text></svg>`);

// Q72: 60 км/ч в городе
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><rect fill="#888" x="58" y="30" width="4" height="70"/><rect fill="#fff" x="40" y="10" width="40" height="30" rx="2"/><text x="60" y="30" text-anchor="middle" font-size="12" fill="#333">Город</text>${sign(160,50,'speed60')}${car(220,105,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="11" fill="#C8FF00">В городе — макс 60 км/ч</text></svg>`);

// Q73: 110 на автомагистрали
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="60" width="320" height="80"/><rect fill="#1a2a1a" x="155" y="60" width="10" height="80"/>${sign(60,20,'speed110')}${car(180,70,'#36f')}<text x="210" y="68" font-size="10" fill="#C8FF00">→→→</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Автомагистраль — 110 км/ч</text></svg>`);

// Q74: 90 вне города
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#555" x="0" y="100" width="320" height="40"/><rect fill="#4a7c59" x="0" y="140" width="320" height="40"/>${sign(80,50,'speed90')}${car(180,105,'#36f')}<rect fill="#4a7c59" x="250" y="50" width="40" height="50" rx="3"/><rect fill="#4a7c59" x="260" y="30" width="30" height="70" rx="15"/><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Вне города — 90 км/ч</text></svg>`);

// Q75: Буксировка 50 км/ч
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="80" width="320" height="50"/>${car(80,85,'#36f')}${car(180,85,'#888')}<line x1="125" y1="95" x2="180" y2="95" stroke="#ff0" stroke-width="3"/><circle cx="153" cy="92" r="3" fill="#ff0"/>${sign(270,30,'speed50')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Буксировка — макс 50 км/ч</text></svg>`);

// Q76: 20 км/ч в жилой зоне
svgs.push(`<svg viewBox="0 0 320 180">${sky}<rect fill="#777" x="0" y="110" width="320" height="30"/><rect fill="#aaa" x="30" y="30" width="60" height="80" rx="3"/><rect fill="#ff0" x="40" y="40" width="12" height="12"/><rect fill="#ff0" x="58" y="40" width="12" height="12"/><rect fill="#ff0" x="40" y="60" width="12" height="12"/><rect fill="#ff0" x="58" y="60" width="12" height="12"/><rect fill="#aaa" x="220" y="40" width="60" height="70" rx="3"/><rect fill="#ff0" x="230" y="50" width="12" height="12"/><rect fill="#ff0" x="248" y="50" width="12" height="12"/>${sign(150,50,'speed20')}${car(160,115,'#36f')}<text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">Жилая зона — 20 км/ч</text></svg>`);

// Q77: Ненаказуемый порог +20
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="100" width="320" height="40"/>${sign(60,50,'speed60')}${car(180,105,'#36f')}<rect fill="#222" x="220" y="40" width="70" height="40" rx="8"/><text x="255" y="55" text-anchor="middle" font-size="10" fill="#C8FF00">79</text><text x="255" y="72" text-anchor="middle" font-size="8" fill="#888">км/ч</text><text x="160" y="170" text-anchor="middle" font-size="10" fill="#C8FF00">До +20 — без штрафа</text></svg>`);

// Q78: Грузовые на магистрали 90
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="60" width="320" height="80"/><rect fill="#1a2a1a" x="155" y="60" width="10" height="80"/><rect fill="#c00" x="60" y="68" width="70" height="35" rx="4"/><rect fill="#222" x="68" y="103" width="12" height="6" rx="3"/><rect fill="#222" x="108" y="103" width="12" height="6" rx="3"/><text x="95" y="90" text-anchor="middle" font-size="10" fill="#fff">&gt;3.5т</text>${sign(250,20,'speed90')}<text x="160" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Грузовые &gt;3.5т → макс 90 на магистрали</text></svg>`);

// Q79: Контроль за движением
svgs.push(`<svg viewBox="0 0 320 180"><rect fill="#1a2a1a" width="320" height="180"/><rect fill="#555" x="0" y="80" width="320" height="50"/><line x1="0" y1="105" x2="320" y2="105" stroke="#fff" stroke-width="2" stroke-dasharray="12,8"/>${car(140,85,'#36f')}<circle cx="160" cy="40" r="25" fill="#222" stroke="#C8FF00" stroke-width="2"/><line x1="160" y1="40" x2="160" y2="25" stroke="#C8FF00" stroke-width="2"/><line x1="160" y1="40" x2="172" y2="45" stroke="#888" stroke-width="1.5"/><text x="160" y="44" text-anchor="middle" font-size="7" fill="#C8FF00">км/ч</text><text x="160" y="170" text-anchor="middle" font-size="9" fill="#C8FF00">Контроль за движением ТС</text></svg>`);

// Output as JSON array of strings
console.log('var SVGS=[');
svgs.forEach((s, i) => {
  const escaped = s.replace(/'/g, "\\'");
  console.log(`'${escaped}'${i < svgs.length - 1 ? ',' : ''}`);
});
console.log('];');
