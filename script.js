// ==========================================================================
// TINDER CHAT REPLICA - MAIN JAVASCRIPT ENGINE
// Recreación fiel y animada en tiempo real
// ==========================================================================

// Temporizador pausable para soporte exacto de pausa estilo Historias de Instagram
class PausableTimeout {
  constructor(callback, delay, autoStart = true) {
    this.callback = callback;
    this.remaining = delay;
    this.timerId = null;
    this.startTime = null;
    this.isPaused = !autoStart;
    if (autoStart) {
      this.resume();
    }
  }

  pause() {
    if (this.isPaused || this.timerId === null) return;
    this.isPaused = true;
    clearTimeout(this.timerId);
    this.timerId = null;
    const elapsed = Date.now() - this.startTime;
    this.remaining = Math.max(0, this.remaining - elapsed);
  }

  resume() {
    if (!this.isPaused && this.timerId !== null) return;
    this.isPaused = false;
    this.startTime = Date.now();
    const delay = Math.max(0, this.remaining);
    this.timerId = setTimeout(() => {
      this.timerId = null;
      this.callback();
    }, delay);
  }

  clear() {
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isPaused = true;
  }
}

class TinderChatApp {
  constructor() {
    this.messages = CHAT_DATA;
    this.currentIndex = 0;
    this.isPlaying = true;
    this.hasStarted = false;
    this.isHoldingPause = false;
    this.isFinished = false;
    this.isAnniversaryActive = false;
    this.heartsIntervalId = null;
    this.speed = 1.0;
    this.soundEnabled = true;
    this.activeTimer = null;
    this.audioCtx = null;

    // DOM Elements
    this.phoneFrame = document.getElementById('phoneFrame');
    this.splash = document.getElementById('tinderSplash');
    this.splashStartBtn = document.getElementById('splashStartBtn');
    this.anniversaryScreen = document.getElementById('anniversaryScreen');
    this.floatingHeartsLayer = document.getElementById('floatingHeartsLayer');
    this.anniversaryReplayBtn = document.getElementById('anniversaryReplayBtn');
    this.storyPausePill = document.getElementById('storyPausePill');
    this.feed = document.getElementById('messagesFeed');
    this.chatContainer = document.getElementById('chatContainer');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.inputTextDisplay = document.getElementById('inputTextDisplay');
    this.btnSend = document.getElementById('btnSend');
    this.inputPillWrapper = document.getElementById('inputPillWrapper');

    this.init();
  }

  scheduleTimeout(callback, delay) {
    if (this.activeTimer) {
      this.activeTimer.clear();
    }
    const autoStart = !this.isHoldingPause && this.isPlaying;
    this.activeTimer = new PausableTimeout(callback, delay, autoStart);
    return this.activeTimer;
  }

