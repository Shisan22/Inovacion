/* ═══════════════════════════════════════════════
   InfoFilter — main.js
   Interacciones y animaciones
   ═══════════════════════════════════════════════ */

// ─── CONTADOR ANIMADO EN EL HERO ───
(function animateCounter() {
  const el = document.getElementById('counterNum');
  if (!el) return;
  const target = 1247893;
  const duration = 2200;
  const start = Date.now();
  const step = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target).toLocaleString('es-CO');
    if (progress < 1) requestAnimationFrame(step);
  };
  setTimeout(() => requestAnimationFrame(step), 600);
})();

// ─── MENÚ MÓVIL ───
const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');

navToggle?.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

// Cierra el menú al hacer clic en un enlace
navLinks?.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── NAVBAR: SOMBRA AL HACER SCROLL ───
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY > 20
    ? '0 4px 32px rgba(0,0,0,0.4)'
    : 'none';
});

// ─── ANIMACIÓN DE ENTRADA AL HACER SCROLL (Intersection Observer) ───
const observerConfig = {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerConfig);

// Selecciona elementos a animar al entrar en pantalla
const animTargets = document.querySelectorAll(
  '.problema-card, .stat-item, .modulo-card, .tool-card, .met-step'
);

animTargets.forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  observer.observe(el);
});

// ─── FORMULARIO DE INSCRIPCIÓN ───
function handleFormSubmit(e) {
  e.preventDefault();
  const input  = e.target.querySelector('.cta-input');
  const button = e.target.querySelector('button');
  const email  = input.value;

  button.textContent = '¡Listo! Te confirmaremos pronto ✓';
  button.style.background = 'var(--color-success)';
  input.value = '';
  input.disabled = true;
  button.disabled = true;

  // Restaurar botón después de 5 segundos
  setTimeout(() => {
    button.textContent = 'Quiero inscribirme';
    button.style.background = '';
    input.disabled = false;
    button.disabled = false;
  }, 5000);
}

// ─── BARRA DE PROGRESO DE LECTURA ───
const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  background: var(--color-accent);
  z-index: 200;
  transition: width 0.1s linear;
  width: 0%;
