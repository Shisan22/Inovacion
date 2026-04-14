/* ═══════════════════════════════════════════════════════════════
   InfoFilter — main.js
   ─────────────────────────────────────────────────────────────
   Para configurar Firebase edita FIREBASE_CONFIG y sigue SETUP.md
   ═══════════════════════════════════════════════════════════════ */

// ╔══════════════════════════════════════════════════════════════╗
// ║  🔧 CONFIGURACIÓN FIREBASE — EDITA ESTOS VALORES            ║
// ╚══════════════════════════════════════════════════════════════╝
var firebaseConfig = {
  apiKey: "AIzaSyCtvvtBQYAIVKA7kX2qZLpcZ3YvMda4MNA",
  authDomain: "infofilter-encuesta.firebaseapp.com",
  projectId: "infofilter-encuesta",
  storageBucket: "infofilter-encuesta.firebasestorage.app",
  messagingSenderId: "145086399336",
  appId: "1:145086399336:web:baa01ce1ac5ccc1f36ccdd"
};

/* ══════════════════════════════════════════════════════════════
   FIREBASE — se inicializa cuando el SDK esté disponible
   (los scripts de Firebase se cargan async desde index.html)
   ══════════════════════════════════════════════════════════════ */
var db = null;

function initFirebase() {
  if (typeof firebase === 'undefined') {
    // Firebase aún no cargó (async) — reintentamos en 500ms
    setTimeout(initFirebase, 500);
    return;
  }
  try {
    if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    loadResponseCount();
  } catch (err) {
    console.warn('Firebase no configurado:', err.message);
  }
}

async function loadResponseCount() {
  if (!db) return;
  try {
    var snap  = await db.collection('survey_responses').get();
    var el    = document.getElementById('surveyResponseCount');
    if (el) animateNumber(el, 0, snap.size, 1200);
  } catch (e) { /* sin datos aún */ }
}

