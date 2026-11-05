/* ==========================================================================
   FIGHTING GEAR BOLIVIA — TIKTOK LIVE SHOPPING
   Diseño Web II • Criterio 1: JS y DOM/BOM (Unificación Día 1 + Día 2)
   Archivo: script.js
   ========================================================================== */

// Referencias principales del DOM — Día 1
const liveContainer = document.getElementById('liveContainer');
const chatUser = document.getElementById('chatUser');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const typingStatus = document.getElementById('typingStatus');
const chatFeedback = document.getElementById('chatFeedback');
const logOutput = document.getElementById('logOutput');
const floatingHearts = document.getElementById('floatingHearts');
const catalogCount = document.getElementById('catalogCount');

// Referencias principales del DOM — Día 2
const orderForm = document.getElementById('orderForm');
const productSelect = document.getElementById('productSelect');
const variantSelect = document.getElementById('variantSelect');
const userTikTok = document.getElementById('userTikTok');
const orderTotalPrice = document.getElementById('orderTotalPrice');
const formFeedback = document.getElementById('formFeedback');
const logDia2 = document.getElementById('logDia2');

// Contadores y controles de interfaz
const likeCounterEl = document.getElementById('likeCounter');
const salesCounterEl = document.getElementById('salesCounter');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const clearLog1Btn = document.getElementById('clearLog1Btn');
const clearLog2Btn = document.getElementById('clearLog2Btn');

let totalLikes = 4210;
let totalSales = 0;

// Expresión regular para validar cuentas de TikTok (@usuario)
const regexTikTokUser = /^@[A-Za-z0-9_.]{3,}$/;

// Palabras clave para detectar intención de compra en el chat en directo
const palabrasCompra = [
  'quiero', 'comprar', 'precio', 'cuanto', 'cuánto', 'stock', 'envio', 'envío',
  'reservar', 'pedido', 'dualsense', 'victrix', 'octa', 'kitsune', 'haute',
  'snack', 'obsidian', 'daija', 'alpha', 'mayflash', 'sanwa', 'seimitsu', 'brook', 'hitbox'
];

/* ==========================================================================
   FUNCIONES DE AUDITORÍA VISUAL (BITÁCORAS DÍA 1 Y DÍA 2)
   ========================================================================== */

/**
 * Registra un evento en la Bitácora del Stream (Día 1 - #logOutput)
 */
function logEvent(tipo, mensaje, claseExtra = '') {
  const hora = new Date().toLocaleTimeString();
  const item = document.createElement('div');
  item.className = `log-entry ${claseExtra}`.trim();
  item.innerHTML = `[${hora}] <strong>${tipo}:</strong> ${mensaje}`;
  logOutput.prepend(item);
}

/**
 * Registra una transacción o cambio de variante en la Bitácora Día 2 (#logDia2)
 */
function addLog(tipo, msg, claseExtra = '') {
  const t = new Date().toLocaleTimeString();
  const row = document.createElement('div');
  row.className = `log-entry ${claseExtra}`.trim();
  row.innerHTML = `[${t}] <strong>${tipo}:</strong> ${msg}`;
  logDia2.prepend(row);
}

/* ==========================================================================
   UTILIDADES VISUALES (CORAZONES FLOTANTES Y CÁLCULO DE TOTAL)
   ========================================================================== */

function lanzarCorazonesVisuales(cantidad = 1) {
  const iconos = ['❤️', '🔥', '🥊', '⚡', '🕹️'];
  for (let i = 0; i < cantidad; i++) {
    const span = document.createElement('span');
    span.className = 'heart-particle';
    span.textContent = iconos[Math.floor(Math.random() * iconos.length)];
    span.style.left = `${15 + Math.random() * 70}%`;
    span.style.bottom = `${10 + Math.random() * 25}px`;
    floatingHearts.appendChild(span);
    setTimeout(() => span.remove(), 1100);
  }
}

function actualizarTotalCheckout() {
  const opcionProd = productSelect.options[productSelect.selectedIndex];
  const opcionVar = variantSelect.options[variantSelect.selectedIndex];
  const precioBase = Number(opcionProd?.dataset.price || 0);
  const precioExtra = Number(opcionVar?.dataset.extra || 0);
  const total = precioBase + precioExtra;
  orderTotalPrice.textContent = `${total.toLocaleString('es-BO')} BOB`;
  return { total, precioBase, precioExtra };
}

