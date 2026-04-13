/* ═══════════════════════════════════════════════════════════════
   InfoFilter — main.js
   ─────────────────────────────────────────────────────────────
   PARA CONFIGURAR FIREBASE:
   1. Ve a https://console.firebase.google.com
   2. Crea un proyecto → agrega una app web
   3. Copia los valores de tu firebaseConfig y pégalos abajo
   4. En Firestore → Reglas, usa las del archivo SETUP.md
   ═══════════════════════════════════════════════════════════════ */

// ╔══════════════════════════════════════════════════════════════╗
// ║  🔧 CONFIGURACIÓN FIREBASE — EDITA ESTOS VALORES            ║
// ╚══════════════════════════════════════════════════════════════╝
const firebaseConfig = {
  apiKey: "AIzaSyCtvvtBQYAIVKA7kX2qZLpcZ3YvMda4MNA",
  authDomain: "infofilter-encuesta.firebaseapp.com",
  projectId: "infofilter-encuesta",
  storageBucket: "infofilter-encuesta.firebasestorage.app",
  messagingSenderId: "145086399336",
  appId: "1:145086399336:web:baa01ce1ac5ccc1f36ccdd"
};

// ══════════════════════════════════════════════════════════════
// FIREBASE — Inicialización
// ══════════════════════════════════════════════════════════════
import { initializeApp }                        from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc,
         getCountFromServer, serverTimestamp }  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let db = null;

function initFirebase() {
  try {
    const app = initializeApp(FIREBASE_CONFIG);
    db = getFirestore(app);
    console.info("Firebase conectado");
    loadResponseCount();
  } catch (err) {
    console.warn("Firebase no configurado:", err.message);
  }
}

// ══════════════════════════════════════════════════════════════
// CONTADOR DE RESPUESTAS — muestra cuántos han respondido
// ══════════════════════════════════════════════════════════════
async function loadResponseCount() {
  if (!db) return;
  try {
    const snap  = await getCountFromServer(collection(db, "survey_responses"));
    const count = snap.data().count;
    const el    = document.getElementById("surveyResponseCount");
    if (el) animateNumber(el, 0, count, 1200);
  } catch (e) { /* silencioso si no hay datos aún */ }
}

function animateNumber(el, from, to, dur) {
  const start = Date.now();
  const step  = () => {
    const p    = Math.min((Date.now() - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(from + (to - from) * ease).toLocaleString("es-CO");
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// ══════════════════════════════════════════════════════════════
// GUARDAR RESPUESTA EN FIRESTORE
// Cada documento contiene:
//   timestamp, score (0-100), level, audience,
//   dimensions {deteccion, habitos, fuentes, sesgos},
//   answers {q1:{type,chosen,correct,points}, ...},
//   completionTime (segundos), userAgent
// ══════════════════════════════════════════════════════════════
async function saveSurveyResponse(payload) {
  if (!db) return null;
  try {
    const ref = await addDoc(collection(db, "survey_responses"), {
      timestamp:      serverTimestamp(),
      score:          payload.score,
      level:          payload.level,
      audience:       payload.audience,
      dimensions:     payload.dimensions,
      answers:        payload.answers,
      completionTime: payload.completionTime,
      userAgent:      navigator.userAgent.substring(0, 120),
    });
    loadResponseCount();
    return ref.id;
  } catch (err) {
    console.error("Error guardando:", err.message);
    return null;
  }
}

initFirebase();

/* ═══════════════════════════════════════════════
   UI GENERAL
   ═══════════════════════════════════════════════ */

(function heroCounter() {
  const el = document.getElementById('counterNum');
  if (!el) return;
  const target = 1247893, dur = 2200, start = Date.now();
  const step = () => {
    const p = Math.min((Date.now()-start)/dur,1), ease = 1-Math.pow(1-p,3);
    el.textContent = Math.floor(ease*target).toLocaleString('es-CO');
    if (p<1) requestAnimationFrame(step);
  };
  setTimeout(()=>requestAnimationFrame(step),600);
})();

const navToggle = document.querySelector('.nav-toggle');
const navLinks  = document.querySelector('.nav-links');
navToggle?.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks?.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  navbar.style.boxShadow = window.scrollY>20 ? '0 4px 32px rgba(0,0,0,0.4)' : 'none';
});

const obs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.style.opacity='1'; e.target.style.transform='translateY(0)'; obs.unobserve(e.target); }
  });
}, { threshold:0.1, rootMargin:'0px 0px -60px 0px' });

