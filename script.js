/* ═══════════════════════════════════════════════════════════════
   CARMART24 — script.js
   GSAP + ScrollTrigger animations, interactions, carousel, form
   ═══════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── WAIT FOR GSAP ─── */
  function waitForGSAP(cb, attempt = 0) {
    if (window.gsap && window.ScrollTrigger) {
      cb();
    } else if (attempt < 40) {
      setTimeout(() => waitForGSAP(cb, attempt + 1), 100);
    }
  }

  /* ─── LOADER ─── */
  function initLoader() {
    const loader = document.getElementById('pageLoader');
    if (!loader) return;
    setTimeout(() => {
      loader.classList.add('hidden');
      document.body.style.overflow = '';
      initAllAnimations();
    }, 1600);
    document.body.style.overflow = 'hidden';
  }

  /* ─── PARTICLE CANVAS ─── */
  function initParticles() {
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [];
    const N = 40;

    function resize() {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.r = Math.random() * 1.5 + 0.3;
        this.alpha = Math.random() * 0.4 + 0.05;
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.12;
        this.life = 0;
        this.maxLife = Math.random() * 300 + 200;
      }
      update() {
        this.x += this.vx; this.y += this.vy; this.life++;
        if (this.life > this.maxLife) this.reset();
      }
      draw() {
        const prog = this.life / this.maxLife;
        const a = this.alpha * (prog < 0.15 ? prog / 0.15 : prog > 0.85 ? (1 - prog) / 0.15 : 1);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214,179,106,${a.toFixed(3)})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < N; i++) particles.push(new Particle());

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(loop);
    }
    loop();
  }

  /* ─── CURSOR GLOW ─── */
  function initCursorGlow() {
    const cursor = document.getElementById('cursorGlow');
    if (!cursor || window.matchMedia('(pointer:coarse)').matches) return;
    cursor.style.display = 'block';
    let mx = 0, my = 0, cx = 0, cy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function animate() {
      cx += (mx - cx) * 0.08;
      cy += (my - cy) * 0.08;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    })();
  }

  /* ─── MAGNETIC BUTTONS ─── */
  function initMagneticButtons() {
    if (window.matchMedia('(pointer:coarse)').matches) return;
    document.querySelectorAll('.magnetic-btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width  / 2);
        const dy = e.clientY - (r.top  + r.height / 2);
        btn.style.transform = `translate(${dx * 0.22}px, ${dy * 0.22}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = '';
      });
    });
  }

  /* ─── NAVBAR ─── */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const onScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* Smooth anchor scroll */
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', e => {
        const id = link.getAttribute('href').slice(1);
        const target = document.getElementById(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 70, behavior: 'smooth' });
        closeMobileMenu();
      });
    });
  }

  /* ─── MOBILE MENU ─── */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!hamburger || !menu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = menu.classList.contains('open');
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });

    menu.addEventListener('click', e => {
      if (e.target === menu) closeMobileMenu();
    });
  }

  function openMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    hamburger.classList.add('open');
    menu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!hamburger || !menu) return;
    hamburger.classList.remove('open');
    menu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ─── HERO PARALLAX ─── */
  function initHeroParallax() {
    const bg = document.getElementById('heroBgImg');
    if (!bg || window.matchMedia('(pointer:coarse)').matches) return;
    document.addEventListener('mousemove', e => {
      const dx = (e.clientX / window.innerWidth  - 0.5) * 10;
      const dy = (e.clientY / window.innerHeight - 0.5) * 10;
      bg.style.transform = `scale(1.05) translate(${dx}px, ${dy}px)`;
    });
  }

  /* ─── INVENTORY FILTER ─── */
  function initInventoryFilter() {
    const btns  = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.car-card');
    if (!btns.length) return;

    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        cards.forEach(card => {
          const cats = card.dataset.category || '';
          const show = filter === 'all' || cats.includes(filter);

          if (show) {
            card.classList.remove('hidden');
            card.style.animation = 'none';
            requestAnimationFrame(() => {
              card.style.animation = 'cardReveal 0.4s var(--ease-cinematic) forwards';
            });
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });

    const style = document.createElement('style');
    style.textContent = `
      @keyframes cardReveal {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0);    }
      }
    `;
    document.head.appendChild(style);
  }

  /* ─── REVIEWS CAROUSEL ─── */
  function initCarousel() {
    const track = document.getElementById('reviewsCarousel');
    const dotsWrap = document.getElementById('carouselDots');
    const prevBtn  = document.getElementById('carouselPrev');
    const nextBtn  = document.getElementById('carouselNext');
    if (!track) return;

    const cards = track.querySelectorAll('.review-card');
    const total = cards.length;
    if (!total) return;

    function cardsPerView() {
      return window.innerWidth <= 768 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
    }

    let current = 0;
    let perView = cardsPerView();
    const maxIndex = () => Math.max(0, total - perView);

    /* Build dots */
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-label', `Review ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsWrap) return;
      dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function getCardWidth() {
      if (!cards[0]) return 0;
      const gap = 24;
      const containerW = track.parentElement.offsetWidth - 40;
      return (containerW - gap * (perView - 1)) / perView;
    }

    function goTo(idx) {
      current = Math.max(0, Math.min(idx, maxIndex()));
      const cw = getCardWidth();
      track.style.transform = `translateX(-${current * (cw + 24)}px)`;
      // Update card widths
      cards.forEach(c => { c.style.flex = `0 0 ${cw}px`; });
      updateDots();
    }

    function resize() {
      perView = cardsPerView();
      if (current > maxIndex()) current = maxIndex();
      buildDots();
      goTo(current);
    }

    prevBtn?.addEventListener('click', () => goTo(current - 1));
    nextBtn?.addEventListener('click', () => goTo(current + 1));
    window.addEventListener('resize', resize);

    /* Touch swipe */
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 40) goTo(current + (dx < 0 ? 1 : -1));
    });

    /* Auto-advance */
    let autoTimer = setInterval(() => goTo(current < maxIndex() ? current + 1 : 0), 5000);
    track.addEventListener('mouseenter', () => clearInterval(autoTimer));
    track.addEventListener('mouseleave', () => {
      autoTimer = setInterval(() => goTo(current < maxIndex() ? current + 1 : 0), 5000);
    });

    resize();
  }

  /* ─── COUNTER ANIMATION ─── */
  function initCounters() {
    const nums = document.querySelectorAll('.stat-num[data-target]');
    nums.forEach(el => {
      const target = parseFloat(el.dataset.target);
      let started = false;

      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          const duration = 1800;
          const start = performance.now();
          const isDecimal = String(target).includes('.');

          function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            const ease = 1 - Math.pow(1 - t, 3);
            const val = ease * target;
            el.textContent = isDecimal ? val.toFixed(0) : Math.round(val);
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = isDecimal ? target.toFixed(0) : Math.round(target);
          }
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      }, { threshold: 0.3 });
      observer.observe(el);
    });
  }

  /* ─── FORM ─── */
  function initForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    function setError(id, msg) {
      const el = document.getElementById(id);
      const input = document.getElementById(id.replace('Error', ''));
      if (el) el.textContent = msg;
      if (input) input.classList.toggle('error', !!msg);
    }

    function validate() {
      let ok = true;
      const name  = document.getElementById('name');
      const phone = document.getElementById('phone');

      if (!name?.value.trim()) {
        setError('nameError', 'Please enter your name.');
        ok = false;
      } else setError('nameError', '');

      if (!phone?.value.trim() || !/^[\d\s\+\-]{8,15}$/.test(phone.value.trim())) {
        setError('phoneError', 'Please enter a valid phone number.');
        ok = false;
      } else setError('phoneError', '');

      return ok;
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      if (!validate()) return;

      const btn = document.getElementById('submitBtn');
      const success = document.getElementById('formSuccess');
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

      /* Build WhatsApp message from form data */
      const nm = document.getElementById('name')?.value.trim();
      const ph = document.getElementById('phone')?.value.trim();
      const car = document.getElementById('car')?.value.trim();
      const budget = document.getElementById('budget')?.value;
      const msg = document.getElementById('message')?.value.trim();

      const waText = encodeURIComponent(
        `Hi CARMART24,\n\nName: ${nm}\nPhone: ${ph}` +
        (car ? `\nInterested In: ${car}` : '') +
        (budget ? `\nBudget: ${budget}` : '') +
        (msg ? `\nMessage: ${msg}` : '') +
        `\n\nPlease help me find the right car.`
      );

      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.textContent = 'Send Enquiry'; }
        if (success) {
          success.textContent = '✓ Enquiry sent! We\'ll reach out within 24 hours.';
          success.classList.add('visible');
          form.reset();
          setTimeout(() => success.classList.remove('visible'), 5000);
        }
        /* Open WhatsApp with pre-filled message */
        window.open(`https://wa.me/918208496047?text=${waText}`, '_blank', 'noopener');
      }, 800);
    });
  }

  /* ─── PROCESS LINE ANIMATION ─── */
  function initProcessLine() {
    const fill = document.querySelector('.process-line-fill');
    const line = document.querySelector('.process-line');
    if (!fill || !line) return;
    line.style.display = 'block';
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        fill.style.width = '100%';
        observer.disconnect();
      }
    }, { threshold: 0.4 });
    observer.observe(fill);
  }

  /* ─── GSAP ANIMATIONS ─── */
  function initGSAPAnimations() {
    if (!window.gsap || !window.ScrollTrigger) return;
    const { gsap, ScrollTrigger } = window;
    gsap.registerPlugin(ScrollTrigger);

    /* ── Hero Reveal ── */
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('#heroEyebrow', { opacity: 1, y: 0, duration: 0.7, delay: 0.3 })
      .to('#heroHeadline .hero-line1', { opacity: 1, y: 0, duration: 0.9 }, '-=0.4')
      .to('#heroHeadline .hero-line2', { opacity: 1, y: 0, duration: 0.9 }, '-=0.7')
      .to('#heroSubline',  { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .to('#heroBody',     { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .to('#heroCtas',     { opacity: 1, y: 0, duration: 0.6 }, '-=0.35')
      .to('#heroTrust',    { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
      .to('.scroll-indicator', { opacity: 1, duration: 0.5 }, '-=0.1');

    /* ── Hero BG slow zoom ── */
    const heroBgImg = document.getElementById('heroBgImg');
    if (heroBgImg) {
      gsap.fromTo(heroBgImg,
        { scale: 1.08 },
        { scale: 1, duration: 2, ease: 'power2.out' }
      );
    }

    /* ── Trust Strip ── */
    gsap.from('.trust-item', {
      scrollTrigger: { trigger: '.trust-strip', start: 'top 85%' },
      opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: 'power2.out'
    });

    /* ── Section headers ── */
    document.querySelectorAll('.section-header').forEach(el => {
      gsap.from(el.children, {
        scrollTrigger: { trigger: el, start: 'top 80%' },
        opacity: 0, y: 30, stagger: 0.12, duration: 0.8, ease: 'power3.out'
      });
    });

    /* ── Inventory cards ── */
    ScrollTrigger.batch('.car-card:not(.hidden)', {
      onEnter: batch => gsap.from(batch, {
        opacity: 0, y: 40, stagger: 0.1, duration: 0.7, ease: 'power2.out'
      }),
      start: 'top 90%'
    });

    /* ── Showcase ── */
    gsap.from('.showcase-image-col', {
      scrollTrigger: { trigger: '.showcase-section', start: 'top 75%' },
      opacity: 0, x: -60, duration: 1, ease: 'power3.out'
    });
    gsap.from('.showcase-content-col', {
      scrollTrigger: { trigger: '.showcase-section', start: 'top 75%' },
      opacity: 0, x: 60, duration: 1, ease: 'power3.out', delay: 0.1
    });

    /* ── Why cards ── */
    gsap.from('.why-card', {
      scrollTrigger: { trigger: '.why-grid', start: 'top 80%' },
      opacity: 0, y: 50, stagger: 0.12, duration: 0.7, ease: 'power3.out'
    });

    /* ── Process steps ── */
    gsap.from('.process-step', {
      scrollTrigger: { trigger: '.process-steps', start: 'top 80%' },
      opacity: 0, y: 40, stagger: 0.15, duration: 0.7, ease: 'power3.out'
    });

    /* ── Review cards ── */
    gsap.from('.review-card', {
      scrollTrigger: { trigger: '.reviews-carousel', start: 'top 85%' },
      opacity: 0, y: 30, stagger: 0.12, duration: 0.6, ease: 'power2.out'
    });

    /* ── Story ── */
    gsap.from('.story-visual', {
      scrollTrigger: { trigger: '.story-section', start: 'top 75%' },
      opacity: 0, x: -60, duration: 1, ease: 'power3.out'
    });
    gsap.from('.story-content > *', {
      scrollTrigger: { trigger: '.story-section', start: 'top 75%' },
      opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: 'power3.out', delay: 0.15
    });

    /* ── Location ── */
    gsap.from('.location-info', {
      scrollTrigger: { trigger: '.location-section', start: 'top 80%' },
      opacity: 0, x: -40, duration: 0.8, ease: 'power3.out'
    });
    gsap.from('.location-map-wrap', {
      scrollTrigger: { trigger: '.location-section', start: 'top 80%' },
      opacity: 0, x: 40, duration: 0.8, ease: 'power3.out', delay: 0.1
    });

    /* ── Contact ── */
    gsap.from('.contact-left > *', {
      scrollTrigger: { trigger: '.contact-section', start: 'top 80%' },
      opacity: 0, x: -40, stagger: 0.1, duration: 0.7, ease: 'power3.out'
    });
    gsap.from('.contact-form .form-group', {
      scrollTrigger: { trigger: '.contact-form', start: 'top 85%' },
      opacity: 0, y: 20, stagger: 0.08, duration: 0.5, ease: 'power2.out'
    });

    /* ── Final CTA ── */
    gsap.from('.final-cta-title, .final-cta-sub', {
      scrollTrigger: { trigger: '.final-cta-section', start: 'top 75%' },
      opacity: 0, y: 40, stagger: 0.15, duration: 0.8, ease: 'power3.out'
    });
    gsap.from('.final-cta-btns .btn', {
      scrollTrigger: { trigger: '.final-cta-section', start: 'top 75%' },
      opacity: 0, y: 20, stagger: 0.1, duration: 0.6, ease: 'power3.out', delay: 0.3
    });

    /* ── Scroll parallax on hero bg ── */
    ScrollTrigger.create({
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      onUpdate: self => {
        const bg = document.getElementById('heroBgImg');
        if (bg && !window.matchMedia('(pointer:coarse)').matches) {
          bg.style.transform = `scale(1.05) translateY(${self.progress * 60}px)`;
        }
      }
    });

    /* ── Gold shimmer on logo ── */
    const logoEls = document.querySelectorAll('.nav-logo, .footer-logo, .loader-logo');
    logoEls.forEach(el => {
      gsap.to(el, {
        backgroundPositionX: '200%',
        duration: 2.5,
        repeat: -1,
        ease: 'none',
        yoyo: true
      });
    });
  }

  /* ─── ACTIVE NAV LINK ─── */
  function initActiveNavLinks() {
    const sections = document.querySelectorAll('section[id], div[id]');
    const links = document.querySelectorAll('.nav-link');

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          links.forEach(l => {
            l.style.color = l.getAttribute('href') === `#${id}` ? 'var(--gold)' : '';
          });
        }
      });
    }, { threshold: 0.3, rootMargin: '-60px 0px -40% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  /* ─── CAR CARD VIEW DETAILS (demo) ─── */
  function initCarCardButtons() {
    document.querySelectorAll('.car-btn-primary').forEach(btn => {
      btn.addEventListener('click', function () {
        const card = this.closest('.car-card');
        const name = card?.querySelector('.car-name')?.textContent || 'this vehicle';
        const waText = encodeURIComponent(
          `Hi CARMART24, I am interested in the ${name}. Please share full details and current availability.`
        );
        window.open(`https://wa.me/918208496047?text=${waText}`, '_blank', 'noopener');
      });
    });
  }

  /* ─── ALL ANIMATIONS ─── */
  function initAllAnimations() {
    initHeroParallax();
    initMagneticButtons();
    initProcessLine();
    initCounters();
    waitForGSAP(initGSAPAnimations);
  }

  /* ─── BOOT ─── */
  document.addEventListener('DOMContentLoaded', () => {
    initLoader();
    initParticles();
    initCursorGlow();
    initNavbar();
    initMobileMenu();
    initInventoryFilter();
    initCarousel();
    initForm();
    initActiveNavLinks();
    initCarCardButtons();
  });

})();
