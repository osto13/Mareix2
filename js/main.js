/* ============================================================
   YUXU YOZMALARI — Main JavaScript
   yuxu-yozmalari.com.az
   ============================================================ */

'use strict';

/* === UTILS === */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* === LANGUAGE DETECTION === */
function getCurrentLang() {
  return document.documentElement.lang || 'az';
}

/* === HEADER SCROLL === */
function initHeader() {
  const header = $('.site-header');
  if (!header) return;
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* === HAMBURGER MENU === */
function initNav() {
  const btn = $('.hamburger');
  const nav = $('.site-nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => {
    const open = btn.classList.toggle('active');
    nav.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  });
  // Close on nav link click
  $$('.nav-link', nav).forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      nav.classList.remove('open');
    });
  });
  // Close on outside click
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) {
      btn.classList.remove('active');
      nav.classList.remove('open');
    }
  });
}

/* === SCROLL REVEAL === */
function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(el => io.observe(el));
}

/* === STARS ANIMATION === */
function initStars() {
  const container = $('.stars');
  if (!container) return;
  const count = 120;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.classList.add('star');
    const size = Math.random() * 2.5 + 0.5;
    star.style.cssText = `
      width:${size}px; height:${size}px;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      --duration:${(Math.random()*4+2).toFixed(1)}s;
      --delay:-${(Math.random()*5).toFixed(1)}s;
      opacity:${Math.random()*0.5+0.1};
    `;
    container.appendChild(star);
  }
}

/* === AI DREAM INTERPRETER === */
function getCurrentLangPrompts() {
  const lang = getCurrentLang();
  return {
    system: lang === 'ru'
      ? `Ты — профессиональный толкователь снов. Отвечай на русском языке. Растолкуй сон с 3 перспектив:\n\n**1. Народные поверья** (азербайджанские и восточные традиции, фольклор)\n**2. Психологический подход** (Фрейд, Юнг, современная психология)\n**3. Символический анализ** (универсальные архетипы и образы мирового фольклора)\n\nСтруктурируй ответ с подзаголовками. Пиши литературным, уважительным языком. Всегда заканчивай на позитивной ноте.`
      : `Sən peşəkar yuxu yozma mütəxəssisisən. Azərbaycan dilində cavab ver. Yuxunu 3 perspektivdən yoz:\n\n**1. Xalq inanclı yanaşma** (Azərbaycan və Şərq xalq ənənələri, folklor)\n**2. Psixoloji yanaşma** (Freyd, Yunq, müasir psixologiya)\n**3. Simvolik analiz** (dünya folkloru və universal arxetiplər)\n\nCavabını strukturlaşdır, başlıqlarla ayır. Ədəbi və mədəni dildə yaz. Həmişə müsbət notla bitir.`,
    userPrefix: lang === 'ru' ? 'Мой сон: ' : 'Mənim yuxum: '
  };
}

async function interpretDream(dreamText) {
  const { system, userPrefix } = getCurrentLangPrompts();
  // PLACEHOLDER: Replace YOUR_API_KEY with your actual OpenAI API key
  const API_KEY = 'YOUR_API_KEY';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrefix + dreamText }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });
  if (!response.ok) throw new Error(`API Error: ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content;
}

function formatAIResponse(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<h4>$1</h4>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^/, '<p>').replace(/$/, '</p>');
}

function initChatInterface() {
  const form = $('#dreamForm');
  const textarea = $('#dreamInput');
  const messagesEl = $('#chatMessages');
  const submitBtn = $('#submitBtn');
  if (!form || !textarea || !messagesEl || !submitBtn) return;

  const lang = getCurrentLang();
  const i18n = {
    az: {
      thinking: 'Yuxunuz yozulur...',
      error: 'Xəta baş verdi. Zəhmət olmasa, API açarınızı yoxlayın.',
      emptyDream: 'Zəhmət olmasa, yuxunuzu yazın.',
      placeholder: 'Yuxunuzu ətraflı təsvir edin...',
    },
    ru: {
      thinking: 'Толкуем ваш сон...',
      error: 'Произошла ошибка. Пожалуйста, проверьте ваш API ключ.',
      emptyDream: 'Пожалуйста, опишите ваш сон.',
      placeholder: 'Опишите ваш сон подробно...',
    }
  };
  const t = i18n[lang] || i18n.az;

  function addMessage(text, role) {
    const msg = document.createElement('div');
    msg.className = `message ${role}`;
    msg.innerHTML = role === 'ai' ? formatAIResponse(text) : `<p style="margin:0">${text}</p>`;
    messagesEl.appendChild(msg);
    messagesEl.scrollTop = messagesEl.scrollHeight;
    return msg;
  }

  function showTyping() {
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.id = 'typingIndicator';
    el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
    messagesEl.appendChild(el);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function hideTyping() {
    const el = $('#typingIndicator');
    if (el) el.remove();
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const dream = textarea.value.trim();
    if (!dream) { alert(t.emptyDream); return; }

    addMessage(dream, 'user');
    textarea.value = '';
    submitBtn.disabled = true;
    showTyping();

    try {
      const result = await interpretDream(dream);
      hideTyping();
      addMessage(result, 'ai');
    } catch (err) {
      hideTyping();
      console.error(err);
      addMessage(t.error, 'ai');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* === DICTIONARY ACCORDION === */
function initAccordion() {
  $$('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const isOpen = item.classList.contains('open');
      // Close all
      $$('.accordion-item.open').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* === DICTIONARY SEARCH === */
function initDictSearch() {
  const input = $('#dictSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    const q = input.value.toLowerCase().trim();
    $$('.accordion-item').forEach(item => {
      const text = item.textContent.toLowerCase();
      item.classList.toggle('hidden', q.length > 0 && !text.includes(q));
    });
    $$('.dict-section').forEach(section => {
      const visible = $$('.accordion-item:not(.hidden)', section).length;
      section.classList.toggle('hidden', visible === 0);
    });
  });
}

/* === ALPHABET NAV === */
function initAlphaNav() {
  $$('.alpha-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const letter = btn.dataset.letter;
      const section = $(`#dict-${letter}`);
      if (section) {
        const top = section.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      $$('.alpha-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

/* === ACTIVE NAV LINK === */
function initActiveNav() {
  const path = window.location.pathname;
  $$('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && path.endsWith(href.replace(/^\.\.\//, '').replace(/^\//, ''))) {
      link.classList.add('active');
    }
  });
}

/* === INIT === */
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initNav();
  initReveal();
  initStars();
  initChatInterface();
  initAccordion();
  initDictSearch();
  initAlphaNav();
  initActiveNav();
});