document.querySelectorAll('.problema-card,.stat-item,.modulo-card,.tool-card,.met-step').forEach((el,i) => {
  el.style.opacity='0'; el.style.transform='translateY(24px)';
  el.style.transition=`opacity 0.5s ease ${i*.07}s,transform 0.5s ease ${i*.07}s`;
  obs.observe(el);
});

function handleFormSubmit(e) {
  e.preventDefault();
  const input=e.target.querySelector('.cta-input'), btn=e.target.querySelector('button');
  btn.textContent='¡Listo! Te confirmaremos pronto ✓'; btn.style.background='var(--color-success)';
  input.value=''; input.disabled=true; btn.disabled=true;
  setTimeout(()=>{ btn.textContent='Quiero inscribirme'; btn.style.background=''; input.disabled=false; btn.disabled=false; },5000);
}

const readBar = document.createElement('div');
readBar.style.cssText='position:fixed;top:0;left:0;height:2px;background:var(--color-accent);z-index:200;transition:width 0.1s;width:0%;';
document.body.appendChild(readBar);
window.addEventListener('scroll', () => {
  readBar.style.width = (window.scrollY/(document.documentElement.scrollHeight-window.innerHeight)*100)+'%';
});

/* ═══════════════════════════════════════════════════════════════
   ENCUESTA DIAGNÓSTICA
   Para editar preguntas modifica el array SURVEY_DATA abajo.
   Tipos disponibles: 'news', 'single', 'multi', 'scale'
   ═══════════════════════════════════════════════════════════════ */

