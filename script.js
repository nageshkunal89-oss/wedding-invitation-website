// --- शाही शादी का बैकग्राउंड संगीत (Indian Wedding Mangal Dhun + MP3 Support) ---
let audioCtx = null;
let isMusicPlaying = false;
let melodyTimer = null;
let customAudio = null;

// क्या फ़ोल्डर में 'wedding-song.mp3' मौजूद है? (अगर आप अपना गाना डालना चाहें तो)
const mp3File = new Audio('wedding-song.mp3');
mp3File.loop = true;
let hasCustomMp3 = false;

mp3File.addEventListener('canplaythrough', () => {
  hasCustomMp3 = true;
});

// पारंपरिक भारतीय विवाह मंगल धुन (राग भूपाली - संतूर और शहनाई जैसा शांत स्वर)
// [Frequency in Hz, Duration in ms]
const weddingMelody = [
  [392.00, 500],  // Pa
  [440.00, 500],  // Dha
  [523.25, 800],  // Sa' (तार सप्तक)
  [440.00, 400],  // Dha
  [392.00, 500],  // Pa
  [329.63, 700],  // Ga
  [293.66, 500],  // Re
  [261.63, 900],  // Sa

  [293.66, 450],  // Re
  [329.63, 450],  // Ga
  [392.00, 750],  // Pa
  [440.00, 450],  // Dha
  [523.25, 600],  // Sa'
  [587.33, 600],  // Re'
  [523.25, 1100], // Sa' (विराम)
  [0, 600]        // हल्का शांत ठहराव
];

let stepIndex = 0;

function playWeddingChime(freq, durationMs) {
  if (!audioCtx || !isMusicPlaying || freq === 0) return;

  const now = audioCtx.currentTime;
  const durSec = durationMs / 1000;

  // मुख्य मधुर स्वर (Main Santoor/Bell tone)
  const osc1 = audioCtx.createOscillator();
  // हल्की गूँज और मिठास के लिए दूसरा स्वर (Harmonic overtone)
  const osc2 = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq, now);

  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq * 2, now); // एक सप्तक ऊपर की हल्की झंकार

  const subGain = audioCtx.createGain();
  subGain.gain.setValueAtTime(0.15, now); // दूसरे स्वर को बहुत धीमा रखना

  // आवाज़ का चढ़ाव और उतार (शांति भरा रिंगटोन इफ़ेक्ट)
  gainNode.gain.setValueAtTime(0.001, now);
  gainNode.gain.linearRampToValueAtTime(0.09, now + 0.08);
  gainNode.gain.exponentialRampToValueAtTime(0.0008, now + durSec + 0.8);

  osc1.connect(gainNode);
  osc2.connect(subGain);
  subGain.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + durSec + 0.85);
  osc2.stop(now + durSec + 0.85);
}

function scheduleNextNote() {
  if (!isMusicPlaying) return;

  const [freq, duration] = weddingMelody[stepIndex];
  playWeddingChime(freq, duration);

  stepIndex = (stepIndex + 1) % weddingMelody.length;
  melodyTimer = setTimeout(scheduleNextNote, duration);
}

function startWeddingMusic() {
  if (isMusicPlaying) return;
  isMusicPlaying = true;

  // यदि यूज़र ने फ़ोल्डर में 'wedding-song.mp3' रखा है तो वह बजेगा, वरना मंगल धुन बजेगी
  if (hasCustomMp3) {
    mp3File.volume = 0.4;
    mp3File.play().catch(() => {});
  } else {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    scheduleNextNote();
  }
}

function stopWeddingMusic() {
  isMusicPlaying = false;
  clearTimeout(melodyTimer);
  if (hasCustomMp3) {
    mp3File.pause();
  }
}

// 1. पर्दा खोलने का फ़ंक्शन + वेडिंग म्यूजिक स्टार्ट
const openBtn = document.getElementById('open-btn');
const curtainWrapper = document.getElementById('curtain-wrapper');
const musicToggleBtn = document.getElementById('music-toggle');

openBtn.addEventListener('click', () => {
  curtainWrapper.classList.add('opened');
  startWeddingMusic();
  musicToggleBtn.textContent = '🔊 Music On';
});

// म्यूजिक ऑन/ऑफ बटन कंट्रोल
musicToggleBtn.addEventListener('click', () => {
  if (isMusicPlaying) {
    stopWeddingMusic();
    musicToggleBtn.textContent = '🔇 Music Off';
  } else {
    startWeddingMusic();
    musicToggleBtn.textContent = '🔊 Music On';
  }
});

// 2. मल्टीपल पेज स्विचिंग (Navigation & Next Buttons)
const navButtons = document.querySelectorAll('.nav-btn');
const nextButtons = document.querySelectorAll('.next-page-btn');
const pages = document.querySelectorAll('.page');

function showPage(pageId) {
  pages.forEach(page => page.classList.remove('active-page'));
  navButtons.forEach(btn => btn.classList.remove('active'));

  const targetPage = document.getElementById(pageId);
  if (targetPage) targetPage.classList.add('active-page');

  const activeNav = document.querySelector(`.nav-btn[data-target="${pageId}"]`);
  if (activeNav) activeNav.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    showPage(btn.getAttribute('data-target'));
  });
});

nextButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    showPage(btn.getAttribute('data-next'));
  });
});

// 3. RSVP फ़ॉर्म सबमिट हैंडलर
const rsvpForm = document.getElementById('rsvp-form');
const rsvpSuccess = document.getElementById('rsvp-success');

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();
  rsvpForm.classList.add('hidden');
  rsvpSuccess.classList.remove('hidden');
});

// 4. उड़ती हुई सुनहरी पंखुड़ियाँ (Floating Gold Petals Animation)
const canvas = document.getElementById('petals-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const petals = Array.from({ length: 28 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  size: Math.random() * 5 + 3,
  speedY: Math.random() * 1 + 0.4,
  speedX: Math.random() * 0.6 - 0.3
}));

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(212, 175, 55, 0.55)';

  petals.forEach(p => {
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.size, p.size / 2, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    p.y += p.speedY;
    p.x += p.speedX;

    if (p.y > canvas.height) {
      p.y = -10;
      p.x = Math.random() * canvas.width;
    }
  });

  requestAnimationFrame(animatePetals);
}
animatePetals();