function resaltarTarjetaProducto(nombreProd) {
  const cards = document.querySelectorAll('.product-card');
  cards.forEach((card) => {
    const esSeleccionado = card.dataset.prod === nombreProd;
    card.classList.toggle('selected-card', esSeleccionado);

    // Sincronizar el círculo central en la pantalla de TikTok Live
    if (esSeleccionado) {
      const imgEl = card.querySelector('img');
      const imgSrc = imgEl ? imgEl.getAttribute('src') : 'razer_kitsune.jpg';

      const liveShowcaseImg = document.getElementById('liveShowcaseImg');
      const liveShowcaseTitle = document.getElementById('liveShowcaseTitle');

      if (liveShowcaseImg) liveShowcaseImg.src = imgSrc;
      if (liveShowcaseTitle) liveShowcaseTitle.textContent = `Probando en vivo: ${nombreProd}`;
    }
  });
}

function filtrarCatalogo(categoria) {
  const cards = document.querySelectorAll('.product-card');
  let visibles = 0;

  cards.forEach((card) => {
    const coincide = categoria === 'todos' || card.dataset.category === categoria;
    card.classList.toggle('hidden', !coincide);
    if (coincide) visibles++;
  });

  catalogCount.textContent = visibles;

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.filter === categoria);
  });

  logEvent('FILTRO_DOM', `Categoría filtrada en directo: "${categoria.toUpperCase()}" (${visibles} productos visibles)`);
}

/* ==========================================================================
   DÍA 1: DELEGACIÓN DE EVENTOS EN #liveContainer (Event Bubbling)
   1. Evento click (Ofertas relámpago, tarjetas de producto, filtros y botón Like)
   2. Evento dblclick (Ráfaga de corazones / Combo Like al Stream)
   ========================================================================== */

liveContainer.addEventListener('click', (e) => {
  // A) Filtrado por categoría si se hizo clic en un botón de filtro
  const filterBtn = e.target.closest('[data-filter]');
  if (filterBtn) {
    filtrarCatalogo(filterBtn.dataset.filter);
    return;
  }

  // B) Botón "+ Seguir" de TikTok Live mediante delegación (data-action="follow")
  const followBtn = e.target.closest('[data-action="follow"]');
  if (followBtn) {
    const siguiendo = followBtn.classList.toggle('following');
    followBtn.textContent = siguiendo ? '✓ Siguiendo' : '+ Seguir';
    logEvent('FOLLOW_LIVE', siguiendo ? 'El espectador comenzó a seguir a @FightingGear_BO en TikTok.' : 'El espectador dejó de seguir la cuenta.');
    return;
  }

  // C) Botón de Audio del Live (TEKKEN 8 OST - Ortiz Farm / Golden Meadow)
  const audioBtn = e.target.closest('[data-action="toggle-audio"]');
  if (audioBtn) {
    const liveAudio = document.getElementById('liveAudio');
    if (liveAudio) {
      liveAudio.volume = 0.5;
      if (liveAudio.paused) {
        liveAudio.play()
          .then(() => {
            audioBtn.classList.add('playing');
            audioBtn.textContent = '🔇 Silenciar Live';
            logEvent('AUDIO_LIVE', '🎵 Reproduciendo en directo: TEKKEN 8 OST — Ortiz Farm 1st (Golden Meadow)');
          })
          .catch(() => {
            logEvent('AUDIO_LIVE', '⚠️ Haz clic de nuevo para habilitar la reproducción de audio en el navegador.', 'system');
          });
      } else {
        liveAudio.pause();
        audioBtn.classList.remove('playing');
        audioBtn.textContent = '🔊 Audio del Live';
        logEvent('AUDIO_LIVE', '🔇 Música del Live silenciada por el espectador.');
      }
    }
    return;
  }

  // D) Botón de Like al Stream mediante delegación (data-action="like")
  const likeBtn = e.target.closest('[data-action="like"]');
  if (likeBtn) {
    totalLikes += 1;
    likeCounterEl.textContent = totalLikes.toLocaleString('es-BO');
    lanzarCorazonesVisuales(2);
    logEvent('LIKE_STREAM', '¡El espectador envió un ❤️ al Live de Fighting Gear!', 'like');
    return;
  }

  // E) Selección de producto del catálogo (data-prod)
  const prodElement = e.target.closest('[data-prod]');
  if (prodElement) {
    const nombreProd = prodElement.dataset.prod;
    const precioProd = prodElement.dataset.price || '';

    // Sincronizar con el selector del Checkout Rápido (Día 2)
    productSelect.value = nombreProd;
    resaltarTarjetaProducto(nombreProd);
    const { total } = actualizarTotalCheckout();

    // Registrar únicamente en la Bitácora del Día 2 (#logDia2)
    addLog(
      'OFERTA_CLICK',
      `Producto seleccionado desde catálogo: ${nombreProd} (${precioProd} BOB) — Total: ${total} BOB`,
      'oferta'
    );
  }
});