const SURVEY_DATA = [
  {
    id:1, type:'news', category:'deteccion', typeLabel:'🔍 Detecta la desinformación',
    headline:'"La OMS confirmó que el wifi 5G causa daño cerebral permanente según estudio de Harvard publicado en 2024."',
    source:'Compartido por @SaludNatural en Twitter · 48.000 retweets',
    question:'¿Esta noticia es verdadera o falsa?',
    options:[
      {text:'Verdadera — la OMS sí emitió esa advertencia', correct:false},
      {text:'Falsa — es desinformación sin respaldo científico', correct:true},
    ],
    feedback:{
      correct:'✓ Correcto. La OMS no ha vinculado el 5G con daño cerebral. Usar nombres de instituciones reales es una táctica clásica de desinformación.',
      wrong:'✗ Es desinformación. La OMS no emitió esa advertencia. El número de retweets y el tono urgente son señales de alerta.',
    }, points:10,
  },
  {
    id:2, type:'news', category:'deteccion', typeLabel:'🔍 Detecta la desinformación',
    headline:'"El IPCC advirtió en 2023 que superar 1.5°C de calentamiento puede ser irreversible."',
    source:'Reuters · Basado en informe técnico AR6',
    question:'¿Esta noticia es verdadera o falsa?',
    options:[
      {text:'Verdadera — el IPCC sí hizo esa advertencia', correct:true},
      {text:'Falsa — el IPCC no ha llegado a esa conclusión', correct:false},
    ],
    feedback:{
      correct:'✓ Correcto. El IPCC publicó esa conclusión en su informe AR6. Reuters es una fuente primaria confiable.',
      wrong:'✗ Es verdadera. El IPCC sí emitió esa advertencia. La desconfianza en medios legítimos también es efecto de la desinformación.',
    }, points:10,
  },
  {
    id:3, type:'news', category:'deteccion', typeLabel:'🔍 Detecta la desinformación',
    headline:'"Video muestra al presidente firmando decreto secreto para eliminar pensiones. El gobierno lo ocultó a los medios."',
    source:'Blog "VerdadUrgente.net" · Sin fecha · Sin autor',
    question:'¿Esta noticia merece verificarse antes de compartirse?',
    options:[
      {text:'No, el video es prueba suficiente', correct:false},
      {text:'Sí — tiene múltiples señales de alarma', correct:true},
      {text:'Depende de quién la comparte', correct:false},
    ],
    feedback:{
      correct:'✓ Exacto. "Decreto secreto", "el gobierno lo ocultó", sin fecha ni autor y dominio desconocido son señales de alerta clásicas.',
      wrong:'✗ Esta noticia tiene varias banderas rojas: palabras como "secreto" y "ocultó", sin fecha ni autor, dominio sin credenciales.',
    }, points:10,
  },
  {
    id:4, type:'multi', category:'habitos', typeLabel:'📋 Tus hábitos informativos',
    question:'¿Qué haces antes de compartir una noticia? (elige todas las que apliquen)',
    options:[
      {text:'Leo el artículo completo, no solo el titular', value:3},
      {text:'Busco la misma noticia en otro medio confiable', value:4},
      {text:'Verifico quién es el autor y su credibilidad', value:3},
      {text:'Comparto si la fuente me parece conocida', value:0},
      {text:'La comparto si confirma lo que ya creo', value:0},
      {text:'Reviso la fecha para asegurarme que es reciente', value:2},
    ],
    feedback:{neutral:'📊 Registrado. Los hábitos de verificación son el corazón de la alfabetización mediática.'},
  },
  {
    id:5, type:'single', category:'fuentes', typeLabel:'📰 Evaluación de fuentes',
    question:'¿Cuál hace que una fuente sea más confiable?',
    options:[
      {text:'Tiene muchos seguidores en redes sociales', correct:false},
      {text:'Menciona instituciones conocidas (OMS, NASA…)', correct:false},
      {text:'Cita fuentes primarias verificables y transparenta su metodología', correct:true},
      {text:'Publica noticias con alta frecuencia', correct:false},
    ],
    feedback:{
      correct:'✓ La transparencia metodológica y la citación de fuentes primarias son los indicadores más sólidos de credibilidad.',
      wrong:'✗ La confiabilidad no viene del tamaño ni de mencionar instituciones. Una fuente confiable cita fuentes primarias verificables.',
    }, points:10,
  },
  {
    id:6, type:'single', category:'sesgos', typeLabel:'🧠 Pensamiento crítico',
    question:'¿Qué es el "sesgo de confirmación" en el consumo de noticias?',
    options:[
      {text:'Confundir noticias satíricas con noticias reales', correct:false},
      {text:'Creer más fácilmente la información que confirma nuestras ideas previas', correct:true},
      {text:'Compartir noticias sin leerlas completas', correct:false},
      {text:'Ignorar noticias de medios internacionales', correct:false},
    ],
    feedback:{
      correct:'✓ Correcto. El sesgo de confirmación es uno de los mecanismos más explotados por creadores de desinformación.',
      wrong:'✗ Es la tendencia a creer la información que refuerza nuestras creencias previas, ignorando la evidencia contraria.',
    }, points:10,
  },
  {
    id:7, type:'news', category:'deteccion', typeLabel:'🖼️ Imagen y contexto',
    headline:'"Fotografía muestra tanques militares en las calles de Bogotá durante protestas de esta semana."',
    source:'Imagen viral · Sin geolocalización · Sin fecha visible',
    question:'¿Qué deberías hacer antes de creer o compartir esto?',
    options:[
      {text:'Compartirla si la imagen parece auténtica', correct:false},
      {text:'Hacer búsqueda inversa de la imagen para verificar su origen real', correct:true},
      {text:'Confiar si muchas personas la están compartiendo', correct:false},
    ],
    feedback:{
      correct:'✓ La búsqueda inversa (Google Images, TinEye) permite descubrir si una imagen fue tomada en otro contexto, país o año.',
      wrong:'✗ La cantidad de shares no valida una imagen. La búsqueda inversa puede revelar que la foto es de otro país o de hace años.',
    }, points:10,
  },
  {
    id:8, type:'scale', category:'habitos', typeLabel:'📊 Autodiagnóstico',
    question:'¿Con qué frecuencia verificas activamente la información antes de creerla?',
    scaleLabels:['Casi nunca','Siempre'], options:['1','2','3','4','5'], valueMap:[0,3,6,8,10],
    feedback:{neutral:'📋 Anotado. La verificación consistente es un hábito que se construye con práctica.'},
  },
  {
    id:9, type:'news', category:'deteccion', typeLabel:'🔍 Detecta la desinformación',
    headline:'"El FMI declaró que Colombia es el país con mayor inflación de América Latina en 2024 con un 89% anual."',
    source:'Cadena de WhatsApp · Sin link · Sin fuente directa',
    question:'¿Esta afirmación merece verificarse?',
    options:[
      {text:'No, el FMI es confiable así que debe ser cierto', correct:false},
      {text:'Sí — mencionar al FMI no valida la afirmación sin link directo', correct:true},
      {text:'Solo si parece una cifra exagerada', correct:false},
    ],
    feedback:{
      correct:'✓ Correcto. Asociar datos falsos a instituciones reconocidas es una técnica muy común de desinformación.',
      wrong:'✗ Nombrar al FMI no valida nada. Siempre busca el link directo a la publicación oficial.',
    }, points:10,
  },
  {
    id:10, type:'multi', category:'habitos', typeLabel:'💬 Comunicación responsable',
    question:'¿Qué harías si descubres que compartiste algo falso? (elige todas las que apliquen)',
    options:[
      {text:'Elimino la publicación original', value:3},
      {text:'Publico una corrección explicando el error', value:4},
      {text:'No hago nada, nadie lo nota', value:0},
      {text:'Aviso a las personas que lo compartieron por mi cuenta', value:4},
      {text:'Me queda la lección de verificar antes', value:2},
    ],
    feedback:{neutral:'📋 Tu respuesta revela tu actitud ante el error informativo. La corrección activa es uno de los gestos más valiosos en el ecosistema digital.'},
  },
];