  init() {
    this.bindEvents();

    // Comprobar si se solicitó ver todo directamente mediante URL (?skip=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skip') === '1') {
      if (this.splash) this.splash.style.display = 'none';
      this.hasStarted = true;
      this.skipToEnd();
    }
  }

  // Iniciar la reproducción tras pulsar la pantalla splash
  startChat() {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.initAudio();

    // Transición suave de salida para la pantalla splash de Tinder
    if (this.splash) {
      this.splash.classList.add('fade-out');
      setTimeout(() => {
        if (this.splash) this.splash.style.display = 'none';
      }, 450);
    }

    // Iniciar el primer paso tras la animación
    this.scheduleTimeout(() => {
      this.playNextStep();
    }, 450);
  }

  // ==========================================================================
  // AUDIO SYNTHESIZER (Web Audio API - Cero dependencias externas)
  // ==========================================================================
  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  playTone(freqStart, freqEnd, duration, type = 'sine', gainVal = 0.08) {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freqStart, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), this.audioCtx.currentTime + duration);

      gain.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Fallback si el navegador restringe audio
    }
  }

  playKeySound() {
    this.playTone(320, 180, 0.03, 'triangle', 0.02);
  }

  playSendSound() {
    this.playTone(540, 880, 0.12, 'sine', 0.09);
  }

  playReceiveSound() {
    this.playTone(420, 680, 0.15, 'sine', 0.12);
  }

  playHeartSound() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;
      
      const now = this.audioCtx.currentTime;
      [880, 1174, 1318].forEach((f, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.05);
        gain.gain.setValueAtTime(0.06, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.18);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.18);
      });
    } catch (e) {}
  }

  playCelebrationSound() {
    if (!this.soundEnabled) return;
    try {
      this.initAudio();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.07, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch (e) {}
  }

  // ==========================================================================
  // EVENT BINDINGS & INSTAGRAM STORIES PAUSE BEHAVIOR
  // ==========================================================================
  bindEvents() {
    // Interacción con pantalla splash para comenzar
    if (this.splash) {
      this.splash.addEventListener('click', () => {
        this.startChat();
      });
    }
    if (this.splashStartBtn) {
      this.splashStartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.startChat();
      });
    }

    // Botón para volver a ver la conversación desde la pantalla de aniversario
    if (this.anniversaryReplayBtn) {
      this.anniversaryReplayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.restartSimulation();
      });
    }

    // Comportamiento de Historias de Instagram:
    // Presionar y mantener la pantalla pausa la reproducción, soltarla continúa
    if (this.phoneFrame) {
      this.phoneFrame.addEventListener('pointerdown', (e) => {
        if (!this.hasStarted || this.isAnniversaryActive) return;
        this.handleHoldStart(e);
      });
    }

    // Al soltar en cualquier parte de la ventana o perder foco, continuar
    window.addEventListener('pointerup', () => this.handleHoldEnd());
    window.addEventListener('pointercancel', () => this.handleHoldEnd());
    window.addEventListener('blur', () => this.handleHoldEnd());

    // Desbloquear audio con el primer toque
    const unlockAudio = () => {
      this.initAudio();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Atajos de teclado para control
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePlayPause();
      } else if (e.key === 'r' || e.key === 'R') {
        this.restartSimulation();
      } else if (e.key === 'f' || e.key === 'F') {
        this.skipToEnd();
      } else if (e.key === 's' || e.key === 'S') {
        this.soundEnabled = !this.soundEnabled;
      }
    });
  }

  // Manejo de pausa al presionar la pantalla (Historias de Instagram)
  handleHoldStart(e) {
    if (!this.hasStarted || this.isAnniversaryActive) return;
    if (this.isHoldingPause) return;

    this.isHoldingPause = true;
    if (this.phoneFrame) this.phoneFrame.classList.add('is-holding-pause');
    if (this.storyPausePill) this.storyPausePill.classList.add('visible');

    if (this.activeTimer) {
      this.activeTimer.pause();
    }
  }

  // Manejo de reanudación al soltar la pantalla
  handleHoldEnd() {
    if (!this.isHoldingPause) return;

    this.isHoldingPause = false;
    if (this.phoneFrame) this.phoneFrame.classList.remove('is-holding-pause');
    if (this.storyPausePill) this.storyPausePill.classList.remove('visible');

    if (this.hasStarted && !this.isAnniversaryActive) {
      if (this.activeTimer) {
        this.activeTimer.resume();
      } else if (this.isPlaying && !this.isFinished) {
        this.playNextStep();
      }
    }
  }

  // ==========================================================================
  // PLAYBACK FLOW & ANIMATIONS
  // ==========================================================================
  playNextStep() {
    if (!this.isPlaying || this.isHoldingPause) return;

    if (this.currentIndex >= this.messages.length) {
      this.finishSimulation();
      return;
    }

    const item = this.messages[this.currentIndex];

    if (item.sender === 'user') {
      this.animateUserTypingAndSend(item, () => {
        this.currentIndex++;
        const nextDelay = 800 / this.speed;
        this.scheduleTimeout(() => this.playNextStep(), nextDelay);
      });
    } else {
      this.animateMildretTypingAndReceive(item, () => {
        this.currentIndex++;
        const nextDelay = 850 / this.speed;
        this.scheduleTimeout(() => this.playNextStep(), nextDelay);
      });
    }
  }

  // Simulación de escritura del usuario con expansión vertical multilínea
  animateUserTypingAndSend(item, onComplete) {
    const text = item.text;
    let charIndex = 0;
    
    // Preparar el campo de entrada
    this.inputTextDisplay.classList.remove('placeholder');
    this.inputTextDisplay.innerHTML = '<span class="cursor-blink"></span>';
    this.btnSend.classList.add('active');

    const typeSpeed = Math.max(12, 36 / this.speed);

    const typeNextChar = () => {
      if (!this.isPlaying) return;

      if (charIndex < text.length) {
        charIndex++;
        const currentSlice = text.substring(0, charIndex);
        this.inputTextDisplay.innerHTML = `${this.escapeHtml(currentSlice)}<span class="cursor-blink"></span>`;
        this.playKeySound();

        // Hacer auto-scroll dinámico si el texto hace crecer la barra hacia abajo
        this.scrollToBottom();

        this.scheduleTimeout(typeNextChar, typeSpeed);
      } else {
        // Pausa breve antes de enviar
        const sendDelay = 280 / this.speed;
        this.scheduleTimeout(() => {
          if (!this.isPlaying) return;

          // Animación de presionar enviar
          this.btnSend.style.transform = 'scale(0.85)';
          this.playSendSound();

          this.scheduleTimeout(() => {
            this.btnSend.style.transform = '';
            // Restaurar input a su tamaño inicial
            this.inputTextDisplay.textContent = 'Escribe un mensaje...';
            this.inputTextDisplay.classList.add('placeholder');
            this.btnSend.classList.remove('active');

            // Renderizar la burbuja de mensaje en el chat
            this.renderMessageRow(item, this.currentIndex);
            this.scrollToBottom();

            onComplete();
          }, 120);
        }, sendDelay);
      }
    };

    this.scheduleTimeout(typeNextChar, 180 / this.speed);
  }

  // Simulación del indicador de escribiendo y llegada del mensaje de Mildret
  animateMildretTypingAndReceive(item, onComplete) {
    this.typingIndicator.style.display = 'flex';
    this.scrollToBottom();

    const textLen = item.text.length;
    const baseDuration = Math.min(2200, Math.max(750, textLen * 32));
    const typingDuration = baseDuration / this.speed;

    this.scheduleTimeout(() => {
      if (!this.isPlaying) return;

      this.typingIndicator.style.display = 'none';
      this.playReceiveSound();

      const row = this.renderMessageRow(item, this.currentIndex);
      this.scrollToBottom();

      // Si tiene corazón rojo (liked), animar el like
      if (item.liked) {
        const likeDelay = 350 / this.speed;
        this.scheduleTimeout(() => {
          if (!this.isPlaying) return;
          const heartBtn = row.querySelector('.btn-heart');
          if (heartBtn) {
            heartBtn.classList.add('liked');
            this.playHeartSound();
          }
          onComplete();
        }, likeDelay);
      } else {
        onComplete();
      }
    }, typingDuration);
  }

  // ==========================================================================
  // MESSAGE RENDERING (Tinder UI Matching)
  // ==========================================================================
  renderMessageRow(item, index) {
    const row = document.createElement('div');
    row.className = `message-row sender-${item.sender}`;
    row.dataset.id = item.id;

    if (item.sender === 'user') {
      // Mensaje saliente (Azul, derecha)
      const bubble = document.createElement('div');
      bubble.className = 'message-bubble-user';
      bubble.textContent = item.text;
      row.appendChild(bubble);

      this.feed.appendChild(row);

      // Si tiene status badge ("Enviado")
      if (item.statusBadge) {
        const statusDiv = document.createElement('div');
        statusDiv.className = 'delivery-status';
        statusDiv.innerHTML = `
          <div class="sent-icon-badge">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <span>${item.statusBadge}</span>
        `;
        this.feed.appendChild(statusDiv);
      }
    } else {
      // Mensaje entrante (Gris, izquierda) de Mildret
      const isLastInCluster = this.isLastMildretInGroup(index);

      // Espacio para avatar en el último mensaje consecutivo
      const avatarSpacer = document.createElement('div');
      avatarSpacer.className = 'avatar-spacer';
      if (isLastInCluster) {
        const img = document.createElement('img');
        img.src = 'avatar_circle.png';
        img.alt = 'Mildret';
        img.className = 'msg-avatar';
        img.width = 34;
        img.height = 34;
        img.onerror = () => { img.src = 'mildret_avatar.png'; };
        avatarSpacer.appendChild(img);
      }
      row.appendChild(avatarSpacer);

      // Contenedor de burbuja y corazón
      const bubbleWithHeart = document.createElement('div');
      bubbleWithHeart.className = 'bubble-with-heart';

      const bubble = document.createElement('div');
      bubble.className = 'message-bubble-mildret';

      if (item.isPhone) {
        // Enlace del teléfono tal como aparece subrayado en azul en la captura
        const phoneSpan = document.createElement('span');
        phoneSpan.className = 'phone-number-link';
        phoneSpan.textContent = item.text;
        bubble.appendChild(phoneSpan);
      } else {
        bubble.textContent = item.text;
      }

      // Ícono de corazón
      const heartBtn = document.createElement('div');
      heartBtn.className = `btn-heart ${item.liked ? 'liked' : ''}`;
      heartBtn.innerHTML = `
        <svg class="heart-icon" viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      `;

      bubbleWithHeart.appendChild(bubble);
      bubbleWithHeart.appendChild(heartBtn);
      row.appendChild(bubbleWithHeart);

      this.feed.appendChild(row);
    }

    return row;
  }

  // Comprueba si es el último mensaje consecutivo de Mildret
  isLastMildretInGroup(index) {
    if (index >= this.messages.length - 1) return true;
    return this.messages[index + 1].sender !== 'mildret';
  }

  // ==========================================================================
  // PLAYBACK CONTROL METHODS
  // ==========================================================================
  togglePlayPause() {
    if (!this.hasStarted || this.isFinished) return;
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      if (this.activeTimer) {
        this.activeTimer.resume();
      } else {
        this.playNextStep();
      }
    } else {
      if (this.activeTimer) {
        this.activeTimer.pause();
      }
    }
  }

  skipToEnd() {
    if (this.activeTimer) {
      this.activeTimer.clear();
    }
    this.typingIndicator.style.display = 'none';

    while (this.currentIndex < this.messages.length) {
      const item = this.messages[this.currentIndex];
      this.renderMessageRow(item, this.currentIndex);
      this.currentIndex++;
    }

    this.inputTextDisplay.textContent = 'Escribe un mensaje...';
    this.inputTextDisplay.classList.add('placeholder');
    this.btnSend.classList.remove('active');

    this.finishSimulation();
    this.scrollToBottom();
    setTimeout(() => {
      this.scrollToBottom();
    }, 60);
  }

  restartSimulation() {
    if (this.activeTimer) {
      this.activeTimer.clear();
    }
    this.hideAnniversaryScreen();
    this.currentIndex = 0;
    this.isPlaying = true;
    this.isHoldingPause = false;
    this.isFinished = false;

    if (this.phoneFrame) this.phoneFrame.classList.remove('is-holding-pause');
    if (this.storyPausePill) this.storyPausePill.classList.remove('visible');

    this.feed.innerHTML = '';
    this.typingIndicator.style.display = 'none';
    this.inputTextDisplay.textContent = 'Escribe un mensaje...';
    this.inputTextDisplay.classList.add('placeholder');
    this.btnSend.classList.remove('active');

    this.playNextStep();
  }

  finishSimulation() {
    this.isPlaying = false;
    this.isFinished = true;
    if (this.activeTimer) {
      this.activeTimer.clear();
    }
    if (this.storyPausePill) {
      this.storyPausePill.classList.remove('visible');
    }
    this.scrollToBottom();

    // Pausa de 5 segundos al final de la conversación antes de la transición
    const endDelay = 5000 / this.speed;
    this.scheduleTimeout(() => {
      this.showAnniversaryScreen();
    }, endDelay);
  }

  // ==========================================================================
  // ANNIVERSARY OUTRO SCREEN & FLOATING HEARTS
  // ==========================================================================
  showAnniversaryScreen() {
    this.isAnniversaryActive = true;
    if (this.storyPausePill) {
      this.storyPausePill.classList.remove('visible');
    }
    if (this.anniversaryScreen) {
      this.anniversaryScreen.style.display = 'flex';
      // Forzar reflow para que la transición CSS funcione suavemente
      void this.anniversaryScreen.offsetWidth;
      this.anniversaryScreen.classList.add('visible');
    }
    this.startFloatingHearts();
    this.playCelebrationSound();
  }

  hideAnniversaryScreen() {
    this.isAnniversaryActive = false;
    this.stopFloatingHearts();
    if (this.anniversaryScreen) {
      this.anniversaryScreen.classList.remove('visible');
      this.anniversaryScreen.style.display = 'none';
    }
  }

  startFloatingHearts() {
    this.stopFloatingHearts();
    if (!this.floatingHeartsLayer) return;

    // Crear lote inicial de corazones distribuidos en pantalla
    for (let i = 0; i < 9; i++) {
      this.spawnFloatingHeart(true);
    }

    // Intervalo continuo para emitir nuevos corazones
    this.heartsIntervalId = setInterval(() => {
      if (!this.isAnniversaryActive) return;
      this.spawnFloatingHeart(false);
    }, 380);
  }

  spawnFloatingHeart(isInitial = false) {
    if (!this.floatingHeartsLayer) return;

    const heart = document.createElement('div');
    heart.className = 'floating-heart-item';

    // Generar variaciones naturales
    const size = Math.floor(Math.random() * 22) + 16; // 16px a 38px
    const left = Math.random() * 88 + 6; // 6% a 94%
    const duration = (Math.random() * 2.2 + 3.4).toFixed(2); // 3.4s a 5.6s
    const rot = (Math.random() * 60 - 30).toFixed(1) + 'deg';
    const maxOpacity = (Math.random() * 0.45 + 0.45).toFixed(2); // 0.45 a 0.90

    heart.style.width = `${size}px`;
    heart.style.height = `${size}px`;
    heart.style.left = `${left}%`;
    heart.style.setProperty('--rot', rot);
    heart.style.setProperty('--max-opacity', maxOpacity);
    heart.style.animationDuration = `${duration}s`;

    if (isInitial) {
      const initialBottom = Math.floor(Math.random() * 480);
      heart.style.bottom = `${initialBottom}px`;
      heart.style.animationDelay = `-${(Math.random() * 2.8).toFixed(1)}s`;
    }

    heart.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
      </svg>
    `;

    heart.addEventListener('animationend', () => {
      if (heart.parentNode) {
        heart.parentNode.removeChild(heart);
      }
    });

    this.floatingHeartsLayer.appendChild(heart);
  }

  stopFloatingHearts() {
    if (this.heartsIntervalId) {
      clearInterval(this.heartsIntervalId);
      this.heartsIntervalId = null;
    }
    if (this.floatingHeartsLayer) {
      this.floatingHeartsLayer.innerHTML = '';
    }
  }

  scrollToBottom() {
    if (this.chatContainer) {
      if (this.feed && this.feed.lastElementChild) {
        this.feed.lastElementChild.scrollIntoView({ block: 'end' });
      }
      this.chatContainer.scrollTop = 9999999;
    }
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  window.chatApp = new TinderChatApp();
});