// Evento dblclick (Doble Clic) requerido en la Guía del Día 1 para enviar corazones / Likes al Live
liveContainer.addEventListener('dblclick', (e) => {
  const stageOrLike = e.target.closest('[data-action="like-stage"], [data-action="like"]');
  if (stageOrLike) {
    totalLikes += 5;
    likeCounterEl.textContent = totalLikes.toLocaleString('es-BO');
    lanzarCorazonesVisuales(6);
    logEvent(
      'LIKE_DBLCLICK',
      '⚡ ¡COMBO DBLCLICK! El usuario envió una ráfaga de +5 ❤️ (Electric Wind God Fist) al Live Stream.',
      'like'
    );
  }
});

/* ==========================================================================
   DÍA 1: CAPTURA DE EVENTOS DE TECLADO EN EL CHAT (keyup) Y VALIDACIÓN
   ========================================================================== */

/**
 * Función reutilizable de validación para Día 1 (Chat) y Día 2 (Compra)
 * Debe comenzar con "@" y tener al menos 3 caracteres válidos (letras, números, _ o .)
 */
function validarUsuarioTikTok(usuario) {
  return regexTikTokUser.test(usuario);
}

function enviarComentarioChat() {
  const usuario = chatUser.value.trim();
  const mensaje = chatInput.value.trim();

  // 1. Validar que exista un usuario de TikTok y que cumpla el formato @usuario
  if (!validarUsuarioTikTok(usuario)) {
    chatFeedback.textContent = '⚠️ Ingresa una cuenta de TikTok válida que comience con "@" y tenga al menos 3 caracteres (ej. @kazuya_bo).';
    chatFeedback.className = 'form-feedback error';
    logEvent('ERROR_VALIDACIÓN', `Comentario rechazado: usuario "${usuario || 'vacío'}" inválido. Debe cumplir el formato @usuario.`, 'system');
    chatUser.focus();
    return;
  }

  // 2. Validar que el comentario no esté vacío
  if (!mensaje) {
    chatFeedback.textContent = '⚠️ Escribe un comentario para enviar al Live.';
    chatFeedback.className = 'form-feedback error';
    logEvent('ERROR_VALIDACIÓN', 'Comentario rechazado: el campo de mensaje está vacío.', 'system');
    chatInput.focus();
    return;
  }

  // Si pasa ambas validaciones, limpiar errores y procesar comentario
  formFeedback.textContent = '';
  chatFeedback.textContent = '✅ Comentario enviado al Live.';
  chatFeedback.className = 'form-feedback success';

  const textoLower = mensaje.toLowerCase();
  const esIntencionCompra = palabrasCompra.some((palabra) => textoLower.includes(palabra));

  if (esIntencionCompra) {
    logEvent(
      'PEDIDO_CHAT',
      `🔥 Intención de compra detectada de <strong>${usuario}</strong>: "${mensaje}"`,
      'pedido'
    );
    // Copiar automáticamente el usuario válido al formulario de compra del Día 2
    if (!userTikTok.value.trim()) {
      userTikTok.value = usuario;
    }
  } else {
    logEvent('CHAT_COMENTARIO', `${usuario} comentó en directo: "${mensaje}"`);
  }

  // Mostrar el comentario también dentro de la pantalla de TikTok Live
  const ttLiveComments = document.getElementById('ttLiveComments');
  if (ttLiveComments) {
    const bubble = document.createElement('div');
    bubble.className = 'tt-comment-item';
    bubble.innerHTML = `<strong>${usuario}:</strong> ${mensaje}`;
    ttLiveComments.appendChild(bubble);
    while (ttLiveComments.children.length > 2) {
      ttLiveComments.removeChild(ttLiveComments.firstElementChild);
    }
  }

  chatInput.value = '';
  typingStatus.textContent = '';
}