const RESULT_PROFILES = [
  {
    minScore:0, maxScore:25, level:'Principiante informativo', icon:'🌱', audience:'usuario_principiante',
    desc:'Aún no cuentas con herramientas sólidas para filtrar información. Eso no es tu culpa: nadie nos enseña esto formalmente. Con el programa correcto, el cambio es rápido.',
    recos:[
      {icon:'📚', text:'Comienza por el Módulo 1: aprende qué es el sesgo de confirmación y cómo te afecta sin que te des cuenta.'},
      {icon:'🔎', text:'Instala la extensión de búsqueda inversa de Google en tu navegador hoy mismo.'},
      {icon:'📵', text:'Antes de compartir algo, pregúntate: ¿lo leí completo? ¿sé quién lo escribió?'},
      {icon:'🎯', text:'InfoFilter fue diseñado para tu perfil. El Módulo 2 te muestra los 5 tipos de desinformación más comunes.'},
    ], ctaText:'Quiero mejorar mi filtro',
  },
  {
    minScore:26, maxScore:50, level:'Lector en formación', icon:'📖', audience:'usuario_intermedio',
    desc:'Tienes conciencia del problema y buenos instintos, pero tus hábitos de verificación son inconsistentes. Con práctica estructurada puedes convertirte en un lector muy sólido.',
    recos:[
      {icon:'✅', text:'Trabaja el Módulo 3: aprende a usar fact-checkers profesionales en menos de 2 minutos por noticia.'},
      {icon:'🧠', text:'Practica identificar el sesgo de confirmación en noticias sobre temas que te generan emoción fuerte.'},
      {icon:'📰', text:'Crea tu propio mapa de fuentes confiables por categoría (salud, economía, política).'},
      {icon:'🌐', text:'El Módulo 4 te da herramientas para información política y electoral.'},
    ], ctaText:'Quiero afinar mis hábitos',
  },
  {
    minScore:51, maxScore:75, level:'Verificador activo', icon:'🔍', audience:'usuario_avanzado',
    desc:'Ya verificas información con frecuencia y reconoces señales de alerta. Tu desafío es sistematizar ese conocimiento y aplicarlo consistentemente, incluso cuando el tema te genera emoción.',
    recos:[
      {icon:'⚡', text:'Profundiza en el Módulo 5: desinformación científica, donde los atajos cognitivos son más fáciles de explotar.'},
      {icon:'🗣️', text:'Aprende a corregir desinformación sin generar polarización — el Módulo 6 tiene técnicas basadas en investigación.'},
      {icon:'📊', text:'Aprende a leer gráficas y datos: la manipulación estadística es tan común como la de texto.'},
      {icon:'👥', text:'Considera convertirte en multiplicador: enseñar a otros consolida tu propio conocimiento.'},
    ], ctaText:'Quiero ir al siguiente nivel',
  },
  {
    minScore:76, maxScore:100, level:'Analista crítico', icon:'🏆', audience:'usuario_experto',
    desc:'¡Excelente! Tienes una base muy sólida de pensamiento crítico y hábitos de verificación. Eres exactamente el tipo de persona que puede ayudar a otros a mejorar.',
    recos:[
      {icon:'🎓', text:'Explora el Módulo 6 completo para convertirte en un comunicador responsable que ayuda a frenar cadenas de desinformación.'},
      {icon:'🌍', text:'Comparte recursos de verificación en tus redes — tu influencia puede tener efecto multiplicador.'},
      {icon:'🔬', text:'Profundiza en análisis de datos y visualizaciones: es el próximo nivel de la manipulación informativa.'},
      {icon:'💡', text:'El programa tiene módulos avanzados diseñados para perfiles como el tuyo.'},
    ], ctaText:'Ver el programa completo',
  },
];

