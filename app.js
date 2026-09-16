const savedKey = 'study-pocket-saved';
const progressKey = 'study-pocket-progress';
const lastTopicKey = 'study-pocket-last-topic';
const state = {
  subjects: window.STUDY_CONTENT?.subjects || [],
  saved: readJson(savedKey, []),
  progress: readJson(progressKey, {}),
  lastTopic: localStorage.getItem(lastTopicKey) || ''
};
const screen = document.getElementById('screen');

function readJson(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function saveState() {
  localStorage.setItem(savedKey, JSON.stringify(state.saved));
  localStorage.setItem(progressKey, JSON.stringify(state.progress));
  if (state.lastTopic) localStorage.setItem(lastTopicKey, state.lastTopic);
}

function esc(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char]));
}

function text(value) { return esc(value).replace(/\n/g, '<br>'); }
function subjectById(id) { return state.subjects.find((subject) => subject.id === id); }
function topicById(subjectId, topicId) { return subjectById(subjectId)?.topics.find((topic) => topic.id === topicId); }
function topicKey(subjectId, topicId) { return `${subjectId}/${topicId}`; }
function isDone(subjectId, topicId) { return Boolean(state.progress[topicKey(subjectId, topicId)]); }
function pluralTopics(count) { return count === 1 ? 'тема' : count < 5 ? 'темы' : 'тем'; }
function allTopics() { return state.subjects.flatMap((subject) => subject.topics.map((topic, index) => ({ subject, topic, index }))); }

function setRoute(route) {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.route === route));
}