chatInput.addEventListener('keyup', (e) => {
  // 1. Si presiona Enter, procesa y registra el comentario completo en la bitácora
  if (e.key === 'Enter') {
    enviarComentarioChat();
    return;
  }

  // 2. Indicador en tiempo real del evento keyup en una sola línea (sin saturar la bitácora)
  const textoActual = e.target.value.trim();
  const usuario = chatUser.value.trim() || '(sin @usuario)';
  if (textoActual.length > 0) {
    typingStatus.textContent = `✍️ [keyup] ${usuario} está escribiendo: "${textoActual}" (${textoActual.length} caracteres)`;
  } else {
    typingStatus.textContent = '';
  }
});

sendChatBtn.addEventListener('click', enviarComentarioChat);

/* ==========================================================================
   DÍA 2: GESTIÓN DE FORMULARIO Y CONTROL DE DATOS EN VIVO (change y submit)
   ========================================================================== */

// 1. Capturar evento change en el selector de producto
productSelect.addEventListener('change', (e) => {
  const nuevoProd = e.target.value;
  resaltarTarjetaProducto(nuevoProd);
  const { total } = actualizarTotalCheckout();
  addLog('CAMBIO_PRODUCTO', `El cliente eligió el mando/accesorio: ${nuevoProd} (Total: ${total} BOB)`);
});

// 2. Capturar evento change en el selector de variantes (Guía Día 2)
variantSelect.addEventListener('change', (e) => {
  const varianteElegida = e.target.value;
  const { total } = actualizarTotalCheckout();
  addLog(
    'CAMBIO_VARIANTE',
    `El cliente seleccionó: ${varianteElegida} — Nuevo total: ${total} BOB`
  );
});

// 3. Capturar evento submit de compra rápida con preventDefault() (Guía Día 2)
orderForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const producto = productSelect.value;
  const variante = variantSelect.value;
  const usuario = userTikTok.value.trim();
  const { total } = actualizarTotalCheckout();

  // Validación del usuario de TikTok compartiendo la misma regla que el Día 1
  if (!validarUsuarioTikTok(usuario)) {
    formFeedback.textContent = '⚠️ Ingresa una cuenta de TikTok válida que comience con "@" y tenga al menos 3 caracteres (ej. @heihachi_bo).';
    formFeedback.className = 'form-feedback error';
    addLog('ERROR_VALIDACIÓN', `Intento de compra rechazado: usuario "${usuario || 'vacío'}" inválido. Debe cumplir el formato @usuario.`, 'system');
    userTikTok.focus();
    return;
  }

  // Incrementar contador de ventas en vivo
  totalSales += 1;
  salesCounterEl.textContent = totalSales;

  // Insertar registro de transacción exitosa únicamente en #logDia2 (Día 2)
  addLog(
    'COMPRA_EXITOSA',
    `Pedido confirmado para <strong>${usuario}</strong> → ${producto} [${variante}] por <strong>${total} BOB</strong> 🎉`,
    'pedido'
  );

  // Limpiar cualquier aviso previo del chat del Día 1 para no mostrar dos alertas a la vez
  chatFeedback.textContent = '';
  chatFeedback.className = 'form-feedback';

  formFeedback.textContent = `✅ ¡Orden confirmada para ${usuario} por ${total} BOB!`;
  formFeedback.className = 'form-feedback success';

  // Limpiar el formulario manteniendo la sincronización visual
  orderForm.reset();
  resaltarTarjetaProducto(productSelect.value);
  actualizarTotalCheckout();
});

// Limpiar mensajes de error automáticamente cuando el usuario empieza a corregir el campo
chatUser.addEventListener('input', () => {
  chatFeedback.textContent = '';
});
userTikTok.addEventListener('input', () => {
  formFeedback.textContent = '';
});

/* ==========================================================================
   CONTROLES EXTRA: TEMA CLARO/OSCURO Y LIMPIEZA DE BITÁCORAS
   ========================================================================== */

themeToggleBtn.addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-mode');
  themeToggleBtn.textContent = isLight ? '🌙 Modo Torneo Oscuro' : '☀️ Modo Claro';
  logEvent('TEMA_UI', `Interfaz cambiada a ${isLight ? 'Modo Dojo Claro' : 'Modo Torneo Oscuro'}`);
});

clearLog1Btn.addEventListener('click', () => {
  logOutput.innerHTML = '';
  logEvent('SISTEMA', 'Bitácora del Stream (Día 1) reiniciada.');
});

clearLog2Btn.addEventListener('click', () => {
  logDia2.innerHTML = '';
  addLog('SISTEMA', 'Bitácora de Transacciones (Día 2) reiniciada.');
});

// Inicializar el cálculo del total al cargar la página
actualizarTotalCheckout();
resaltarTarjetaProducto(productSelect.value);

