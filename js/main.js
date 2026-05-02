'use strict';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/* ── LOADER ────────────────────────────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    $('#loader').classList.add('hidden');
    document.body.style.overflow = '';
    initReveal();
  }, 1900);
});
document.body.style.overflow = 'hidden';

/* ── CURSOR ────────────────────────────────────────────────────── */
(function () {
  const dot  = $('.cursor-dot');
  const ring = $('.cursor-ring');
  if (!dot || !ring || window.matchMedia('(pointer:coarse)').matches) return;
  let mx = 0, my = 0, rx = 0, ry = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  const tick = () => {
    dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    rx = lerp(rx, mx, .12); ry = lerp(ry, my, .12);
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(tick);
  };
  tick();
})();

/* ── NAV MOBILE ─────────────────────────────────────────────────── */
(function () {
  const btn = $('#menuBtn');
  const mob = $('#mobileMenu');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.classList.toggle('open');
    mob.classList.toggle('open');
  });
  $$('.nav-mobile a').forEach(a => a.addEventListener('click', () => {
    btn.classList.remove('open');
    mob.classList.remove('open');
  }));
})();

/* ── SCROLL REVEAL ──────────────────────────────────────────────── */
function initReveal() {
  const els = $$('.reveal-up, .reveal-left, .reveal-right');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'),
          parseInt(e.target.dataset.delay || 0));
        io.unobserve(e.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
}

/* ── COUNTERS ───────────────────────────────────────────────────── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.target);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const start  = performance.now();
      const dur    = 2000;
      const tick = now => {
        const p   = clamp((now - start) / dur, 0, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(ease * target) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, { threshold: .4 });
  $$('.stat-number').forEach(el => io.observe(el));
})();

/* ── PRODUCT BARS ───────────────────────────────────────────────── */
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const pct = getComputedStyle(e.target).getPropertyValue('--pct').trim();
        e.target.style.width = pct;
        io.unobserve(e.target);
      }
    });
  }, { threshold: .3 });
  $$('.pc-bar-fill').forEach(b => io.observe(b));
})();

