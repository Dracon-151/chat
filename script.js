// ==========================================================================
// TINDER CHAT REPLICA - MAIN JAVASCRIPT ENGINE
// Recreación fiel y animada en tiempo real
// ==========================================================================

class TinderChatApp {
  constructor() {
    this.messages = CHAT_DATA;
    this.currentIndex = 0;
    this.isPlaying = true;
    this.speed = 1.0;
    this.soundEnabled = true;
    this.timeoutId = null;
    this.audioCtx = null;

    // DOM Elements
    this.feed = document.getElementById('messagesFeed');
    this.chatContainer = document.getElementById('chatContainer');
    this.typingIndicator = document.getElementById('typingIndicator');
    this.inputTextDisplay = document.getElementById('inputTextDisplay');
    this.btnSend = document.getElementById('btnSend');
    this.inputPillWrapper = document.getElementById('inputPillWrapper');

    this.init();
  }

  init() {
    this.bindEvents();

    // Comprobar si se solicitó ver todo directamente mediante URL (?skip=1)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('skip') === '1') {
      this.skipToEnd();
    } else {
      // Iniciar automáticamente tras una breve pausa para cargar la interfaz
      setTimeout(() => {
        this.playNextStep();
      }, 700);
    }
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
      // Fallback si el navegador restringe audio sin interacción previa
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

  // ==========================================================================
  // EVENT BINDINGS & KEYBOARD SHORTCUTS
  // ==========================================================================
  bindEvents() {
    // Desbloquear audio con el primer clic o toque en cualquier parte
    const unlockAudio = () => {
      this.initAudio();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Atajos de teclado para control discreto
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

  // ==========================================================================
  // PLAYBACK FLOW & ANIMATIONS
  // ==========================================================================
  playNextStep() {
    if (!this.isPlaying) return;

    if (this.currentIndex >= this.messages.length) {
      this.finishSimulation();
      return;
    }

    const item = this.messages[this.currentIndex];

    if (item.sender === 'user') {
      this.animateUserTypingAndSend(item, () => {
        this.currentIndex++;
        const nextDelay = 800 / this.speed;
        this.timeoutId = setTimeout(() => this.playNextStep(), nextDelay);
      });
    } else {
      this.animateMildretTypingAndReceive(item, () => {
        this.currentIndex++;
        const nextDelay = 850 / this.speed;
        this.timeoutId = setTimeout(() => this.playNextStep(), nextDelay);
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

        this.timeoutId = setTimeout(typeNextChar, typeSpeed);
      } else {
        // Pausa breve antes de enviar
        const sendDelay = 280 / this.speed;
        this.timeoutId = setTimeout(() => {
          if (!this.isPlaying) return;

          // Animación de presionar enviar
          this.btnSend.style.transform = 'scale(0.85)';
          this.playSendSound();

          setTimeout(() => {
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

    this.timeoutId = setTimeout(typeNextChar, 180 / this.speed);
  }

  // Simulación del indicador de escribiendo y llegada del mensaje de Mildret
  animateMildretTypingAndReceive(item, onComplete) {
    this.typingIndicator.style.display = 'flex';
    this.scrollToBottom();

    const textLen = item.text.length;
    const baseDuration = Math.min(2200, Math.max(750, textLen * 32));
    const typingDuration = baseDuration / this.speed;

    this.timeoutId = setTimeout(() => {
      if (!this.isPlaying) return;

      this.typingIndicator.style.display = 'none';
      this.playReceiveSound();

      const row = this.renderMessageRow(item, this.currentIndex);
      this.scrollToBottom();

      // Si tiene corazón rojo (liked), animar el like
      if (item.liked) {
        const likeDelay = 350 / this.speed;
        this.timeoutId = setTimeout(() => {
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

      // Ícono de corazón (no interactivo manualmente)
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
    this.isPlaying = !this.isPlaying;
    if (this.isPlaying) {
      this.playNextStep();
    } else {
      clearTimeout(this.timeoutId);
    }
  }

  skipToEnd() {
    clearTimeout(this.timeoutId);
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
    clearTimeout(this.timeoutId);
    this.currentIndex = 0;
    this.isPlaying = true;

    this.feed.innerHTML = '';
    this.typingIndicator.style.display = 'none';
    this.inputTextDisplay.textContent = 'Escribe un mensaje...';
    this.inputTextDisplay.classList.add('placeholder');
    this.btnSend.classList.remove('active');

    this.playNextStep();
  }

  finishSimulation() {
    this.isPlaying = false;
    this.scrollToBottom();
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
