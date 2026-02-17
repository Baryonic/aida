/**
 * animations.js – Scroll-triggered reveals, parallax, particles, and immersive effects.
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  /* ==================================================================
     1. Scroll-triggered reveal (IntersectionObserver)
     ================================================================== */
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    reveals.forEach(el => revealObserver.observe(el));
  }

  /* ==================================================================
     2. Stagger children (set CSS --i variable)
     ================================================================== */
  document.querySelectorAll('.stagger').forEach(parent => {
    [...parent.children].forEach((child, i) => {
      child.style.setProperty('--i', i);
    });
  });

  /* ==================================================================
     3. Parallax on scroll
     ================================================================== */
  const parallaxLayers = document.querySelectorAll('.parallax-layer');
  if (parallaxLayers.length) {
    const onParallax = () => {
      const scrollY = window.scrollY;
      parallaxLayers.forEach(layer => {
        const speed = parseFloat(layer.dataset.speed) || 0.3;
        layer.style.transform = `translateY(${scrollY * speed}px)`;
      });
    };
    window.addEventListener('scroll', onParallax, { passive: true });
  }

  /* ==================================================================
     4. Hero particles
     ================================================================== */
  const particleContainer = document.querySelector('.hero__particles');
  if (particleContainer) {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a29bfe', '#fd79a8'];
    for (let i = 0; i < 30; i++) {
      const span = document.createElement('span');
      span.className = 'hero__particle';
      const size = Math.random() * 14 + 6;
      span.style.width  = size + 'px';
      span.style.height = size + 'px';
      span.style.left   = Math.random() * 100 + '%';
      span.style.top    = Math.random() * 100 + '%';
      span.style.background = colors[Math.floor(Math.random() * colors.length)];
      span.style.animationDuration = (Math.random() * 12 + 10) + 's';
      span.style.animationDelay    = (Math.random() * 8) + 's';
      particleContainer.appendChild(span);
    }
  }

  /* ==================================================================
     5. Smooth fade-in on page load
     ================================================================== */
  document.body.classList.add('loaded');

  /* ==================================================================
     6. Typed / typewriter text effect for hero title
     ================================================================== */
  const typedEl = document.querySelector('[data-typed]');
  if (typedEl) {
    const words = (typedEl.dataset.typed || '').split(',').map(w => w.trim());
    if (words.length) {
      let wordIndex = 0;
      let charIndex = 0;
      let deleting  = false;
      const speed   = 100;
      const pause   = 2000;

      const type = () => {
        const current = words[wordIndex];
        typedEl.textContent = current.substring(0, charIndex);

        if (!deleting) {
          charIndex++;
          if (charIndex > current.length) {
            deleting = true;
            setTimeout(type, pause);
            return;
          }
        } else {
          charIndex--;
          if (charIndex < 0) {
            deleting = false;
            charIndex = 0;
            wordIndex = (wordIndex + 1) % words.length;
          }
        }
        setTimeout(type, deleting ? speed / 2 : speed);
      };
      setTimeout(type, 800);
    }
  }

  /* ==================================================================
     7. Smooth anchor scrolling
     ================================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ==================================================================
     8. Mouse-follow tilt on book cards
     ================================================================== */
  document.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -5;
      const rotateY = ((x - centerX) / centerX) * 5;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
});