`;
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop    = window.scrollY;
  const docHeight    = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercent = (scrollTop / docHeight) * 100;
  progressBar.style.width = scrollPercent + '%';
});

/* ═══════════════════════════════════════════════
   ENCUESTA DIAGNÓSTICA
   ─ Para editar preguntas: modifica SURVEY_DATA
   ─ Tipos soportados: 'single', 'multi', 'scale', 'news'
     · single  → una sola opción, tiene correcto/incorrecto
     · news    → titular de noticia real/falsa, tiene correcto/incorrecto
     · multi   → checkboxes (hábitos), sin correcto/incorrecto, valor por elección
     · scale   → escala 1-5, sin correcto/incorrecto, valor por nivel
   ═══════════════════════════════════════════════ */

// ──────────────────────────────────────────────
// BANCO DE PREGUNTAS — edita aquí todo el contenido
// ──────────────────────────────────────────────
const SURVEY_DATA = [

  // 1. Noticia falsa — salud
  {
    id: 1,
    type: 'news',
    category: 'deteccion',
    typeLabel: '🔍 Detecta la desinformación',
    headline: '"La OMS confirmó que el wifi 5G causa daño cerebral permanente según estudio de Harvard publicado en 2024."',
    source: 'Compartido por @SaludNatural en Twitter · 48.000 retweets',
    question: '¿Esta noticia es verdadera o falsa?',
    options: [
      { text: 'Verdadera — la OMS sí emitió esa advertencia', correct: false },
      { text: 'Falsa — es desinformación sin respaldo científico', correct: true },
    ],
    feedback: {
      correct: '✓ Correcto. La OMS no ha vinculado el 5G con daño cerebral. Este tipo de afirmaciones suele usar fuentes falsas o mal citadas para generar credibilidad.',
      wrong: '✗ Es desinformación. La OMS no ha emitido ninguna advertencia de ese tipo. El número de retweets y el tono urgente son señales de alerta clásicas.',
    },
    points: 10,
  },

  // 2. Noticia verdadera — ciencia
  {
    id: 2,
    type: 'news',
    category: 'deteccion',
    typeLabel: '🔍 Detecta la desinformación',
    headline: '"El Panel Intergubernamental del Cambio Climático (IPCC) advirtió en 2023 que superar 1.5°C de calentamiento puede ser irreversible."',
    source: 'Reuters · Basado en informe técnico AR6',
    question: '¿Esta noticia es verdadera o falsa?',
    options: [
      { text: 'Verdadera — el IPCC sí hizo esa advertencia', correct: true },
      { text: 'Falsa — el IPCC no ha llegado a esa conclusión', correct: false },
    ],
    feedback: {
      correct: '✓ Correcto. El IPCC publicó exactamente esa conclusión en su informe AR6. Reuters es una fuente primaria confiable con metodología transparente.',
      wrong: '✗ Es verdadera. El IPCC sí emitió esa advertencia. La desconfianza en medios legítimos también es un efecto de la desinformación.',
    },
    points: 10,
  },

  // 3. Noticia falsa — política
  {
    id: 3,
    type: 'news',
    category: 'deteccion',
    typeLabel: '🔍 Detecta la desinformación',
    headline: '"Video muestra al presidente firmando decreto secreto para eliminar pensiones. El gobierno lo ocultó a los medios."',
    source: 'Blog "VerdadUrgente.net" · Sin fecha · Sin autor',
    question: '¿Esta noticia merece verificarse antes de compartirse?',
    options: [
      { text: 'No, el video es prueba suficiente', correct: false },
      { text: 'Sí — tiene múltiples señales de alarma', correct: true },
      { text: 'Depende de quién la comparte', correct: false },
    ],
    feedback: {
      correct: '✓ Exacto. "Decreto secreto", "el gobierno lo ocultó", ausencia de fecha y autor, y un dominio sin credenciales son señales de alerta que exigen verificación.',
      wrong: '✗ Esta noticia tiene varias banderas rojas: palabras como "secreto" y "ocultó", sin fecha ni autor, y un dominio desconocido. Siempre verifica antes de compartir.',
    },
    points: 10,
  },

  // 4. Hábitos de verificación — multi
  {
    id: 4,
    type: 'multi',
    category: 'habitos',
    typeLabel: '📋 Tus hábitos informativos',
    question: '¿Qué haces antes de compartir una noticia? (elige todas las que apliquen)',
    options: [
      { text: 'Leo el artículo completo, no solo el titular', value: 3 },
      { text: 'Busco la misma noticia en otro medio confiable', value: 4 },
      { text: 'Verifico quién es el autor y su credibilidad', value: 3 },
      { text: 'Comparto si la fuente me parece conocida', value: 0 },
      { text: 'La comparto si confirma lo que ya creo', value: 0 },
      { text: 'Reviso la fecha para asegurarme que es reciente', value: 2 },
    ],
    feedback: {
      neutral: '📊 Registrado. Los hábitos de verificación son el corazón de la alfabetización mediática. Los módulos 1 y 3 te darán un sistema más sólido.',
    },
  },

  // 5. Fuentes confiables — single
  {
    id: 5,
    type: 'single',
    category: 'fuentes',
    typeLabel: '📰 Evaluación de fuentes',
    question: '¿Cuál de estas características hace que una fuente sea más confiable?',
    options: [
      { text: 'Tiene muchos seguidores en redes sociales', correct: false },
      { text: 'Menciona nombres de instituciones conocidas (OMS, NASA, etc.)', correct: false },
      { text: 'Cita fuentes primarias verificables y transparenta su metodología', correct: true },
      { text: 'Publica noticias con frecuencia diaria', correct: false },
    ],
    feedback: {
      correct: '✓ Exacto. La transparencia metodológica y la citación de fuentes primarias son los indicadores más sólidos de credibilidad periodística.',
      wrong: '✗ La confiabilidad no viene del tamaño ni de mencionar instituciones. Una fuente confiable cita fuentes primarias verificables y es transparente en su proceso.',
    },
    points: 10,
  },

  // 6. Sesgo cognitivo — single
  {
    id: 6,
    type: 'single',
    category: 'sesgos',
    typeLabel: '🧠 Pensamiento crítico',
    question: '¿Qué es el "sesgo de confirmación" en el consumo de noticias?',
    options: [
      { text: 'Confundir noticias satíricas con noticias reales', correct: false },
      { text: 'Creer más fácilmente la información que confirma nuestras ideas previas', correct: true },
      { text: 'Compartir noticias sin leerlas completas', correct: false },
      { text: 'Ignorar noticias de medios internacionales', correct: false },
    ],
    feedback: {
      correct: '✓ Correcto. El sesgo de confirmación es uno de los mecanismos más poderosos que explotan los creadores de desinformación.',
      wrong: '✗ El sesgo de confirmación es la tendencia a creer y recordar la información que refuerza nuestras creencias previas, ignorando la evidencia contraria.',
    },
    points: 10,
  },

  // 7. Imagen fuera de contexto — news
  {
    id: 7,
    type: 'news',
    category: 'deteccion',
    typeLabel: '🖼️ Imagen y contexto',
    headline: '"Fotografía muestra tanques militares en las calles de Bogotá durante protestas de esta semana."',
    source: 'Imagen viral · Sin geolocalización · Sin fecha visible',
    question: '¿Qué deberías hacer antes de creer o compartir esto?',
    options: [
      { text: 'Compartirla si la imagen parece auténtica', correct: false },
      { text: 'Hacer búsqueda inversa de la imagen para verificar su origen real', correct: true },
      { text: 'Confiar si muchas personas la están compartiendo', correct: false },
    ],
    feedback: {
      correct: '✓ Correcto. La búsqueda inversa de imágenes (Google Images, TinEye) permite descubrir si una imagen fue tomada en otro contexto, país o año.',
      wrong: '✗ La cantidad de shares no valida una imagen. La búsqueda inversa es la herramienta clave para verificar imágenes: puede revelar que la foto es de otro país o de hace años.',
    },
    points: 10,
  },

  // 8. Frecuencia de verificación — scale
  {
    id: 8,
    type: 'scale',
    category: 'habitos',
    typeLabel: '📊 Autodiagnóstico',
    question: '¿Con qué frecuencia verificas activamente la información antes de creerla?',
    scaleLabels: ['Casi nunca', 'Siempre'],
    options: ['1', '2', '3', '4', '5'],
    valueMap: [0, 3, 6, 8, 10],
    feedback: {
      neutral: '📋 Anotado. La verificación consistente es un hábito que se construye con práctica. InfoFilter te dará un sistema que lo hace más rápido y efectivo.',
    },
  },

  // 9. Noticia falsa — economía
  {
    id: 9,
    type: 'news',
    category: 'deteccion',
    typeLabel: '🔍 Detecta la desinformación',
    headline: '"El FMI declaró que Colombia es el país con mayor inflación de América Latina en 2024 con un 89% anual."',
    source: 'Cadena de WhatsApp · Sin link · Sin fuente directa',
    question: '¿Esta afirmación merece verificarse?',
    options: [
      { text: 'No, el FMI es una fuente confiable así que debe ser cierto', correct: false },
      { text: 'Sí — mencionar al FMI no valida la afirmación sin un link directo', correct: true },
      { text: 'Solo si parece una cifra exagerada', correct: false },
    ],
    feedback: {
      correct: '✓ Correcto. Mencionar instituciones reconocidas (FMI, OMS, NASA) es una técnica común de desinformación. Siempre verifica con el link directo a la publicación oficial.',
      wrong: '✗ Nombrar al FMI no valida nada. Es una técnica común: asociar información falsa a instituciones creíbles. Siempre busca el link directo a la publicación oficial.',
    },
    points: 10,
  },

  // 10. Actitud ante la desinformación — multi
  {
    id: 10,
    type: 'multi',
    category: 'habitos',
    typeLabel: '💬 Comunicación responsable',
    question: '¿Qué harías si descubres que compartiste algo falso? (elige todas las que apliquen)',
    options: [
      { text: 'Elimino la publicación original', value: 3 },
      { text: 'Publico una corrección explicando el error', value: 4 },
      { text: 'No hago nada, nadie lo nota', value: 0 },
      { text: 'Aviso a las personas que lo compartieron por mi cuenta', value: 4 },
      { text: 'Me queda la lección de verificar antes', value: 2 },
    ],
    feedback: {
      neutral: '📋 Tu respuesta revela tu actitud ante el error informativo. La corrección activa es uno de los gestos más valiosos en el ecosistema digital.',
    },
  },
];

// ──────────────────────────────────────────────
// PERFILES DE RESULTADO — edita descripción y recomendaciones
// ──────────────────────────────────────────────
const RESULT_PROFILES = [
  {
    minScore: 0,
    maxScore: 25,
    level: 'Principiante informativo',
    icon: '🌱',
    color: '#ff4455',
    desc: 'Aún no cuentas con herramientas sólidas para filtrar información. Eso no es tu culpa: nadie nos enseña esto formalmente. La buena noticia es que con el programa correcto, el cambio es rápido.',
    recos: [
      { icon: '📚', text: 'Comienza por el Módulo 1: aprende qué es el sesgo de confirmación y cómo te afecta sin que te des cuenta.' },
      { icon: '🔎', text: 'Instala la extensión de búsqueda inversa de Google en tu navegador hoy mismo.' },
      { icon: '📵', text: 'Antes de compartir algo en WhatsApp o redes, pregúntate: ¿lo he leído completo? ¿sé quién lo escribió?' },
      { icon: '🎯', text: 'InfoFilter fue diseñado exactamente para tu perfil. El Módulo 2 te mostrará los 5 tipos de desinformación más comunes.' },
    ],
    ctaText: 'Quiero mejorar mi filtro',
    audience: 'usuario_principiante',
  },
  {
    minScore: 26,
    maxScore: 50,
    level: 'Lector en formación',
    icon: '📖',
    color: '#ffaa33',
    desc: 'Tienes conciencia del problema y algunos buenos instintos, pero tus hábitos de verificación son inconsistentes. Con práctica estructurada puedes convertirte en un lector muy sólido.',
    recos: [
      { icon: '✅', text: 'Trabaja el Módulo 3 de verificación de fuentes: aprende a usar fact-checkers profesionales en menos de 2 minutos por noticia.' },
      { icon: '🧠', text: 'Practica identificar el sesgo de confirmación en noticias sobre temas que te generan emoción fuerte.' },
      { icon: '📰', text: 'Crea tu propio mapa de fuentes confiables por categoría (salud, economía, política).' },
      { icon: '🌐', text: 'El Módulo 4 te dará herramientas específicas para información política y electoral.' },
    ],
    ctaText: 'Quiero afinar mis hábitos',
    audience: 'usuario_intermedio',
  },
  {
    minScore: 51,
    maxScore: 75,
    level: 'Verificador activo',
    icon: '🔍',
    color: '#5566ff',
    desc: 'Ya verificas información con frecuencia y reconoces señales de alerta. Tu desafío es sistematizar ese conocimiento y aplicarlo consistentemente, incluso cuando el tema te genera emoción.',
    recos: [
      { icon: '⚡', text: 'Profundiza en el Módulo 5: desinformación científica y de salud, donde los atajos cognitivos son más fáciles de explotar.' },
      { icon: '🗣️', text: 'Aprende a corregir desinformación sin generar polarización — el Módulo 6 tiene técnicas basadas en investigación.' },
      { icon: '📊', text: 'Aprende a leer gráficas y datos estadísticos: la manipulación de datos es tan común como la de texto.' },
      { icon: '👥', text: 'Considera convertirte en multiplicador: enseñar a otros es la forma más efectiva de consolidar tu propio conocimiento.' },
    ],
    ctaText: 'Quiero ir al siguiente nivel',
    audience: 'usuario_avanzado',
  },
  {
    minScore: 76,
    maxScore: 100,
    level: 'Analista crítico',
    icon: '🏆',
    color: '#44cc88',
    desc: '¡Excelente! Tienes una base muy sólida de pensamiento crítico y hábitos de verificación. Eres exactamente el tipo de persona que puede ayudar a otros a mejorar su relación con la información.',
    recos: [
      { icon: '🎓', text: 'Explora el Módulo 6 completo para convertirte en un comunicador responsable que ayuda a frenar cadenas de desinformación.' },
      { icon: '🌍', text: 'Considera compartir recursos de verificación en tus redes — tu influencia positiva puede tener efecto multiplicador.' },
      { icon: '🔬', text: 'Profundiza en el análisis de datos y visualizaciones: es el próximo nivel de la manipulación informativa.' },
      { icon: '💡', text: 'El programa tiene módulos avanzados diseñados para perfiles como el tuyo que buscan ir más allá del consumo.' },
    ],
    ctaText: 'Ver el programa completo',
    audience: 'usuario_experto',
  },
];

// ──────────────────────────────────────────────
// ESTADO GLOBAL
// ──────────────────────────────────────────────
let surveyState = {
  current: 0,
  answers: {},     // { questionId: { value, points } }
  totalScore: 0,
  started: false,
};

// ──────────────────────────────────────────────
// ABRIR / CERRAR MODAL
// ──────────────────────────────────────────────
function openSurvey() {
  document.getElementById('surveyOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSurvey() {
  document.getElementById('surveyOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Cerrar con Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeSurvey();
});

// Cerrar al clic fuera del modal
document.getElementById('surveyOverlay')?.addEventListener('click', e => {
  if (e.target.id === 'surveyOverlay') closeSurvey();
});

// ──────────────────────────────────────────────
// INICIAR ENCUESTA
// ──────────────────────────────────────────────
function startSurvey() {
  surveyState = { current: 0, answers: {}, totalScore: 0, started: true };
  showScreen('screenQuestions');
  renderQuestion(0);
}

function showScreen(id) {
  document.querySelectorAll('.survey-screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// ──────────────────────────────────────────────
// RENDERIZAR PREGUNTA
// ──────────────────────────────────────────────
function renderQuestion(idx) {
  const q = SURVEY_DATA[idx];
  const total = SURVEY_DATA.length;
  const pct = Math.round(((idx) / total) * 100);

  document.getElementById('surveyProgressFill').style.width = pct + '%';
  document.getElementById('surveyProgressLabel').textContent = `${idx + 1} / ${total}`;

  const prev = document.getElementById('btnPrev');
  const next = document.getElementById('btnNext');
  prev.style.visibility = idx === 0 ? 'hidden' : 'visible';
  next.textContent = idx === total - 1 ? 'Ver resultados →' : 'Siguiente →';

  const area = document.getElementById('surveyQuestionArea');
  const answered = surveyState.answers[q.id];

  let html = `<p class="q-type-label">${q.typeLabel}</p>`;

  if (q.type === 'news') {
    html += `<div class="q-news-card">"${q.headline}"<div class="q-news-source">🔗 ${q.source}</div></div>`;
    html += `<p class="q-text">${q.question}</p>`;
    html += `<div class="q-options">`;
    q.options.forEach((opt, i) => {
      let cls = 'q-option';
      if (answered) {
        if (opt.correct) cls += ' correct-reveal';
        else if (answered.chosen === i && !opt.correct) cls += ' wrong-reveal';
      } else if (answered && answered.chosen === i) cls += ' selected';
      html += `<button class="${cls}" onclick="selectSingle(${q.id},${i},${opt.correct})" ${answered ? 'disabled' : ''}>
        <span class="q-option-marker">${String.fromCharCode(65+i)}</span>${opt.text}
      </button>`;
    });
    html += `</div>`;
  }

  else if (q.type === 'single') {
    html += `<p class="q-text">${q.question}</p>`;
    html += `<div class="q-options">`;
    q.options.forEach((opt, i) => {
      let cls = 'q-option';
      if (answered) {
        if (opt.correct) cls += ' correct-reveal';
        else if (answered.chosen === i && !opt.correct) cls += ' wrong-reveal';
      } else if (answered && answered.chosen === i) cls += ' selected';
      html += `<button class="${cls}" onclick="selectSingle(${q.id},${i},${opt.correct})" ${answered ? 'disabled' : ''}>
        <span class="q-option-marker">${String.fromCharCode(65+i)}</span>${opt.text}
      </button>`;
    });
    html += `</div>`;
  }

  else if (q.type === 'multi') {
    html += `<p class="q-text">${q.question}</p>`;
    html += `<div class="q-options">`;
    q.options.forEach((opt, i) => {
      const sel = answered && answered.choices && answered.choices.includes(i);
      html += `<button class="q-check-option${sel ? ' checked' : ''}" onclick="toggleMulti(${q.id},${i},${opt.value})">
        <span class="q-checkbox">${sel ? '✓' : ''}</span>${opt.text}
      </button>`;
    });
    html += `</div>`;
  }

  else if (q.type === 'scale') {
    html += `<p class="q-text">${q.question}</p>`;
    html += `<div class="q-scale">`;
    q.options.forEach((val, i) => {
      const sel = answered && answered.chosen === i;
      html += `<button class="q-scale-btn${sel ? ' selected' : ''}" onclick="selectScale(${q.id},${i},${q.valueMap[i]})">${val}</button>`;
    });
    html += `</div>`;
    html += `<div class="q-scale-labels"><span>${q.scaleLabels[0]}</span><span>${q.scaleLabels[1]}</span></div>`;
  }

  // Feedback
  if (answered) {
    const fbType = answered.correct === true ? 'correct-fb' :
                   answered.correct === false ? 'wrong-fb' : 'neutral-fb';
    const fbText = answered.correct === true ? q.feedback.correct :
                   answered.correct === false ? q.feedback.wrong : q.feedback.neutral;
    html += `<div class="q-feedback show ${fbType}">${fbText}</div>`;
  } else {
    html += `<div class="q-feedback" id="qFeedback"></div>`;
  }

  area.innerHTML = html;
  area.scrollTop = 0;
}

// ──────────────────────────────────────────────
// SELECTORES DE RESPUESTA
// ──────────────────────────────────────────────
function selectSingle(qid, chosenIdx, isCorrect) {
  const q = SURVEY_DATA.find(x => x.id === qid);
  if (surveyState.answers[qid]) return; // ya respondida

  const pts = isCorrect ? (q.points || 10) : 0;
  surveyState.answers[qid] = { chosen: chosenIdx, correct: isCorrect, points: pts };
  surveyState.totalScore += pts;
  renderQuestion(surveyState.current);
}

function toggleMulti(qid, idx, val) {
  if (!surveyState.answers[qid]) {
    surveyState.answers[qid] = { choices: [], points: 0, correct: null };
  }
  const ans = surveyState.answers[qid];
  const pos = ans.choices.indexOf(idx);
  if (pos === -1) {
    ans.choices.push(idx);
    ans.points += val;
    surveyState.totalScore += val;
  } else {
    ans.choices.splice(pos, 1);
    ans.points -= val;
    surveyState.totalScore -= val;
  }
  renderQuestion(surveyState.current);
}

function selectScale(qid, idx, val) {
  const q = SURVEY_DATA.find(x => x.id === qid);
  const prev = surveyState.answers[qid];
  if (prev) surveyState.totalScore -= prev.points;
  surveyState.answers[qid] = { chosen: idx, points: val, correct: null };
  surveyState.totalScore += val;
  renderQuestion(surveyState.current);
}

// ──────────────────────────────────────────────
// NAVEGACIÓN
// ──────────────────────────────────────────────
function nextQuestion() {
  const q = SURVEY_DATA[surveyState.current];
  // Preguntas de hábitos (multi/scale) son opcionales — se puede avanzar sin responder
  if (!surveyState.answers[q.id] && q.type !== 'multi' && q.type !== 'scale') {
    shakeBtn('btnNext');
    return;
  }
  if (surveyState.current < SURVEY_DATA.length - 1) {
    surveyState.current++;
    renderQuestion(surveyState.current);
    document.getElementById('screenQuestions').scrollTop = 0;
  } else {
    showResults();
  }
}

function prevQuestion() {
  if (surveyState.current > 0) {
    surveyState.current--;
    renderQuestion(surveyState.current);
  }
}

function shakeBtn(id) {
  const btn = document.getElementById(id);
  btn.style.animation = 'none';
  btn.style.transform = 'translateX(-6px)';
  setTimeout(() => btn.style.transform = 'translateX(6px)', 80);
  setTimeout(() => btn.style.transform = 'translateX(-4px)', 160);
  setTimeout(() => btn.style.transform = 'translateX(0)', 240);
}

// ──────────────────────────────────────────────
// CALCULAR Y MOSTRAR RESULTADOS
// ──────────────────────────────────────────────
function showResults() {
  // Normalizar score a 0-100
  const maxPossible = SURVEY_DATA.reduce((acc, q) => {
    if (q.type === 'single' || q.type === 'news') return acc + (q.points || 10);
    if (q.type === 'multi') return acc + q.options.reduce((s, o) => s + (o.value > 0 ? o.value : 0), 0);
    if (q.type === 'scale') return acc + Math.max(...q.valueMap);
    return acc;
  }, 0);

  const rawScore = Math.max(0, surveyState.totalScore);
  const pct = Math.min(100, Math.round((rawScore / maxPossible) * 100));

  const profile = RESULT_PROFILES.find(p => pct >= p.minScore && pct <= p.maxScore)
                  || RESULT_PROFILES[RESULT_PROFILES.length - 1];

  // Dimensiones
  const dims = calcDimensions();

  const html = `
    <div class="result-header">
      <div class="result-level-icon">${profile.icon}</div>
      <h3 class="result-level-name">${profile.level}</h3>
      <div class="result-score-ring">
        <span class="result-score-num">${pct}</span>
        <span class="result-score-lbl">/ 100</span>
      </div>
      <p class="result-desc">${profile.desc}</p>
    </div>

    <div class="result-dimensions">
      ${dims.map(d => `
        <div class="result-dim-card">
          <div class="rdim-title">${d.label}</div>
          <div class="rdim-bar-bg">
            <div class="rdim-bar-fill" style="width:${d.pct}%; background:${d.color};"></div>
          </div>
          <div class="rdim-value">${d.pct}%</div>
        </div>
      `).join('')}
    </div>

    <div class="result-recos">
      <h4>🎯 Recomendaciones para ti</h4>
      ${profile.recos.map(r => `
        <div class="reco-item">
          <span class="reco-icon">${r.icon}</span>
          <span>${r.text}</span>
        </div>
      `).join('')}
    </div>

    <div class="result-cta">
      <h4>Está diseñado para ti</h4>
      <p>InfoFilter tiene un recorrido adaptado a tu nivel actual. Empieza hoy, a tu ritmo, sin costo.</p>
      <div class="result-cta-actions">
        <a href="#inscripcion" class="btn btn-primary" onclick="closeSurvey()">${profile.ctaText}</a>
        <button class="btn btn-ghost" onclick="restartSurvey()">Volver a intentarlo</button>
      </div>
    </div>
  `;

  document.getElementById('surveyResultsInner').innerHTML = html;
  showScreen('screenResults');

  // Animar barras con delay
  setTimeout(() => {
    document.querySelectorAll('.rdim-bar-fill').forEach(el => {
      el.style.transition = 'width 0.8s ease';
    });
  }, 100);
}

function calcDimensions() {
  const det = SURVEY_DATA.filter(q => q.category === 'deteccion');
  const hab = SURVEY_DATA.filter(q => q.category === 'habitos');
  const fue = SURVEY_DATA.filter(q => q.category === 'fuentes');
  const ses = SURVEY_DATA.filter(q => q.category === 'sesgos');

  function scoreDim(qs) {
    let got = 0, max = 0;
    qs.forEach(q => {
      const ans = surveyState.answers[q.id];
      if (q.type === 'single' || q.type === 'news') {
        max += q.points || 10;
        if (ans && ans.correct) got += q.points || 10;
      } else if (q.type === 'multi') {
        const m = q.options.reduce((s, o) => s + (o.value > 0 ? o.value : 0), 0);
        max += m;
        if (ans) got += Math.max(0, ans.points);
      } else if (q.type === 'scale') {
        max += Math.max(...q.valueMap);
        if (ans) got += ans.points;
      }
    });
    return max > 0 ? Math.round((got / max) * 100) : 0;
  }

  return [
    { label: 'Detección de falsedad',  pct: scoreDim(det), color: '#5566ff' },
    { label: 'Hábitos de verificación', pct: scoreDim(hab), color: '#f0c040' },
    { label: 'Evaluación de fuentes',   pct: scoreDim(fue), color: '#44cc88' },
    { label: 'Pensamiento crítico',     pct: scoreDim(ses), color: '#ff4455' },
  ];
}

function restartSurvey() {
  startSurvey();
  document.getElementById('surveyModal').scrollTop = 0;
}