/* ── TILT CARDS ─────────────────────────────────────────────────── */
$$('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r  = card.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2)  / (r.width  / 2);
    const dy = (e.clientY - r.top  - r.height / 2) / (r.height / 2);
    card.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateZ(4px)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ── MAP ────────────────────────────────────────────────────────── */
(function () {
  const data = {
    oeste:        { tag:'Região Oeste', title:'Oeste Catarinense', desc:'O coração da proteína animal do Brasil. Chapecó, Concórdia e São Miguel do Oeste são referência mundial em suinocultura e avicultura. Grandes frigoríficos e cooperativas estruturam a economia regional.', products:['🐷 Suinocultura','🐔 Avicultura','🥛 Leite','🌽 Milho'], highlight:'Chapecó é a "Capital do Agronegócio" do Sul do Brasil.' },
    'meio-oeste': { tag:'Meio-Oeste', title:'Meio-Oeste Catarinense', desc:'Zona de transição entre litoral e interior, com forte produção de aves, suínos e grãos. Videira e Caçador se destacam pela indústria frigorífica e cultivo de uvas e maçãs.', products:['🐔 Frango','🍇 Uva','🍎 Maçã','🌾 Grãos'], highlight:'Videira é o maior polo de processamento de frango do hemisfério sul.' },
    planalto:     { tag:'Planalto Serrano', title:'Planalto Serrano', desc:'O clima frio e as noites geladas criam condições ideais para maçã, pera e kiwi. Lages é o principal centro, combinando pecuária de corte e fruticultura de alta qualidade.', products:['🍎 Maçã','🐄 Gado de corte','🌲 Reflorestamento','🥛 Leite'], highlight:'São Joaquim possui as maiores altitudes para cultivo de maçã do Brasil.' },
    vale:         { tag:'Vale do Itajaí', title:'Vale do Itajaí', desc:'Forte influência da colonização alemã e italiana. O Alto Vale concentra a produção de cebola, alho e pêssego. Destaque para a agricultura familiar de pequenas propriedades altamente produtivas.', products:['🧅 Cebola','🧄 Alho','🍑 Pêssego','🥦 Hortaliças'], highlight:'Ituporanga é a "Capital Nacional da Cebola" — SC produz 55% de toda a cebola brasileira.' },
    'litoral-norte':{ tag:'Litoral Norte', title:'Litoral Norte', desc:'Região com forte horticultura e aquicultura. A proximidade do mar favorece cultivo de plantas tropicais, banana e mandioca, além de criação de camarão e moluscos.', products:['🍌 Banana','🥬 Hortaliças','🌿 Mandioca','🦞 Aquicultura'], highlight:'A região é referência em aquicultura — ostras, camarão e mexilhão de alta qualidade.' },
    sul:          { tag:'Região Sul', title:'Sul Catarinense', desc:'Planícies extensas ideais para rizicultura irrigada de alta produtividade. Araranguá e Tubarão lideram a produção de arroz. O sul tem forte tradição no cultivo de fumo.', products:['🌾 Arroz irrigado','🚬 Fumo/Tabaco','🐄 Pecuária','🌽 Milho'], highlight:'O arroz do sul de SC tem produtividade 40% acima da média nacional.' },
    floripa:      { tag:'Grande Florianópolis', title:'Grande Florianópolis', desc:'Destaque para ostreicultura — SC é o maior produtor de ostras e mexilhões do Brasil. Municípios como Palhoça e Santo Amaro têm produção hortifrutigranjeira relevante.', products:['🦪 Ostras e mexilhões','🥬 Horticultura','🌹 Floricultura','🍓 Frutas'], highlight:'Florianópolis e região respondem por 90% das ostras produzidas no Brasil.' },
  };

  const detail      = $('#regionDetail');
  const placeholder = $('#regionPlaceholder');

  $$('.map-region').forEach(r => {
    r.addEventListener('click', () => {
      const d = data[r.dataset.region];
      if (!d) return;
      $$('.map-region').forEach(x => x.classList.remove('active'));
      r.classList.add('active');
      $('#rdTag').textContent = d.tag;
      $('#rdTitle').textContent = d.title;
      $('#rdDesc').textContent = d.desc;
      $('#rdProducts').innerHTML = d.products.map(p => `<span>${p}</span>`).join('');
      $('#rdHighlight').textContent = d.highlight;
      placeholder.style.display = 'none';
      detail.style.display = 'block';
      detail.style.animation = 'none';
      void detail.offsetWidth;
      detail.style.animation = '';
    });
  });
})();

/* ── GALLERY LIGHTBOX ───────────────────────────────────────────── */
(function () {
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:9000;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;backdrop-filter:blur(12px);cursor:zoom-out;';
  const img = document.createElement('img');
  img.style.cssText = 'max-width:90vw;max-height:88vh;border-radius:16px;box-shadow:0 0 80px rgba(0,0,0,.8);object-fit:contain;';
  const cap = document.createElement('p');
  cap.style.cssText = 'position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);color:rgba(255,255,255,.7);font-family:sans-serif;font-size:.9rem;text-align:center;';
  overlay.appendChild(img); overlay.appendChild(cap);
  document.body.appendChild(overlay);
  overlay.addEventListener('click', () => { overlay.style.display = 'none'; document.body.style.overflow = ''; });
  $$('.gallery-item').forEach(item => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      const src = item.querySelector('img')?.src;
      if (!src || item.classList.contains('gi-no-img')) return;
      img.src = src;
      cap.textContent = item.querySelector('.gi-overlay p')?.textContent || '';
      overlay.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { overlay.style.display = 'none'; document.body.style.overflow = ''; }
  });
})();

/* ── SMOOTH ANCHORS ─────────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    t.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