function diagramMarkup(type) {
  const diagrams = {
    'number-line': `<svg class="lesson-diagram" viewBox="0 0 420 150" role="img" aria-label="Числовая прямая с положительными и отрицательными числами"><title>Числовая прямая</title><path d="M45 85H375" stroke="#7581aa" stroke-width="3"/><path d="M75 75V95M145 75V95M210 70V100M275 75V95M345 75V95" stroke="#54dfbf" stroke-width="2"/><polygon points="375,85 361,78 361,92" fill="#54dfbf"/><text x="65" y="120" class="diagram-label">−2</text><text x="135" y="120" class="diagram-label">−1</text><text x="205" y="120" class="diagram-label">0</text><text x="267" y="120" class="diagram-label">1</text><text x="338" y="120" class="diagram-label">2</text><circle cx="240" cy="85" r="6" fill="#ffcb6b"/><text x="228" y="55" class="diagram-label">1/2</text></svg>`,
    units: `<svg class="lesson-diagram" viewBox="0 0 420 160" role="img" aria-label="Связь физической величины с числом и единицей измерения"><title>Физическая величина</title><rect x="52" y="55" width="92" height="48" rx="10" fill="#9b92ff" opacity=".25" stroke="#9b92ff"/><rect x="164" y="55" width="92" height="48" rx="10" fill="#54dfbf" opacity=".2" stroke="#54dfbf"/><rect x="276" y="55" width="92" height="48" rx="10" fill="#ffcb6b" opacity=".2" stroke="#ffcb6b"/><text x="76" y="85" class="diagram-label">величина</text><text x="198" y="85" class="diagram-label">число</text><text x="310" y="85" class="diagram-label">единица</text><path d="M144 79H164M256 79H276" stroke="#fff" stroke-width="2"/><text x="164" y="135" class="diagram-label">5 м = 5 × метр</text></svg>`,
    lab: `<svg class="lesson-diagram" viewBox="0 0 420 160" role="img" aria-label="Базовые правила лабораторной безопасности"><title>Безопасность в лаборатории</title><path d="M130 35H185V60L208 117Q211 128 199 132H116Q104 128 107 117L130 60Z" fill="#54dfbf" opacity=".2" stroke="#54dfbf" stroke-width="3"/><path d="M280 38L317 72M317 38L280 72" stroke="#ffcb6b" stroke-width="7" stroke-linecap="round"/><circle cx="299" cy="55" r="38" fill="none" stroke="#ffcb6b" stroke-width="3"/><text x="112" y="151" class="diagram-label">не пробовать и не вдыхать</text><text x="274" y="105" class="diagram-label">очки</text></svg>`,
    space: `<svg class="lesson-diagram" viewBox="0 0 420 170" role="img" aria-label="Точка на прямой и прямая на плоскости"><path d="M68 125L205 45L355 110L215 160Z" fill="#9b92ff" opacity=".16" stroke="#9b92ff" stroke-width="3"/><path d="M80 135L340 75" stroke="#54dfbf" stroke-width="4"/><circle cx="205" cy="106" r="7" fill="#ffcb6b"/><text x="215" y="103" class="diagram-label">A ∈ a</text><text x="160" y="142" class="diagram-label">a ⊂ α</text></svg>`,
    matrix: `<svg class="lesson-diagram" viewBox="0 0 420 150" role="img" aria-label="Схема матрицы со строками и столбцами"><title>Строки и столбцы матрицы</title><rect x="150" y="35" width="120" height="80" rx="8" fill="#1b2440" stroke="#9b92ff"/><path d="M190 35v80M230 35v80M150 75h120" stroke="#7481b7"/><text x="170" y="60">a₁₁</text><text x="210" y="60">a₁₂</text><text x="250" y="60">a₁₃</text><text x="170" y="100">a₂₁</text><text x="210" y="100">a₂₂</text><text x="250" y="100">a₂₃</text><text x="205" y="22" class="diagram-label">столбцы</text><text x="90" y="79" class="diagram-label">строки</text><path d="M122 50h20M122 95h20" stroke="#54dfbf" stroke-width="2"/><polygon points="142,50 135,46 135,54" fill="#54dfbf"/><polygon points="142,95 135,91 135,99" fill="#54dfbf"/></svg>`,
    determinant: `<svg class="lesson-diagram" viewBox="0 0 420 150" role="img" aria-label="Определитель два на два с диагоналями"><title>Определитель второго порядка</title><rect x="145" y="25" width="130" height="100" fill="#1b2440" stroke="#9b92ff" stroke-width="2"/><path d="M210 25v100M145 75h130" stroke="#7481b7"/><path d="M155 35L265 115M265 35L155 115" stroke="#54dfbf" stroke-width="3" opacity=".9"/><text x="171" y="63">a</text><text x="235" y="63">b</text><text x="171" y="105">c</text><text x="235" y="105">d</text><text x="95" y="31" class="diagram-label">ad</text><text x="292" y="31" class="diagram-label">− bc</text></svg>`,
    graph: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Координатная плоскость с параболой"><title>График функции</title><path d="M48 145H382M210 160V18" stroke="#7581aa" stroke-width="2"/><path d="M76 130 Q132 32 210 112 Q288 32 344 130" fill="none" stroke="#9b92ff" stroke-width="4"/><circle cx="210" cy="112" r="5" fill="#54dfbf"/><text x="370" y="140" class="diagram-label">x</text><text x="217" y="26" class="diagram-label">y</text><text x="218" y="132" class="diagram-label">вершина</text></svg>`,
    limit: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="График функции, приближающейся к точке предела"><title>Предел функции</title><path d="M48 145H382M210 160V18" stroke="#7581aa" stroke-width="2"/><path d="M70 135 C110 120 132 82 170 70 C188 64 198 50 210 50 C236 50 254 76 278 91 C306 109 331 125 356 132" fill="none" stroke="#9b92ff" stroke-width="4"/><circle cx="210" cy="50" r="7" fill="#0d1020" stroke="#ffcb6b" stroke-width="3"/><path d="M210 50V145M48 50H210" stroke="#54dfbf" stroke-dasharray="6 6"/><text x="218" y="46" class="diagram-label">L</text><text x="371" y="140" class="diagram-label">x</text></svg>`,
    integral: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Площадь под графиком, выделенная как интеграл"><title>Определённый интеграл как площадь</title><path d="M45 145H380M70 160V18" stroke="#7581aa" stroke-width="2"/><path d="M78 132 Q128 38 188 62 Q254 84 334 38 L334 145 L78 145Z" fill="#54dfbf" opacity=".2"/><path d="M78 132 Q128 38 188 62 Q254 84 334 38" fill="none" stroke="#9b92ff" stroke-width="4"/><path d="M78 145V132M334 145V38" stroke="#ffcb6b" stroke-width="2" stroke-dasharray="5 5"/><text x="192" y="165" class="diagram-label">площадь = ∫ₐᵇ f(x)dx</text></svg>`,
    vector: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Вектор на координатной плоскости"><title>Вектор и его проекции</title><path d="M45 145H380M70 160V18" stroke="#7581aa" stroke-width="2"/><path d="M75 140L300 55" stroke="#9b92ff" stroke-width="4"/><polygon points="300,55 285,57 292,70" fill="#9b92ff"/><path d="M75 140H300M300 140V55" stroke="#54dfbf" stroke-dasharray="7 6" stroke-width="2"/><text x="310" y="51" class="diagram-label">⃗a</text><text x="183" y="158" class="diagram-label">aₓ</text><text x="308" y="103" class="diagram-label">aᵧ</text></svg>`,
    complex: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Комплексная плоскость с числом a плюс bi"><title>Комплексная плоскость</title><path d="M45 145H380M210 160V18" stroke="#7581aa" stroke-width="2"/><path d="M210 145L305 70" stroke="#9b92ff" stroke-width="4"/><polygon points="305,70 291,74 299,84" fill="#9b92ff"/><path d="M305 70V145M210 145H305" stroke="#54dfbf" stroke-dasharray="6 6"/><circle cx="305" cy="70" r="5" fill="#ffcb6b"/><text x="312" y="68" class="diagram-label">a + bi</text><text x="218" y="26" class="diagram-label">Im</text><text x="367" y="140" class="diagram-label">Re</text></svg>`,
    motion: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="График координаты от времени"><title>График равномерного движения</title><path d="M55 145H380M75 160V18" stroke="#7581aa" stroke-width="2"/><path d="M80 132L335 45" stroke="#9b92ff" stroke-width="4"/><circle cx="80" cy="132" r="5" fill="#54dfbf"/><circle cx="335" cy="45" r="5" fill="#54dfbf"/><text x="364" y="140" class="diagram-label">t</text><text x="82" y="28" class="diagram-label">x</text><text x="217" y="90" class="diagram-label">наклон = скорость</text></svg>`,
    freebody: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Диаграмма сил для бруска"><title>Диаграмма сил</title><rect x="170" y="70" width="80" height="55" rx="8" fill="#272e4e" stroke="#9b92ff" stroke-width="3"/><path d="M210 70V25M210 125V165M170 98H105M250 98H315" stroke="#54dfbf" stroke-width="3"/><polygon points="210,25 203,39 217,39" fill="#54dfbf"/><polygon points="210,165 203,151 217,151" fill="#54dfbf"/><polygon points="105,98 119,91 119,105" fill="#54dfbf"/><polygon points="315,98 301,91 301,105" fill="#54dfbf"/><text x="220" y="31" class="diagram-label">N</text><text x="218" y="160" class="diagram-label">mg</text><text x="112" y="88" class="diagram-label">трение</text><text x="264" y="88" class="diagram-label">F</text></svg>`,
    energy: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Переход потенциальной энергии в кинетическую"><title>Сохранение энергии</title><path d="M70 35V145H350" stroke="#7581aa" stroke-width="2"/><path d="M70 35H350" stroke="#ffcb6b" stroke-dasharray="7 6"/><rect x="105" y="55" width="52" height="90" rx="6" fill="#9b92ff"/><rect x="230" y="102" width="52" height="43" rx="6" fill="#54dfbf"/><text x="101" y="25" class="diagram-label">E = const</text><text x="106" y="164" class="diagram-label">Eₚ</text><text x="230" y="164" class="diagram-label">Eₖ</text><path d="M182 75L218 75" stroke="#ffcb6b" stroke-width="3"/><polygon points="218,75 205,68 205,82" fill="#ffcb6b"/></svg>`,
    collision: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Два тела до и после столкновения"><title>Сохранение импульса</title><path d="M40 85H380" stroke="#7581aa" stroke-width="2"/><circle cx="120" cy="85" r="24" fill="#9b92ff"/><circle cx="300" cy="85" r="18" fill="#54dfbf"/><path d="M145 85H200M277 85H225" stroke="#ffcb6b" stroke-width="3"/><polygon points="200,85 187,78 187,92" fill="#ffcb6b"/><polygon points="225,85 238,78 238,92" fill="#ffcb6b"/><text x="83" y="45" class="diagram-label">до</text><text x="278" y="45" class="diagram-label">после</text><text x="146" y="133" class="diagram-label">Σpдо = Σpпосле</text></svg>`,
    torque: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Плечо силы и момент на рычаге"><title>Момент силы</title><circle cx="90" cy="125" r="10" fill="#ffcb6b"/><path d="M90 125L330 125" stroke="#9b92ff" stroke-width="8"/><path d="M330 125V45" stroke="#54dfbf" stroke-width="4"/><polygon points="330,45 323,59 337,59" fill="#54dfbf"/><path d="M90 150H330" stroke="#54dfbf" stroke-dasharray="6 6"/><text x="196" y="145" class="diagram-label">плечо l</text><text x="339" y="50" class="diagram-label">F</text><text x="54" y="118" class="diagram-label">ось</text><text x="155" y="35" class="diagram-label">M = F·l</text></svg>`,
    orbit: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Спутник на круговой орбите"><title>Гравитация и орбита</title><ellipse cx="210" cy="90" rx="145" ry="60" fill="none" stroke="#9b92ff" stroke-width="3" stroke-dasharray="8 6"/><circle cx="210" cy="90" r="32" fill="#54dfbf" opacity=".8"/><circle cx="350" cy="83" r="8" fill="#ffcb6b"/><path d="M338 86L248 90" stroke="#ffcb6b" stroke-width="2"/><polygon points="248,90 261,84 261,96" fill="#ffcb6b"/><path d="M350 83L360 62" stroke="#54dfbf" stroke-width="2"/><text x="177" y="95" class="diagram-label">Земля</text><text x="298" y="57" class="diagram-label">спутник</text><text x="255" y="78" class="diagram-label">Fтяж</text></svg>`,
    wave: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Синусоидальная волна с длиной волны"><title>Длина волны</title><path d="M35 90H385M55 25V155" stroke="#7581aa" stroke-width="2"/><path d="M55 90 C80 25 105 25 130 90 S180 155 205 90 S255 25 280 90 S330 155 355 90" fill="none" stroke="#9b92ff" stroke-width="4"/><path d="M80 24H180" stroke="#54dfbf" stroke-width="2"/><path d="M80 20l-8 4 8 4M180 20l8 4-8 4" fill="#54dfbf"/><text x="118" y="17" class="diagram-label">λ</text><text x="369" y="83" class="diagram-label">x</text></svg>`,
    gas: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Молекулы газа в сосуде"><title>Модель идеального газа</title><rect x="105" y="28" width="210" height="120" rx="8" fill="#18213a" stroke="#9b92ff" stroke-width="3"/><circle cx="140" cy="60" r="6" fill="#54dfbf"/><circle cx="190" cy="100" r="6" fill="#ffcb6b"/><circle cx="260" cy="70" r="6" fill="#54dfbf"/><circle cx="280" cy="125" r="6" fill="#ffcb6b"/><path d="M140 60l35 25M190 100l50-20M260 70l20 45" stroke="#7581aa" stroke-dasharray="4 5"/><text x="144" y="165" class="diagram-label">движение частиц → давление</text></svg>`,
    circuit: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Простая электрическая цепь с батареей и резистором"><title>Электрическая цепь</title><path d="M90 45H155M215 45H330V135H90V45M90 135V105" fill="none" stroke="#54dfbf" stroke-width="3"/><path d="M90 105V75M80 75H100M84 65H96" stroke="#ffcb6b" stroke-width="3"/><rect x="155" y="30" width="60" height="30" rx="5" fill="#272e4e" stroke="#9b92ff" stroke-width="2"/><text x="164" y="51" class="diagram-label">R</text><circle cx="330" cy="45" r="10" fill="#ffcb6b"/><text x="309" y="27" class="diagram-label">I</text><text x="143" y="164" class="diagram-label">I = U/R</text></svg>`,
    lens: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Сходящаяся линза и построение изображения"><title>Тонкая линза</title><path d="M45 100H375" stroke="#7581aa" stroke-width="2"/><path d="M210 28 Q180 100 210 172 Q240 100 210 28" fill="#54dfbf" opacity=".25" stroke="#54dfbf" stroke-width="3"/><path d="M105 70V100M315 70V100" stroke="#ffcb6b" stroke-width="3"/><path d="M105 70L210 100L315 70M105 70L210 100L315 130" stroke="#9b92ff" stroke-width="2"/><text x="86" y="59" class="diagram-label">предмет</text><text x="297" y="60" class="diagram-label">изображение</text><text x="197" y="119" class="diagram-label">F</text></svg>`,
    mole: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Моль вещества как большое количество частиц"><title>Моль и число Авогадро</title><rect x="50" y="45" width="120" height="85" rx="12" fill="#1b2440" stroke="#9b92ff"/><circle cx="82" cy="70" r="6" fill="#54dfbf"/><circle cx="114" cy="92" r="6" fill="#ffcb6b"/><circle cx="145" cy="70" r="6" fill="#54dfbf"/><circle cx="80" cy="110" r="6" fill="#ffcb6b"/><circle cx="140" cy="110" r="6" fill="#54dfbf"/><path d="M190 88H245" stroke="#54dfbf" stroke-width="3"/><polygon points="245,88 232,81 232,95" fill="#54dfbf"/><rect x="270" y="45" width="120" height="85" rx="12" fill="#1b2440" stroke="#54dfbf"/><text x="71" y="30" class="diagram-label">образец</text><text x="286" y="30" class="diagram-label">1 моль</text><text x="281" y="94" class="diagram-label">6,02·10²³</text><text x="111" y="153" class="diagram-label">частицы</text></svg>`,
    atom: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Схема атома с ядром и электронными уровнями"><title>Строение атома</title><ellipse cx="210" cy="90" rx="95" ry="50" fill="none" stroke="#9b92ff" stroke-width="2"/><ellipse cx="210" cy="90" rx="55" ry="28" fill="none" stroke="#54dfbf" stroke-width="2"/><circle cx="210" cy="90" r="24" fill="#ffcb6b"/><circle cx="115" cy="90" r="6" fill="#54dfbf"/><circle cx="265" cy="67" r="6" fill="#54dfbf"/><circle cx="210" cy="40" r="6" fill="#54dfbf"/><text x="197" y="96" class="diagram-label">ядро</text><text x="83" y="58" class="diagram-label">e⁻</text><text x="278" y="59" class="diagram-label">уровни</text></svg>`,
    periodic: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Упрощённая периодическая таблица"><title>Периодическая система</title><g fill="#1b2440" stroke="#7581aa"><rect x="45" y="40" width="38" height="30"/><rect x="337" y="40" width="38" height="30"/><rect x="45" y="75" width="38" height="30"/><rect x="91" y="75" width="38" height="30"/><rect x="137" y="75" width="38" height="30"/><rect x="183" y="75" width="38" height="30"/><rect x="229" y="75" width="38" height="30"/><rect x="275" y="75" width="38" height="30"/><rect x="321" y="75" width="38" height="30"/></g><text x="58" y="60">H</text><text x="349" y="60">He</text><text x="55" y="95">Li</text><text x="102" y="95">Be</text><text x="148" y="95">B</text><text x="194" y="95">C</text><text x="240" y="95">N</text><text x="286" y="95">O</text><text x="332" y="95">F</text><path d="M65 130H350" stroke="#54dfbf" stroke-width="3"/><text x="155" y="155" class="diagram-label">свойства меняются периодически</text></svg>`,
    bond: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Ионная и ковалентная связь"><title>Типы химической связи</title><circle cx="110" cy="90" r="30" fill="#9b92ff" opacity=".75"/><circle cx="205" cy="90" r="30" fill="#54dfbf" opacity=".75"/><circle cx="310" cy="90" r="30" fill="#ffcb6b" opacity=".75"/><path d="M140 90H175" stroke="#fff" stroke-width="4"/><path d="M235 90H280" stroke="#fff" stroke-width="10" stroke-linecap="round"/><text x="84" y="95" class="diagram-label">Na⁺</text><text x="186" y="95" class="diagram-label">H</text><text x="293" y="95" class="diagram-label">Cl</text><text x="68" y="145" class="diagram-label">ионная</text><text x="185" y="145" class="diagram-label">общая пара</text></svg>`,
    reaction: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Схема превращения реагентов в продукты"><title>Химическая реакция</title><circle cx="90" cy="90" r="28" fill="#9b92ff"/><circle cx="135" cy="90" r="20" fill="#54dfbf"/><path d="M178 90H250" stroke="#ffcb6b" stroke-width="4"/><polygon points="250,90 235,82 235,98" fill="#ffcb6b"/><circle cx="300" cy="75" r="25" fill="#ffcb6b"/><circle cx="333" cy="108" r="19" fill="#9b92ff"/><text x="74" y="142" class="diagram-label">реагенты</text><text x="293" y="155" class="diagram-label">продукты</text><text x="187" y="67" class="diagram-label">коэффициенты</text></svg>`,
    thermochemistry: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Энергетическая диаграмма экзотермической реакции"><title>Тепловой эффект реакции</title><path d="M65 145H360M75 25V155" stroke="#7581aa" stroke-width="2"/><path d="M90 60H170M245 115H330" stroke="#9b92ff" stroke-width="8"/><path d="M205 60V115" stroke="#ffcb6b" stroke-width="3"/><polygon points="205,115 198,102 212,102" fill="#ffcb6b"/><text x="91" y="45" class="diagram-label">исходные</text><text x="245" y="140" class="diagram-label">продукты</text><text x="174" y="95" class="diagram-label">ΔH &lt; 0</text></svg>`,
    equilibrium: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Динамическое равновесие прямой и обратной реакции"><title>Химическое равновесие</title><path d="M75 90H345" stroke="#7581aa" stroke-width="2"/><path d="M95 75H300" stroke="#9b92ff" stroke-width="4"/><polygon points="300,75 285,67 285,83" fill="#9b92ff"/><path d="M325 105H120" stroke="#54dfbf" stroke-width="4"/><polygon points="120,105 135,97 135,113" fill="#54dfbf"/><text x="133" y="60" class="diagram-label">прямая реакция</text><text x="145" y="130" class="diagram-label">обратная реакция</text><text x="126" y="164" class="diagram-label">скорости равны, реакции продолжаются</text></svg>`,
    ph: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Шкала pH от кислой до щелочной среды"><title>Шкала pH</title><defs><linearGradient id="ph-gradient" x1="0" x2="1"><stop offset="0" stop-color="#e36eaa"/><stop offset=".5" stop-color="#ffcb6b"/><stop offset="1" stop-color="#54dfbf"/></linearGradient></defs><rect x="55" y="70" width="310" height="28" rx="14" fill="url(#ph-gradient)"/><g class="diagram-label"><text x="54" y="125">0 кислота</text><text x="195" y="125">7 нейтр.</text><text x="312" y="125">14 щёлочь</text></g><path d="M210 62V106" stroke="#fff" stroke-width="3"/><circle cx="210" cy="84" r="7" fill="#fff"/></svg>`,
    redox: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Передача электронов в окислительно-восстановительной реакции"><title>Передача электронов</title><circle cx="105" cy="90" r="36" fill="#9b92ff"/><circle cx="315" cy="90" r="36" fill="#54dfbf"/><path d="M148 90H270" stroke="#ffcb6b" stroke-width="4"/><polygon points="270,90 255,82 255,98" fill="#ffcb6b"/><text x="79" y="95" class="diagram-label">Zn⁰</text><text x="286" y="95" class="diagram-label">Cu²⁺</text><text x="163" y="66" class="diagram-label">2e⁻</text><text x="72" y="150" class="diagram-label">окисление</text><text x="281" y="150" class="diagram-label">восстановление</text></svg>`,
    organic: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Углеродная цепь органической молекулы"><title>Углеродный скелет</title><path d="M70 110L135 65L200 110L265 65L330 110" fill="none" stroke="#9b92ff" stroke-width="4"/><g fill="#54dfbf"><circle cx="70" cy="110" r="16"/><circle cx="135" cy="65" r="16"/><circle cx="200" cy="110" r="16"/><circle cx="265" cy="65" r="16"/><circle cx="330" cy="110" r="16"/></g><text x="62" y="116">C</text><text x="127" y="71">C</text><text x="192" y="116">C</text><text x="257" y="71">C</text><text x="322" y="116">C</text><text x="120" y="155" class="diagram-label">углеродный скелет</text></svg>`,
    drawing: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Типы линий инженерного чертежа"><title>Типы линий</title><path d="M65 45H350" stroke="#fff" stroke-width="5"/><path d="M65 90H350" stroke="#fff" stroke-width="3" stroke-dasharray="12 9"/><path d="M65 135H350" stroke="#fff" stroke-width="2" stroke-dasharray="18 7 3 7"/><text x="72" y="30" class="diagram-label">видимый контур</text><text x="72" y="78" class="diagram-label">невидимый контур</text><text x="72" y="124" class="diagram-label">ось симметрии</text></svg>`,
    projection: `<svg class="lesson-diagram" viewBox="0 0 420 190" role="img" aria-label="Фронтальная и горизонтальная проекции точки"><title>Проекции точки</title><path d="M45 95H375M210 25V170" stroke="#7581aa" stroke-width="2"/><circle cx="270" cy="58" r="6" fill="#ffcb6b"/><circle cx="270" cy="132" r="6" fill="#54dfbf"/><path d="M270 58V132" stroke="#fff" stroke-dasharray="6 6"/><text x="280" y="54" class="diagram-label">A₂</text><text x="280" y="130" class="diagram-label">A₁</text><text x="60" y="45" class="diagram-label">П₂ фронтальная</text><text x="60" y="155" class="diagram-label">П₁ горизонтальная</text></svg>`,
    'line-projection': `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Проекции прямой уровня"><title>Прямая уровня</title><path d="M45 90H375M210 25V160" stroke="#7581aa" stroke-width="2"/><path d="M95 90L315 90" stroke="#9b92ff" stroke-width="5"/><path d="M95 52L315 52" stroke="#54dfbf" stroke-width="4"/><path d="M95 52V90M315 52V90" stroke="#fff" stroke-dasharray="6 6"/><text x="118" y="42" class="diagram-label">натуральная длина</text><text x="90" y="120" class="diagram-label">проекция параллельна оси x</text></svg>`,
    plane: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Плоскость через три точки"><path d="M75 125L200 40L350 105L225 165Z" fill="#9b92ff" opacity=".18" stroke="#9b92ff" stroke-width="3"/><circle cx="108" cy="103" r="6" fill="#54dfbf"/><circle cx="201" cy="67" r="6" fill="#54dfbf"/><circle cx="300" cy="112" r="6" fill="#54dfbf"/><text x="91" y="96" class="diagram-label">A</text><text x="207" y="61" class="diagram-label">B</text><text x="307" y="108" class="diagram-label">C</text><text x="160" y="145" class="diagram-label">α = (A, B, C)</text></svg>`,
    intersection: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Пересечение прямой и плоскости"><path d="M55 135L210 45L360 125L205 170Z" fill="#9b92ff" opacity=".18" stroke="#9b92ff" stroke-width="3"/><path d="M65 35L340 150" stroke="#54dfbf" stroke-width="4"/><circle cx="205" cy="94" r="7" fill="#ffcb6b"/><text x="216" y="90" class="diagram-label">K = a ∩ α</text></svg>`,
    auxiliary: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Вспомогательная плоскость пересекает две плоскости"><title>Вспомогательная плоскость</title><path d="M62 120L210 35L360 110L210 165Z" fill="#9b92ff" opacity=".15" stroke="#9b92ff" stroke-width="3"/><path d="M90 45L335 145" stroke="#54dfbf" stroke-width="3"/><path d="M120 145L310 55" stroke="#ffcb6b" stroke-width="3"/><circle cx="210" cy="95" r="6" fill="#fff"/><text x="245" y="87" class="diagram-label">сечение</text><text x="152" y="28" class="diagram-label">α вспомогательная</text></svg>`,
    surfaces: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Цилиндр и конус с образующими"><title>Поверхности</title><ellipse cx="110" cy="52" rx="55" ry="18" fill="#9b92ff" opacity=".2" stroke="#9b92ff" stroke-width="3"/><ellipse cx="110" cy="132" rx="55" ry="18" fill="none" stroke="#9b92ff" stroke-width="3"/><path d="M55 52V132M165 52V132" stroke="#54dfbf" stroke-width="3"/><path d="M260 132L330 52L400 132Z" fill="#54dfbf" opacity=".15" stroke="#54dfbf" stroke-width="3"/><path d="M330 52V132" stroke="#ffcb6b" stroke-dasharray="6 6"/><text x="76" y="162" class="diagram-label">цилиндр</text><text x="313" y="162" class="diagram-label">конус</text></svg>`,
    section: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Сечение призмы плоскостью"><title>Сечение тела</title><path d="M100 140L100 65L210 25L320 65V140L210 175Z" fill="#1b2440" stroke="#9b92ff" stroke-width="3"/><path d="M100 65L210 105L320 65M210 105V175" stroke="#7581aa" stroke-width="2"/><path d="M125 88L210 62L292 88L210 118Z" fill="#54dfbf" opacity=".3" stroke="#54dfbf" stroke-width="3"/><text x="151" y="45" class="diagram-label">плоскость сечения</text></svg>`,
    axonometry: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Изометрический куб с тремя осями"><title>Аксонометрия</title><path d="M210 80L120 45L120 125L210 160L300 125V45Z" fill="#9b92ff" opacity=".18" stroke="#9b92ff" stroke-width="3"/><path d="M210 80V160M210 80L300 45M210 80L120 45" stroke="#54dfbf" stroke-width="3"/><path d="M210 80L345 80M210 80L145 15M210 80V172" stroke="#ffcb6b" stroke-width="2" stroke-dasharray="6 5"/><text x="350" y="84" class="diagram-label">x′</text><text x="140" y="16" class="diagram-label">y′</text><text x="218" y="174" class="diagram-label">z′</text></svg>`,
    dimension: `<svg class="lesson-diagram" viewBox="0 0 420 180" role="img" aria-label="Размерная линия диаметра детали"><title>Нанесение размера</title><circle cx="170" cy="90" r="48" fill="none" stroke="#9b92ff" stroke-width="4"/><path d="M122 90H218" stroke="#54dfbf" stroke-width="2"/><path d="M112 35H228" stroke="#ffcb6b" stroke-width="2"/><path d="M112 29V41M228 29V41" stroke="#ffcb6b" stroke-width="2"/><polygon points="112,35 124,30 124,40" fill="#ffcb6b"/><polygon points="228,35 216,30 216,40" fill="#ffcb6b"/><text x="142" y="25" class="diagram-label">Ø 40</text><text x="270" y="96" class="diagram-label">размерная линия</text></svg>`
  };
  return diagrams[type] || '';
}