function animateNumber(el, from, to, dur) {
  var start = Date.now();
  function step() {
    var p    = Math.min((Date.now() - start) / dur, 1);
    var ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.floor(from + (to - from) * ease).toLocaleString('es-CO');
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

async function saveSurveyResponse(payload) {
  if (!db) return;
  try {
    await db.collection('survey_responses').add({
      timestamp:      firebase.firestore.FieldValue.serverTimestamp(),
      score:          payload.score,
      level:          payload.level,
      audience:       payload.audience,
      dimensions:     payload.dimensions,
      answers:        payload.answers,
      completionTime: payload.completionTime,
      userAgent:      navigator.userAgent.substring(0, 120)
    });
    loadResponseCount();
  } catch (err) {
    console.error('Error guardando:', err.message);
  }
}

/* ══════════════════════════════════════════════════════════════
   DATOS DE LA ENCUESTA
   ══════════════════════════════════════════════════════════════ */
var SURVEY_DATA = [
  {
    id:1, type:'news', category:'deteccion', typeLabel:'🔍 Detecta la desinformación',
    headline:'"La OMS confirmó que el wifi 5G causa daño cerebral permanente según estudio de Harvard publicado en 2024."',
    source:'Compartido por @SaludNatural en Twitter · 48.000 retweets',
    question:'¿Esta noticia es verdadera o falsa?',
    options:[
      {text:'Verdadera — la OMS sí emitió esa advertencia', correct:false},
      {text:'Falsa — es desinformación sin respaldo científico', correct:true}
    ],
    feedback:{
      correct:'✓ Correcto. La OMS no ha vinculado el 5G con daño cerebral. Usar nombres de instituciones reales es una táctica clásica de desinformación.',
      wrong:'✗ Es desinformación. La OMS no emitió esa advertencia. El número de retweets y el tono urgente son señales de alerta.'
    }, points:10
  },
  {
    id:2, type:'news', category:'deteccion', typeLabel:'🔍 Detecta la desinformación',
    headline:'"El IPCC advirtió en 2023 que superar 1.5°C de calentamiento puede ser irreversible."',
    source:'Reuters · Basado en informe técnico AR6',
    question:'¿Esta noticia es verdadera o falsa?',
    options:[
      {text:'Verdadera — el IPCC sí hizo esa advertencia', correct:true},
      {text:'Falsa — el IPCC no ha llegado a esa conclusión', correct:false}
    ],
    feedback:{
      correct:'✓ Correcto. El IPCC publicó esa conclusión en su informe AR6. Reuters es una fuente primaria confiable.',
      wrong:'✗ Es verdadera. El IPCC sí emitió esa advertencia. La desconfianza en medios legítimos también es efecto de la desinformación.'
    }, points:10
  },
  {
    id:3, type:'news', category:'deteccion', typeLabel:'🔍 Detecta la desinformación',
    headline:'"Video muestra al presidente firmando decreto secreto para eliminar pensiones. El gobierno lo ocultó a los medios."',
    source:'Blog "VerdadUrgente.net" · Sin fecha · Sin autor',
    question:'¿Esta noticia merece verificarse antes de compartirse?',
    options:[
      {text:'No, el video es prueba suficiente', correct:false},
      {text:'Sí — tiene múltiples señales de alarma', correct:true},
      {text:'Depende de quién la comparte', correct:false}
    ],
    feedback:{
      correct:'✓ Exacto. "Decreto secreto", "el gobierno lo ocultó", sin fecha ni autor y dominio desconocido son señales de alerta clásicas.',
      wrong:'✗ Esta noticia tiene varias banderas rojas: palabras como "secreto" y "ocultó", sin fecha ni autor, dominio sin credenciales.'
    }, points:10
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
      {text:'Reviso la fecha para asegurarme que es reciente', value:2}
    ],
    feedback:{neutral:'📊 Registrado. Los hábitos de verificación son el corazón de la alfabetización mediática.'}
  },
  {
    id:5, type:'single', category:'fuentes', typeLabel:'📰 Evaluación de fuentes',
    question:'¿Cuál hace que una fuente sea más confiable?',
    options:[
      {text:'Tiene muchos seguidores en redes sociales', correct:false},
      {text:'Menciona instituciones conocidas (OMS, NASA…)', correct:false},
      {text:'Cita fuentes primarias verificables y transparenta su metodología', correct:true},
      {text:'Publica noticias con alta frecuencia', correct:false}
    ],
    feedback:{
      correct:'✓ La transparencia metodológica y la citación de fuentes primarias son los indicadores más sólidos de credibilidad.',
      wrong:'✗ La confiabilidad no viene del tamaño ni de mencionar instituciones. Una fuente confiable cita fuentes primarias verificables.'
    }, points:10
  },
  {
    id:6, type:'single', category:'sesgos', typeLabel:'🧠 Pensamiento crítico',
    question:'¿Qué es el "sesgo de confirmación" en el consumo de noticias?',
    options:[
      {text:'Confundir noticias satíricas con noticias reales', correct:false},
      {text:'Creer más fácilmente la información que confirma nuestras ideas previas', correct:true},
      {text:'Compartir noticias sin leerlas completas', correct:false},
      {text:'Ignorar noticias de medios internacionales', correct:false}
    ],
    feedback:{
      correct:'✓ Correcto. El sesgo de confirmación es uno de los mecanismos más explotados por los creadores de desinformación.',
      wrong:'✗ Es la tendencia a creer la información que refuerza nuestras creencias previas, ignorando la evidencia contraria.'
    }, points:10
  },
  {
    id:7, type:'news', category:'deteccion', typeLabel:'🖼️ Imagen y contexto',
    headline:'"Fotografía muestra tanques militares en las calles de Bogotá durante protestas de esta semana."',
    source:'Imagen viral · Sin geolocalización · Sin fecha visible',
    question:'¿Qué deberías hacer antes de creer o compartir esto?',
    options:[
      {text:'Compartirla si la imagen parece auténtica', correct:false},
      {text:'Hacer búsqueda inversa de la imagen para verificar su origen real', correct:true},
      {text:'Confiar si muchas personas la están compartiendo', correct:false}
    ],
    feedback:{
      correct:'✓ La búsqueda inversa (Google Images, TinEye) permite descubrir si una imagen fue tomada en otro contexto, país o año.',
      wrong:'✗ La cantidad de shares no valida una imagen. La búsqueda inversa puede revelar que la foto es de otro país o de hace años.'
    }, points:10
  },
  {
    id:8, type:'scale', category:'habitos', typeLabel:'📊 Autodiagnóstico',
    question:'¿Con qué frecuencia verificas activamente la información antes de creerla?',
    scaleLabels:['Casi nunca','Siempre'],
    options:['1','2','3','4','5'],
    valueMap:[0,3,6,8,10],
    feedback:{neutral:'📋 Anotado. La verificación consistente es un hábito que se construye con práctica.'}
  },
  {
    id:9, type:'news', category:'deteccion', typeLabel:'🔍 Detecta la desinformación',
    headline:'"El FMI declaró que Colombia es el país con mayor inflación de América Latina en 2024 con un 89% anual."',
    source:'Cadena de WhatsApp · Sin link · Sin fuente directa',
    question:'¿Esta afirmación merece verificarse?',
    options:[
      {text:'No, el FMI es confiable así que debe ser cierto', correct:false},
      {text:'Sí — mencionar al FMI no valida la afirmación sin link directo', correct:true},
      {text:'Solo si parece una cifra exagerada', correct:false}
    ],
    feedback:{
      correct:'✓ Correcto. Asociar datos falsos a instituciones reconocidas es una técnica muy común de desinformación.',
      wrong:'✗ Nombrar al FMI no valida nada. Siempre busca el link directo a la publicación oficial.'
    }, points:10
  },
  {
    id:10, type:'multi', category:'habitos', typeLabel:'💬 Comunicación responsable',
    question:'¿Qué harías si descubres que compartiste algo falso? (elige todas las que apliquen)',
    options:[
      {text:'Elimino la publicación original', value:3},
      {text:'Publico una corrección explicando el error', value:4},
      {text:'No hago nada, nadie lo nota', value:0},
      {text:'Aviso a las personas que lo compartieron por mi cuenta', value:4},
      {text:'Me queda la lección de verificar antes', value:2}
    ],
    feedback:{neutral:'📋 Tu respuesta revela tu actitud ante el error informativo. La corrección activa es uno de los gestos más valiosos en el ecosistema digital.'}
  }
];

var RESULT_PROFILES = [
  {
    minScore:0, maxScore:25, level:'Principiante informativo', icon:'🌱', audience:'usuario_principiante',
    desc:'Aún no cuentas con herramientas sólidas para filtrar información. Eso no es tu culpa: nadie nos enseña esto formalmente. Con el programa correcto, el cambio es rápido.',
    recos:[
      {icon:'📚', text:'Comienza por el Módulo 1: aprende qué es el sesgo de confirmación y cómo te afecta sin que te des cuenta.'},
      {icon:'🔎', text:'Instala la extensión de búsqueda inversa de Google en tu navegador hoy mismo.'},
      {icon:'📵', text:'Antes de compartir algo, pregúntate: ¿lo leí completo? ¿sé quién lo escribió?'},
      {icon:'🎯', text:'InfoFilter fue diseñado para tu perfil. El Módulo 2 te muestra los 5 tipos de desinformación más comunes.'}
    ], ctaText:'Quiero mejorar mi filtro'
  },
  {
    minScore:26, maxScore:50, level:'Lector en formación', icon:'📖', audience:'usuario_intermedio',
    desc:'Tienes conciencia del problema y buenos instintos, pero tus hábitos de verificación son inconsistentes. Con práctica estructurada puedes convertirte en un lector muy sólido.',
    recos:[
      {icon:'✅', text:'Trabaja el Módulo 3: aprende a usar fact-checkers profesionales en menos de 2 minutos por noticia.'},
      {icon:'🧠', text:'Practica identificar el sesgo de confirmación en noticias sobre temas que te generan emoción fuerte.'},
      {icon:'📰', text:'Crea tu propio mapa de fuentes confiables por categoría (salud, economía, política).'},
      {icon:'🌐', text:'El Módulo 4 te da herramientas para información política y electoral.'}
    ], ctaText:'Quiero afinar mis hábitos'
  },
  {
    minScore:51, maxScore:75, level:'Verificador activo', icon:'🔍', audience:'usuario_avanzado',
    desc:'Ya verificas información con frecuencia y reconoces señales de alerta. Tu desafío es sistematizar ese conocimiento y aplicarlo de forma consistente, incluso cuando el tema te genera emoción.',
    recos:[
      {icon:'⚡', text:'Profundiza en el Módulo 5: desinformación científica, donde los atajos cognitivos son más fáciles de explotar.'},
      {icon:'🗣️', text:'Aprende a corregir desinformación sin generar polarización — el Módulo 6 tiene técnicas basadas en investigación.'},
      {icon:'📊', text:'Aprende a leer gráficas y datos: la manipulación estadística es tan común como la de texto.'},
      {icon:'👥', text:'Considera convertirte en multiplicador: enseñar a otros consolida tu propio conocimiento.'}
    ], ctaText:'Quiero ir al siguiente nivel'
  },
  {
    minScore:76, maxScore:100, level:'Analista crítico', icon:'🏆', audience:'usuario_experto',
    desc:'¡Excelente! Tienes una base muy sólida de pensamiento crítico y hábitos de verificación. Eres exactamente el tipo de persona que puede ayudar a otros a mejorar.',
    recos:[
      {icon:'🎓', text:'Explora el Módulo 6 completo para convertirte en un comunicador responsable que ayuda a frenar cadenas de desinformación.'},
      {icon:'🌍', text:'Comparte recursos de verificación en tus redes — tu influencia puede tener efecto multiplicador.'},
      {icon:'🔬', text:'Profundiza en análisis de datos y visualizaciones: es el próximo nivel de la manipulación informativa.'},
      {icon:'💡', text:'El programa tiene módulos avanzados diseñados para perfiles como el tuyo.'}
    ], ctaText:'Ver el programa completo'
  }
];

/* ══════════════════════════════════════════════════════════════
   ESTADO DE LA ENCUESTA
   ══════════════════════════════════════════════════════════════ */
var surveyState = { current:0, answers:{}, totalScore:0, started:false, startTime:null };

/* ══════════════════════════════════════════════════════════════
   FUNCIONES GLOBALES DE LA ENCUESTA
   Definidas en el scope global para que los onclick del HTML funcionen
   ══════════════════════════════════════════════════════════════ */

function openSurvey() {
  var el = document.getElementById('surveyOverlay');
  if (!el) return;
  el.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSurvey() {
  var el = document.getElementById('surveyOverlay');
  if (!el) return;
  el.classList.remove('open');
  document.body.style.overflow = '';
}

function startSurvey() {
  surveyState = { current:0, answers:{}, totalScore:0, started:true, startTime:Date.now() };
  showScreen('screenQuestions');
  renderQuestion(0);
}

function showScreen(id) {
  document.querySelectorAll('.survey-screen').forEach(function(s){ s.classList.remove('active'); });
  var target = document.getElementById(id);
  if (target) target.classList.add('active');
}

function nextQuestion() {
  var q = SURVEY_DATA[surveyState.current];
  if (!surveyState.answers[q.id] && q.type !== 'multi' && q.type !== 'scale') {
    shakeBtn('btnNext'); return;
  }
  if (surveyState.current < SURVEY_DATA.length - 1) {
    surveyState.current++;
    renderQuestion(surveyState.current);
    var screen = document.getElementById('screenQuestions');
    if (screen) screen.scrollTop = 0;
  } else {
    showResults();
  }
}

function prevQuestion() {
  if (surveyState.current > 0) { surveyState.current--; renderQuestion(surveyState.current); }
}

function restartSurvey() {
  startSurvey();
  var modal = document.getElementById('surveyModal');
  if (modal) modal.scrollTop = 0;
}

function shakeBtn(id) {
  var b = document.getElementById(id);
  if (!b) return;
  ['-6px','6px','-4px','0'].forEach(function(v, i){
    setTimeout(function(){ b.style.transform = 'translateX('+v+')'; }, i*80);
  });
}

function selectSingle(qid, idx, correct) {
  if (surveyState.answers[qid]) return;
  var q   = SURVEY_DATA.filter(function(x){ return x.id === qid; })[0];
  var pts = correct ? (q.points || 10) : 0;
  surveyState.answers[qid] = { chosen:idx, correct:correct, points:pts };
  surveyState.totalScore  += pts;
  renderQuestion(surveyState.current);
}

function toggleMulti(qid, idx, val) {
  if (!surveyState.answers[qid]) surveyState.answers[qid] = { choices:[], points:0, correct:null };
  var ans = surveyState.answers[qid];
  var pos = ans.choices.indexOf(idx);
  if (pos === -1) { ans.choices.push(idx); ans.points += val; surveyState.totalScore += val; }
  else            { ans.choices.splice(pos,1); ans.points -= val; surveyState.totalScore -= val; }
  renderQuestion(surveyState.current);
}

function selectScale(qid, idx, val) {
  var prev = surveyState.answers[qid];
  if (prev) surveyState.totalScore -= prev.points;
  surveyState.answers[qid] = { chosen:idx, points:val, correct:null };
  surveyState.totalScore  += val;
  renderQuestion(surveyState.current);
}

function renderQuestion(idx) {
  var q     = SURVEY_DATA[idx];
  var total = SURVEY_DATA.length;
  var fill  = document.getElementById('surveyProgressFill');
  var label = document.getElementById('surveyProgressLabel');
  var prev  = document.getElementById('btnPrev');
  var next  = document.getElementById('btnNext');
  var area  = document.getElementById('surveyQuestionArea');
  if (!area) return;

  if (fill)  fill.style.width  = Math.round((idx/total)*100) + '%';
  if (label) label.textContent = (idx+1) + ' / ' + total;
  if (prev)  prev.style.visibility = idx === 0 ? 'hidden' : 'visible';
  if (next)  next.textContent = idx === total-1 ? 'Ver mis resultados →' : 'Siguiente →';

  var ans  = surveyState.answers[q.id];
  var html = '<p class="q-type-label">' + q.typeLabel + '</p>';

  if (q.type === 'news' || q.type === 'single') {
    if (q.type === 'news') {
      html += '<div class="q-news-card">&ldquo;' + q.headline + '&rdquo;'
            + '<div class="q-news-source">🔗 ' + q.source + '</div></div>';
    }
    html += '<p class="q-text">' + q.question + '</p><div class="q-options">';
    q.options.forEach(function(opt, i){
      var cls      = 'q-option';
      if (ans) {
        if (opt.correct) cls += ' correct-reveal';
        else if (ans.chosen === i && !opt.correct) cls += ' wrong-reveal';
      }
      var disabled = ans ? 'disabled' : '';
      var marker   = String.fromCharCode(65 + i);
      html += '<button class="' + cls + '" onclick="selectSingle(' + q.id + ',' + i + ',' + opt.correct + ')" ' + disabled + '>'
            + '<span class="q-option-marker">' + marker + '</span>' + opt.text + '</button>';
    });
    html += '</div>';
  }
  else if (q.type === 'multi') {
    html += '<p class="q-text">' + q.question + '</p><div class="q-options">';
    q.options.forEach(function(opt, i){
      var sel = ans && ans.choices && ans.choices.indexOf(i) !== -1;
      html += '<button class="q-check-option' + (sel ? ' checked' : '') + '" onclick="toggleMulti(' + q.id + ',' + i + ',' + opt.value + ')">'
            + '<span class="q-checkbox">' + (sel ? '✓' : '') + '</span>' + opt.text + '</button>';
    });
    html += '</div>';
  }
  else if (q.type === 'scale') {
    html += '<p class="q-text">' + q.question + '</p><div class="q-scale">';
    q.options.forEach(function(val, i){
      var sel = ans && ans.chosen === i;
      html += '<button class="q-scale-btn' + (sel ? ' selected' : '') + '" onclick="selectScale(' + q.id + ',' + i + ',' + q.valueMap[i] + ')">' + val + '</button>';
    });
    html += '</div><div class="q-scale-labels"><span>' + q.scaleLabels[0] + '</span><span>' + q.scaleLabels[1] + '</span></div>';
  }

  if (ans) {
    var fbType = ans.correct === true  ? 'correct-fb' : ans.correct === false ? 'wrong-fb' : 'neutral-fb';
    var fbText = ans.correct === true  ? q.feedback.correct : ans.correct === false ? q.feedback.wrong : q.feedback.neutral;
    html += '<div class="q-feedback show ' + fbType + '">' + fbText + '</div>';
  } else {
    html += '<div class="q-feedback"></div>';
  }
  area.innerHTML = html;
}

function calcDimensions() {
  var groups = {
    deteccion: SURVEY_DATA.filter(function(q){ return q.category==='deteccion'; }),
    habitos:   SURVEY_DATA.filter(function(q){ return q.category==='habitos'; }),
    fuentes:   SURVEY_DATA.filter(function(q){ return q.category==='fuentes'; }),
    sesgos:    SURVEY_DATA.filter(function(q){ return q.category==='sesgos'; })
  };
  function score(qs) {
    var got=0, max=0;
    qs.forEach(function(q){
      var a = surveyState.answers[q.id];
      if (q.type==='single'||q.type==='news') {
        max += q.points||10;
        if (a && a.correct) got += q.points||10;
      } else if (q.type==='multi') {
        var m = q.options.reduce(function(s,o){ return s+Math.max(0,o.value); }, 0);
        max += m; if (a) got += Math.max(0, a.points);
      } else if (q.type==='scale') {
        max += Math.max.apply(null, q.valueMap);
        if (a) got += a.points;
      }
    });
    return max > 0 ? Math.round((got/max)*100) : 0;
  }
  return {
    deteccion: score(groups.deteccion), habitos: score(groups.habitos),
    fuentes:   score(groups.fuentes),   sesgos:  score(groups.sesgos)
  };
}

async function showResults() {
  var maxP = SURVEY_DATA.reduce(function(acc,q){
    if (q.type==='single'||q.type==='news') return acc+(q.points||10);
    if (q.type==='multi') return acc+q.options.reduce(function(s,o){ return s+Math.max(0,o.value); },0);
    if (q.type==='scale') return acc+Math.max.apply(null,q.valueMap);
    return acc;
  }, 0);
  var pct     = Math.min(100, Math.round((Math.max(0, surveyState.totalScore)/maxP)*100));
  var profile = RESULT_PROFILES.filter(function(p){ return pct>=p.minScore && pct<=p.maxScore; })[0]
                || RESULT_PROFILES[RESULT_PROFILES.length-1];
  var dims    = calcDimensions();
  var dimArr  = [
    {label:'Detección de falsedad',   pct:dims.deteccion, color:'#5566ff'},
    {label:'Hábitos de verificación', pct:dims.habitos,   color:'#f0c040'},
    {label:'Evaluación de fuentes',   pct:dims.fuentes,   color:'#44cc88'},
    {label:'Pensamiento crítico',     pct:dims.sesgos,    color:'#ff4455'}
  ];
  var secs = surveyState.startTime ? Math.round((Date.now()-surveyState.startTime)/1000) : null;

  saveSurveyResponse({ score:pct, level:profile.level, audience:profile.audience,
    dimensions:dims, answers:surveyState.answers, completionTime:secs });

  var dimsHtml  = dimArr.map(function(d){
    return '<div class="result-dim-card">'
      +'<div class="rdim-title">'+d.label+'</div>'
      +'<div class="rdim-bar-bg"><div class="rdim-bar-fill" style="width:0%;background:'+d.color+';" data-pct="'+d.pct+'"></div></div>'
      +'<div class="rdim-value">'+d.pct+'%</div></div>';
  }).join('');
  var recosHtml = profile.recos.map(function(r){
    return '<div class="reco-item"><span class="reco-icon">'+r.icon+'</span><span>'+r.text+'</span></div>';
  }).join('');

  var container = document.getElementById('surveyResultsInner');
  if (container) container.innerHTML =
    '<div class="result-header">'
      +'<div class="result-level-icon">'+profile.icon+'</div>'
      +'<h3 class="result-level-name">'+profile.level+'</h3>'
      +'<div class="result-score-ring"><span class="result-score-num">'+pct+'</span><span class="result-score-lbl">/ 100</span></div>'
      +'<p class="result-desc">'+profile.desc+'</p></div>'
    +'<div class="result-dimensions">'+dimsHtml+'</div>'
    +'<div class="result-recos"><h4>🎯 Recomendaciones para ti</h4>'+recosHtml+'</div>'
    +'<div class="result-cta"><h4>Está diseñado para ti</h4>'
      +'<p>InfoFilter tiene un recorrido adaptado a tu nivel actual. Empieza hoy, a tu ritmo, sin costo.</p>'
      +'<div class="result-cta-actions">'
        +'<a href="#inscripcion" class="btn btn-primary" onclick="closeSurvey()">'+profile.ctaText+'</a>'
        +'<button class="btn btn-ghost" onclick="restartSurvey()">Repetir el test</button>'
      +'</div></div>';

  showScreen('screenResults');
  setTimeout(function(){
    document.querySelectorAll('.rdim-bar-fill').forEach(function(el){
      el.style.transition = 'width 0.9s ease';
      el.style.width      = el.getAttribute('data-pct') + '%';
    });
  }, 150);
}

/* ══════════════════════════════════════════════════════════════
   SETUP DEL DOM — corre cuando el documento está listo
   ══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {

  // Firebase (con retry porque se carga async)
  initFirebase();

  // Contador animado del hero
  var counterEl = document.getElementById('counterNum');
  if (counterEl) {
    var target = 1247893, dur = 2200, start = Date.now();
    function heroStep() {
      var p = Math.min((Date.now()-start)/dur, 1);
      counterEl.textContent = Math.floor((1-Math.pow(1-p,3))*target).toLocaleString('es-CO');
      if (p < 1) requestAnimationFrame(heroStep);
    }
    setTimeout(function(){ requestAnimationFrame(heroStep); }, 600);
  }

  // Navbar menú móvil
  var navToggle = document.querySelector('.nav-toggle');
  var navLinks  = document.querySelector('.nav-links');
  if (navToggle) navToggle.addEventListener('click', function(){ navLinks.classList.toggle('open'); });
  if (navLinks) navLinks.querySelectorAll('a').forEach(function(l){
    l.addEventListener('click', function(){ navLinks.classList.remove('open'); });
  });

  // Navbar sombra al scroll
  var navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function(){
    if (navbar) navbar.style.boxShadow = window.scrollY > 20 ? '0 4px 32px rgba(0,0,0,0.4)' : 'none';
  });

  // Animaciones de entrada con IntersectionObserver
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting){
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        obs.unobserve(e.target);
      }
    });
  }, { threshold:0.1, rootMargin:'0px 0px -60px 0px' });

  document.querySelectorAll('.problema-card,.stat-item,.modulo-card,.tool-card,.met-step').forEach(function(el,i){
    el.style.opacity   = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.5s ease '+(i*0.07)+'s, transform 0.5s ease '+(i*0.07)+'s';
    obs.observe(el);
  });

  // Barra de progreso de lectura
  var readBar = document.createElement('div');
  readBar.style.cssText = 'position:fixed;top:0;left:0;height:2px;background:var(--color-accent);z-index:9999;transition:width 0.1s;width:0%;pointer-events:none;';
  document.body.appendChild(readBar);
  window.addEventListener('scroll', function(){
    var pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
    readBar.style.width = (pct||0) + '%';
  });

  // Cerrar modal con Escape o clic fuera
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closeSurvey(); });
  var overlay = document.getElementById('surveyOverlay');
  if (overlay) overlay.addEventListener('click', function(e){
    if (e.target.id === 'surveyOverlay') closeSurvey();
  });

});

// handleFormSubmit es llamado desde onsubmit en HTML — debe ser global
function handleFormSubmit(e) {
  e.preventDefault();
  var input = e.target.querySelector('.cta-input');
  var btn   = e.target.querySelector('button');
  if (!input || !btn) return;
  btn.textContent     = '¡Listo! Te confirmaremos pronto ✓';
  btn.style.background = 'var(--color-success)';
  input.value = ''; input.disabled = true; btn.disabled = true;
  setTimeout(function(){
    btn.textContent     = 'Quiero inscribirme';
    btn.style.background = '';
    input.disabled = false; btn.disabled = false;
  }, 5000);
}