/* ─── ESTADO ─── */
let surveyState = { current:0, answers:{}, totalScore:0, started:false, startTime:null };

/* ─── MODAL ─── */
function openSurvey() {
  document.getElementById('surveyOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeSurvey() {
  document.getElementById('surveyOverlay').classList.remove('open');
  document.body.style.overflow='';
}
document.addEventListener('keydown', e => { if(e.key==='Escape') closeSurvey(); });
document.getElementById('surveyOverlay')?.addEventListener('click', e => { if(e.target.id==='surveyOverlay') closeSurvey(); });

/* ─── FLUJO ─── */
function startSurvey() {
  surveyState = { current:0, answers:{}, totalScore:0, started:true, startTime:Date.now() };
  showScreen('screenQuestions');
  renderQuestion(0);
}
function showScreen(id) {
  document.querySelectorAll('.survey-screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

/* ─── RENDER PREGUNTA ─── */
function renderQuestion(idx) {
  const q=SURVEY_DATA[idx], total=SURVEY_DATA.length;
  document.getElementById('surveyProgressFill').style.width  = Math.round((idx/total)*100)+'%';
  document.getElementById('surveyProgressLabel').textContent = `${idx+1} / ${total}`;
  document.getElementById('btnPrev').style.visibility = idx===0?'hidden':'visible';
  document.getElementById('btnNext').textContent = idx===total-1?'Ver mis resultados →':'Siguiente →';

  const area=document.getElementById('surveyQuestionArea'), ans=surveyState.answers[q.id];
  let html=`<p class="q-type-label">${q.typeLabel}</p>`;

  if (q.type==='news'||q.type==='single') {
    if (q.type==='news') html+=`<div class="q-news-card">"${q.headline}"<div class="q-news-source">🔗 ${q.source}</div></div>`;
    html+=`<p class="q-text">${q.question}</p><div class="q-options">`;
    q.options.forEach((opt,i)=>{
      let cls='q-option';
      if(ans){ if(opt.correct) cls+=' correct-reveal'; else if(ans.chosen===i&&!opt.correct) cls+=' wrong-reveal'; }
      else if(ans&&ans.chosen===i) cls+=' selected';
      html+=`<button class="${cls}" onclick="selectSingle(${q.id},${i},${opt.correct})" ${ans?'disabled':''}>
        <span class="q-option-marker">${String.fromCharCode(65+i)}</span>${opt.text}</button>`;
    });
    html+=`</div>`;
  }
  else if (q.type==='multi') {
    html+=`<p class="q-text">${q.question}</p><div class="q-options">`;
    q.options.forEach((opt,i)=>{
      const sel=ans?.choices?.includes(i);
      html+=`<button class="q-check-option${sel?' checked':''}" onclick="toggleMulti(${q.id},${i},${opt.value})">
        <span class="q-checkbox">${sel?'✓':''}</span>${opt.text}</button>`;
    });
    html+=`</div>`;
  }
  else if (q.type==='scale') {
    html+=`<p class="q-text">${q.question}</p><div class="q-scale">`;
    q.options.forEach((val,i)=>{
      const sel=ans?.chosen===i;
      html+=`<button class="q-scale-btn${sel?' selected':''}" onclick="selectScale(${q.id},${i},${q.valueMap[i]})">${val}</button>`;
    });
    html+=`</div><div class="q-scale-labels"><span>${q.scaleLabels[0]}</span><span>${q.scaleLabels[1]}</span></div>`;
  }

  if (ans) {
    const t=ans.correct===true?'correct-fb':ans.correct===false?'wrong-fb':'neutral-fb';
    const txt=ans.correct===true?q.feedback.correct:ans.correct===false?q.feedback.wrong:q.feedback.neutral;
    html+=`<div class="q-feedback show ${t}">${txt}</div>`;
  } else html+=`<div class="q-feedback"></div>`;
  area.innerHTML=html;
}

/* ─── SELECTORES ─── */
function selectSingle(qid,idx,correct) {
  if(surveyState.answers[qid]) return;
  const q=SURVEY_DATA.find(x=>x.id===qid), pts=correct?(q.points||10):0;
  surveyState.answers[qid]={chosen:idx,correct,points:pts};
  surveyState.totalScore+=pts;
  renderQuestion(surveyState.current);
}
function toggleMulti(qid,idx,val) {
  if(!surveyState.answers[qid]) surveyState.answers[qid]={choices:[],points:0,correct:null};
  const ans=surveyState.answers[qid], pos=ans.choices.indexOf(idx);
  if(pos===-1){ans.choices.push(idx);ans.points+=val;surveyState.totalScore+=val;}
  else{ans.choices.splice(pos,1);ans.points-=val;surveyState.totalScore-=val;}
  renderQuestion(surveyState.current);
}
function selectScale(qid,idx,val) {
  const prev=surveyState.answers[qid];
  if(prev) surveyState.totalScore-=prev.points;
  surveyState.answers[qid]={chosen:idx,points:val,correct:null};
  surveyState.totalScore+=val;
  renderQuestion(surveyState.current);
}

/* ─── NAVEGACIÓN ─── */
function nextQuestion() {
  const q=SURVEY_DATA[surveyState.current];
  if(!surveyState.answers[q.id]&&q.type!=='multi'&&q.type!=='scale'){shakeBtn('btnNext');return;}
  if(surveyState.current<SURVEY_DATA.length-1){
    surveyState.current++;renderQuestion(surveyState.current);
    document.getElementById('screenQuestions').scrollTop=0;
  } else { showResults(); }
}
function prevQuestion() { if(surveyState.current>0){surveyState.current--;renderQuestion(surveyState.current);} }
function shakeBtn(id) {
  const b=document.getElementById(id);
  ['-6px','6px','-4px','0'].forEach((v,i)=>setTimeout(()=>b.style.transform=`translateX(${v})`,i*80));
}

/* ─── DIMENSIONES ─── */
function calcDimensions() {
  const groups={
    deteccion:SURVEY_DATA.filter(q=>q.category==='deteccion'),
    habitos:SURVEY_DATA.filter(q=>q.category==='habitos'),
    fuentes:SURVEY_DATA.filter(q=>q.category==='fuentes'),
    sesgos:SURVEY_DATA.filter(q=>q.category==='sesgos'),
  };
  function score(qs){
    let got=0,max=0;
    qs.forEach(q=>{
      const a=surveyState.answers[q.id];
      if(q.type==='single'||q.type==='news'){max+=q.points||10;if(a?.correct)got+=q.points||10;}
      else if(q.type==='multi'){const m=q.options.reduce((s,o)=>s+Math.max(0,o.value),0);max+=m;if(a)got+=Math.max(0,a.points);}
      else if(q.type==='scale'){max+=Math.max(...q.valueMap);if(a)got+=a.points;}
    });
    return max>0?Math.round((got/max)*100):0;
  }
  return { deteccion:score(groups.deteccion), habitos:score(groups.habitos), fuentes:score(groups.fuentes), sesgos:score(groups.sesgos) };
}

/* ─── RESULTADOS + FIREBASE ─── */
async function showResults() {
  const maxP=SURVEY_DATA.reduce((acc,q)=>{
    if(q.type==='single'||q.type==='news') return acc+(q.points||10);
    if(q.type==='multi') return acc+q.options.reduce((s,o)=>s+Math.max(0,o.value),0);
    if(q.type==='scale') return acc+Math.max(...q.valueMap);
    return acc;
  },0);
  const pct=Math.min(100,Math.round((Math.max(0,surveyState.totalScore)/maxP)*100));
  const profile=RESULT_PROFILES.find(p=>pct>=p.minScore&&pct<=p.maxScore)||RESULT_PROFILES[RESULT_PROFILES.length-1];
  const dims=calcDimensions();
  const dimArr=[
    {label:'Detección de falsedad',   pct:dims.deteccion, color:'#5566ff'},
    {label:'Hábitos de verificación', pct:dims.habitos,   color:'#f0c040'},
    {label:'Evaluación de fuentes',   pct:dims.fuentes,   color:'#44cc88'},
    {label:'Pensamiento crítico',     pct:dims.sesgos,    color:'#ff4455'},
  ];
  const secs=surveyState.startTime?Math.round((Date.now()-surveyState.startTime)/1000):null;

  // Guardar en Firebase en segundo plano
  saveSurveyResponse({ score:pct, level:profile.level, audience:profile.audience, dimensions:dims, answers:surveyState.answers, completionTime:secs });

  document.getElementById('surveyResultsInner').innerHTML=`
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
      ${dimArr.map(d=>`<div class="result-dim-card">
        <div class="rdim-title">${d.label}</div>
        <div class="rdim-bar-bg"><div class="rdim-bar-fill" style="width:0%;background:${d.color};" data-pct="${d.pct}"></div></div>
        <div class="rdim-value">${d.pct}%</div>
      </div>`).join('')}
    </div>
    <div class="result-recos">
      <h4>🎯 Recomendaciones para ti</h4>
      ${profile.recos.map(r=>`<div class="reco-item"><span class="reco-icon">${r.icon}</span><span>${r.text}</span></div>`).join('')}
    </div>
    <div class="result-cta">
      <h4>Está diseñado para ti</h4>
      <p>InfoFilter tiene un recorrido adaptado a tu nivel actual. Empieza hoy, a tu ritmo, sin costo.</p>
      <div class="result-cta-actions">
        <a href="#inscripcion" class="btn btn-primary" onclick="closeSurvey()">${profile.ctaText}</a>
        <button class="btn btn-ghost" onclick="restartSurvey()">Repetir el test</button>
      </div>
    </div>`;

  showScreen('screenResults');
  setTimeout(()=>{ document.querySelectorAll('.rdim-bar-fill').forEach(el=>{ el.style.transition='width 0.9s ease'; el.style.width=el.dataset.pct+'%'; }); },150);
}

function restartSurvey() { startSurvey(); document.getElementById('surveyModal').scrollTop=0; }