function subjectCard(subject) {
  const done = subject.topics.filter((topic) => isDone(subject.id, topic.id)).length;
  return `<button class="subject-card" style="--card-color:${subject.color}" data-subject="${subject.id}"><span class="subject-count">${subject.topics.length} ${pluralTopics(subject.topics.length)}</span><div class="subject-icon">${subject.icon}</div><h3>${esc(subject.title)}</h3><p>${esc(subject.description)}</p><div class="course-progress"><span style="width:${Math.round(done / subject.topics.length * 100)}%"></span></div><small class="course-progress-label">${done}/${subject.topics.length} изучено</small></button>`;
}

function topicCard(subject, topic, index) {
  const done = isDone(subject.id, topic.id);
  return `<button class="topic-card" data-topic-subject="${subject.id}" data-topic="${topic.id}"><span class="topic-number">${String(index + 1).padStart(2, '0')}</span><div class="topic-card-main"><h3>${done ? '✓ ' : ''}${esc(topic.title)}</h3><div class="topic-meta">${esc(topic.difficulty)} · ${topic.minutes} мин · ${topic.sections.length} ${topic.sections.length === 1 ? 'раздел' : 'раздела'}</div></div><span class="topic-arrow">›</span></button>`;
}

function renderHome() {
  setRoute('home');
  const first = state.lastTopic ? allTopics().find((item) => topicKey(item.subject.id, item.topic.id) === state.lastTopic) : null;
  const continueItem = first || allTopics()[0];
  const done = Object.values(state.progress).filter(Boolean).length;
  const total = allTopics().length;
  screen.innerHTML = `<section class="hero"><p class="eyebrow">Твоя учебная база</p><h1>Учись понятнее.<br><span style="color:#9a92ff">Шаг за шагом.</span></h1><p>Полный маршрут по базовым дисциплинам: от самых первых определений до типовых задач и продвинутых методов.</p></section><div class="search-box"><span>⌕</span><input id="searchInput" placeholder="Найти тему или предмет…" /></div><div class="section-row"><h2>Твой маршрут</h2><button class="link-button" data-route="progress">${done}/${total} тем →</button></div><button class="continue-card" style="width:100%;text-align:left" data-topic-subject="${continueItem.subject.id}" data-topic="${continueItem.topic.id}"><span class="mini-icon">${continueItem.subject.icon}</span><span style="flex:1"><h3>${esc(continueItem.topic.title)}</h3><p>${esc(continueItem.subject.title)} · ${isDone(continueItem.subject.id, continueItem.topic.id) ? 'завершено' : 'следующий шаг'}</p><span class="progress-bar"><span style="width:${isDone(continueItem.subject.id, continueItem.topic.id) ? '100%' : '12%'}"></span></span></span><span class="topic-arrow">›</span></button><div class="section-row"><h2>Все предметы</h2><button class="link-button" data-route="subjects">Все →</button></div><div class="subject-grid">${state.subjects.map(subjectCard).join('')}</div>`;
  document.getElementById('searchInput').addEventListener('input', (event) => renderSearch(event.target.value));
}

