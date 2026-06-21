/* ============================================================
   Shilpa — Portfolio interactions
   ============================================================ */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Version stamp ---------- */
  fetch('/version.json', { cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(v => {
      if (!v) return;
      document.querySelectorAll('.footer-row').forEach(row => {
        const tag = document.createElement('span');
        tag.className = 'footer-version';
        tag.textContent = `${v.branch} · ${v.commit} · built ${v.built}`;
        row.appendChild(tag);
      });
    })
    .catch(() => {});

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  const count = document.getElementById('loaderCount');
  let n = 0;
  const tick = setInterval(() => {
    n += Math.floor(Math.random() * 18) + 6;
    if (n >= 100) { n = 100; clearInterval(tick); }
    if (count) count.textContent = String(n).padStart(2, '0');
  }, 130);
  window.addEventListener('load', () => {
    setTimeout(() => {
      loader && loader.classList.add('done');
      document.querySelector('.hero-title')?.classList.add('in');
    }, reduce ? 0 : 1400);
  });

  /* ---------- Nav ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const navLinks = document.getElementById('navLinks');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
  let lockedY = 0;
  const lockScroll = () => {
    lockedY = window.scrollY;
    document.body.style.top = `-${lockedY}px`;
    document.body.classList.add('nav-open');
  };
  const unlockScroll = () => {
    document.body.classList.remove('nav-open');
    document.body.style.top = '';
    window.scrollTo({ top: lockedY, left: 0, behavior: 'instant' });
  };
  burger?.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    navLinks.classList.toggle('open');
    open ? lockScroll() : unlockScroll();
  });
  navLinks?.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      navLinks.classList.remove('open');
      unlockScroll();
    })
  );

  /* ---------- Scroll progress ---------- */
  const bar = document.getElementById('scrollProgress');
  window.addEventListener('scroll', () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (window.scrollY / h) * 100 + '%';
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal, .hero-title, .contact-title').forEach(el => io.observe(el));

  /* ---------- Active nav link ---------- */
  const sections = [...document.querySelectorAll('section[id]')];
  const linkFor = id => document.querySelector(`.nav-links a[href="#${id}"]`);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      const l = linkFor(e.target.id);
      if (l && e.isIntersecting) {
        document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
        l.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Floating hero cards (parallax) ---------- */
  const floaters = document.querySelectorAll('[data-float]');
  if (!reduce && floaters.length) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      floaters.forEach(f => {
        const s = parseFloat(f.dataset.float);
        f.style.transform = `translateY(${y * s * -1}px)`;
      });
    });
  }

  /* ---------- Custom cursor ---------- */
  const cur = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  if (cur && window.matchMedia('(hover:hover)').matches) {
    let cx = 0, cy = 0, x = 0, y = 0;
    document.addEventListener('mousemove', e => {
      cx = e.clientX; cy = e.clientY;
      dot.style.left = cx + 'px'; dot.style.top = cy + 'px';
      cur.style.opacity = 1; dot.style.opacity = 1;
    });
    (function loop() {
      x += (cx - x) * 0.18; y += (cy - y) * 0.18;
      cur.style.left = x + 'px'; cur.style.top = y + 'px';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('[data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('grow'));
      el.addEventListener('mouseleave', () => cur.classList.remove('grow'));
    });
  }

  /* ---------- Testimonials carousel ---------- */
  const track = document.getElementById('quotesTrack');
  if (track) {
    let i = 0;
    const total = track.children.length;
    const go = () => { track.style.transform = `translateX(-${i * 100}%)`; };
    document.getElementById('qNext')?.addEventListener('click', () => { i = (i + 1) % total; go(); });
    document.getElementById('qPrev')?.addEventListener('click', () => { i = (i - 1 + total) % total; go(); });
    let auto = setInterval(() => { i = (i + 1) % total; go(); }, 6000);
    track.parentElement.addEventListener('mouseenter', () => clearInterval(auto));
  }

  /* ---------- Disclosures (collapsible research sections) ---------- */
  document.querySelectorAll('.cs-disclosure').forEach(det => {
    const inner = det.querySelector('.cs-d-body-inner');
    if (!inner) return;
    det.addEventListener('toggle', () => {
      if (det.open) {
        const h = inner.scrollHeight;
        inner.style.maxHeight = '0px';
        requestAnimationFrame(() => { inner.style.maxHeight = h + 'px'; });
        setTimeout(() => { inner.style.maxHeight = 'none'; }, reduce ? 0 : 450);
      } else {
        inner.style.maxHeight = inner.scrollHeight + 'px';
        requestAnimationFrame(() => { inner.style.maxHeight = '0px'; });
      }
    });
    if (!det.open) inner.style.maxHeight = '0px';
  });

  /* ---------- Lightbox (masonry gallery) ---------- */
  const masonries = document.querySelectorAll('.masonry');
  if (masonries.length) {
    const lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = `
      <button class="lb-btn lb-close" aria-label="Close">✕</button>
      <button class="lb-btn lb-prev" aria-label="Previous">←</button>
      <img src="" alt="" />
      <button class="lb-btn lb-next" aria-label="Next">→</button>
      <span class="lb-count"></span>`;
    document.body.appendChild(lb);
    const lbImg = lb.querySelector('img');
    const lbCount = lb.querySelector('.lb-count');
    let items = [], idx = 0, lastTrigger = null;

    const show = i => {
      idx = (i + items.length) % items.length;
      const img = items[idx];
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCount.textContent = `${idx + 1} / ${items.length}`;
    };
    const open = (group, i, trigger) => {
      items = group;
      lastTrigger = trigger || document.activeElement;
      show(i);
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lb.querySelector('.lb-close').focus();
    };
    const close = () => {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      lastTrigger?.focus();
    };

    masonries.forEach(m => {
      const imgs = [...m.querySelectorAll('img')];
      imgs.forEach((img, i) => {
        const item = img.closest('.m-item');
        if (!item) return;
        item.addEventListener('click', () => open(imgs, i, item));
        item.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(imgs, i, item); }
        });
      });
    });

    lb.querySelector('.lb-close').addEventListener('click', close);
    lb.querySelector('.lb-prev').addEventListener('click', () => show(idx - 1));
    lb.querySelector('.lb-next').addEventListener('click', () => show(idx + 1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  /* Rotating headline word */
  const hrWord = document.getElementById('hrWord');
  if (hrWord) {
    const words = ['Users', 'Design Systems', 'Experiences'];
    let idx = 0;
    setInterval(() => {
      hrWord.classList.add('out');
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        hrWord.textContent = words[idx];
        hrWord.classList.remove('out');
        hrWord.classList.add('in');
        setTimeout(() => hrWord.classList.remove('in'), 320);
      }, 240);
    }, 2200);
  }
})();