function renderSearch(query) {
  const value = query.trim().toLowerCase();
  if (!value) return renderHome();
  const results = allTopics().filter(({ subject, topic }) => `${subject.title} ${topic.title} ${topic.summary}`.toLowerCase().includes(value));
  setRoute('home');
  screen.innerHTML = `<button class="back-button" data-route="home">← Назад</button><p class="eyebrow">Результаты поиска</p><h2>Нашли ${results.length}</h2><div class="topic-list">${results.length ? results.map(({ subject, topic, index }) => topicCard(subject, topic, index)).join('') : '<div class="empty"><span>⌕</span>Ничего не нашли. Попробуй другое слово.</div>'}</div>`;
}

function renderSubjects() {
  setRoute('subjects');
  screen.innerHTML = `<section class="hero"><p class="eyebrow">Библиотека знаний</p><h1>Предметы</h1><p>Каждый курс идёт от простого к сложному. Открывай уроки по порядку или возвращайся к сохранённым темам.</p></section><div class="subject-grid">${state.subjects.map(subjectCard).join('')}</div>`;
}

function renderSubject(subjectId) {
  const subject = subjectById(subjectId);
  if (!subject) return renderSubjects();
  setRoute('subjects');
  const done = subject.topics.filter((topic) => isDone(subject.id, topic.id)).length;
  screen.innerHTML = `<button class="back-button" data-route="subjects">← Все предметы</button><div class="topic-hero"><div class="subject-icon" style="color:${subject.color}">${subject.icon}</div><p class="eyebrow">${esc(subject.title)}</p><h1>Курс по порядку</h1><p>${esc(subject.description)}</p><div class="course-overview"><strong>${done}/${subject.topics.length}</strong><span>тем изучено</span><div class="progress-bar"><span style="width:${Math.round(done / subject.topics.length * 100)}%"></span></div></div></div><div class="topic-list">${subject.topics.map((topic, index) => topicCard(subject, topic, index)).join('')}</div>`;
}

function renderSection(section) {
  const bullets = section.bullets?.length ? `<ul class="lesson-list">${section.bullets.map((item) => `<li>${text(item)}</li>`).join('')}</ul>` : '';
  const visual = section.diagram ? `<div class="lesson-diagram-wrap">${diagramMarkup(section.diagram)}</div>` : '';
  const formula = section.formula ? `<div class="formula">${text(section.formula)}</div>` : '';
  return `<section class="lesson-section"><h2>${esc(section.heading)}</h2><p>${text(section.body)}</p>${bullets}${visual}${formula}</section>`;
}

function renderTopic(subjectId, topicId) {
  const subject = subjectById(subjectId);
  const topic = topicById(subjectId, topicId);
  if (!subject || !topic) return renderSubjects();
  setRoute('subjects');
  state.lastTopic = topicKey(subjectId, topicId);
  saveState();
  const saved = state.saved.includes(state.lastTopic);
  const topicIndex = subject.topics.findIndex((item) => item.id === topicId);
  const previous = subject.topics[topicIndex - 1];
  const next = subject.topics[topicIndex + 1];
  screen.innerHTML = `<button class="back-button" data-subject="${subjectId}">← К списку тем</button><article><div class="topic-hero"><span class="badge">${esc(subject.title)} · урок ${topicIndex + 1} из ${subject.topics.length}</span><h1>${esc(topic.title)}</h1><p>${esc(topic.summary)}</p><button class="link-button" id="saveTopic">${saved ? '♥ Сохранено' : '♡ Сохранить тему'}</button></div><div class="objectives"><strong>После этой темы ты сможешь:</strong>${topic.objectives.map((item) => `<div class="objective">${esc(item)}</div>`).join('')}</div>${topic.sections.map(renderSection).join('')}<section class="example"><h3>Разберём пример</h3>${topic.example.steps.map((step, index) => `<div class="step"><span class="step-num">${index + 1}</span><span>${esc(step)}</span></div>`).join('')}<div class="answer">${esc(topic.example.answer)}</div></section><section class="quiz"><h3>Проверь себя</h3><p>${esc(topic.quiz.question)}</p><div id="quizOptions">${topic.quiz.options.map((option, index) => `<button class="quiz-option" data-answer="${index}">${esc(option)}</button>`).join('')}</div><p class="quiz-feedback" id="quizFeedback" aria-live="polite"></p></section><button class="primary-button" id="finishTopic">${isDone(subjectId, topicId) ? '✓ Тема изучена' : 'Отметить тему изученной'}</button><div class="lesson-navigation">${previous ? `<button class="secondary-button" data-topic-subject="${subjectId}" data-topic="${previous.id}">← Предыдущая</button>` : '<span></span>'}${next ? `<button class="secondary-button" data-topic-subject="${subjectId}" data-topic="${next.id}">Следующая →</button>` : '<span></span>'}</div></article>`;

  document.getElementById('saveTopic').addEventListener('click', () => {
    state.saved = state.saved.includes(state.lastTopic) ? state.saved.filter((item) => item !== state.lastTopic) : [...state.saved, state.lastTopic];
    saveState();
    renderTopic(subjectId, topicId);
  });

  document.querySelectorAll('.quiz-option').forEach((button) => button.addEventListener('click', () => {
    const answer = Number(button.dataset.answer);
    document.querySelectorAll('.quiz-option').forEach((item) => { item.disabled = true; });
    button.classList.add(answer === topic.quiz.correct ? 'correct' : 'wrong');
    if (answer !== topic.quiz.correct) document.querySelector(`[data-answer="${topic.quiz.correct}"]`).classList.add('correct');
    document.getElementById('quizFeedback').textContent = `${answer === topic.quiz.correct ? 'Верно! ' : 'Почти. '}${topic.quiz.explanation}`;
  }));

  document.getElementById('finishTopic').addEventListener('click', () => {
    state.progress[state.lastTopic] = true;
    saveState();
    showToast('Тема отмечена как изученная');
    renderTopic(subjectId, topicId);
  });
}

function renderSaved() {
  setRoute('saved');
  const items = state.saved.map((key) => { const [subjectId, topicId] = key.split('/'); return { subject: subjectById(subjectId), topic: topicById(subjectId, topicId) }; }).filter((item) => item.subject && item.topic);
  screen.innerHTML = `<section class="hero"><p class="eyebrow">Твои закладки</p><h1>Сохранённое</h1><p>Темы, к которым удобно вернуться перед занятием или контрольной.</p></section>${items.length ? `<div class="topic-list">${items.map(({ subject, topic }) => topicCard(subject, topic, subject.topics.indexOf(topic))).join('')}</div>` : '<div class="empty"><span>♡</span>Здесь пока пусто.<br>Сохрани тему, чтобы быстро найти её позже.</div>'}`;
}

function renderProgress() {
  setRoute('progress');
  const total = allTopics().length;
  const done = Object.values(state.progress).filter(Boolean).length;
  const percentage = total ? Math.round(done / total * 100) : 0;
  const bySubject = state.subjects.map((subject) => { const completed = subject.topics.filter((topic) => isDone(subject.id, topic.id)).length; return `<button class="progress-row" data-subject="${subject.id}"><span class="progress-row-icon" style="color:${subject.color}">${subject.icon}</span><span style="flex:1"><strong>${esc(subject.title)}</strong><small>${completed} из ${subject.topics.length} ${pluralTopics(subject.topics.length)}</small><span class="progress-bar"><span style="width:${Math.round(completed / subject.topics.length * 100)}%"></span></span></span><span class="topic-arrow">›</span></button>`; }).join('');
  screen.innerHTML = `<section class="hero"><p class="eyebrow">Твой результат</p><h1>Прогресс</h1><p>Регулярно закрывай небольшие уроки — так сложные дисциплины становятся понятнее.</p></section><div class="progress-summary"><strong>${percentage}%</strong><span>общий прогресс · ${done} из ${total} тем</span><div class="progress-bar"><span style="width:${percentage}%"></span></div></div><div class="progress-list">${bySubject}</div>`;
}

function renderProfile() {
  const done = Object.values(state.progress).filter(Boolean).length;
  screen.innerHTML = `<button class="back-button" data-route="home">← Назад</button><section class="profile-panel"><div class="profile-head"><div class="big-avatar">${document.getElementById('profileAvatar').textContent}</div><div><h2>Твой профиль</h2><p>Прогресс хранится на этом устройстве</p></div></div><div class="stats-grid"><div class="stat"><strong>${done}</strong><span>тем изучено</span></div><div class="stat"><strong>${state.saved.length}</strong><span>сохранено</span></div><div class="stat"><strong>${state.subjects.length}</strong><span>курса начато</span></div><div class="stat"><strong>${allTopics().length}</strong><span>тем в базе</span></div></div></section>`;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2300);
}

document.addEventListener('click', (event) => {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) {
    const route = routeButton.dataset.route;
    if (route === 'home') renderHome();
    if (route === 'subjects') renderSubjects();
    if (route === 'saved') renderSaved();
    if (route === 'progress') renderProgress();
    return;
  }
  const topicButton = event.target.closest('[data-topic]');
  if (topicButton) { renderTopic(topicButton.dataset.topicSubject, topicButton.dataset.topic); return; }
  const subjectButton = event.target.closest('[data-subject]');
  if (subjectButton) { renderSubject(subjectButton.dataset.subject); return; }
});

document.getElementById('profileButton').addEventListener('click', renderProfile);

function init() {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
    window.Telegram.WebApp.setHeaderColor?.('#0d1020');
    const user = window.Telegram.WebApp.initDataUnsafe?.user;
    if (user) document.getElementById('profileAvatar').textContent = (user.first_name || 'У')[0].toUpperCase();
  }
  if (!state.subjects.length) { screen.innerHTML = '<div class="empty">Не удалось загрузить учебную библиотеку.</div>'; return; }
  renderHome();
}

init();
