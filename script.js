/* ==========================================================================
   ARINA — Wedding Reels
   script.js — progress bar, scroll reveals, draggable gallery, video control
   ========================================================================== */

(() => {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
     1. Scroll progress bar
     Fills a thin bar at the top of the page based on scroll position.
     ------------------------------------------------------------------ */
  const progressBar = document.getElementById('progressBar');

  function updateProgressBar() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';
  }

  let progressTicking = false;
  window.addEventListener('scroll', () => {
    if (!progressTicking) {
      window.requestAnimationFrame(() => {
        updateProgressBar();
        progressTicking = false;
      });
      progressTicking = true;
    }
  }, { passive: true });

  updateProgressBar();

  /* ------------------------------------------------------------------
     2. Smooth scroll to portfolio
     ------------------------------------------------------------------ */
  const scrollToPortfolioBtn = document.getElementById('scrollToPortfolio');
  const portfolioSection = document.getElementById('portfolio');

  scrollToPortfolioBtn.addEventListener('click', () => {
    portfolioSection.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  });

  /* ------------------------------------------------------------------
     3. Reveal on scroll (Intersection Observer)
     Sections fade + slide into view as they enter the viewport.
     ------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    // No IO support or reduced motion preferred — show everything immediately
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }

  /* ------------------------------------------------------------------
     4. Portfolio gallery
     - Each card holds a Cloudinary embed player (iframe) with its own
       built-in play/pause controls, loaded natively via loading="lazy"
     - Mouse drag support on desktop, native touch swipe on mobile
     - Updates the "01 / 08" counter as the user scrolls
     ------------------------------------------------------------------ */
  const gallery = document.getElementById('gallery');
  const galleryTrack = document.getElementById('galleryTrack');
  const galleryCards = Array.from(document.querySelectorAll('.gallery__card'));
  const galleryCurrentEl = document.getElementById('galleryCurrent');

  /* --- 4c. Desktop mouse-drag scrolling --- */
  let isDragging = false;
  let startX = 0;
  let scrollStart = 0;
  let dragMoved = false;

  gallery.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragMoved = false;
    gallery.classList.add('is-dragging');
    startX = e.pageX - gallery.offsetLeft;
    scrollStart = gallery.scrollLeft;
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    gallery.classList.remove('is-dragging');
  });

  gallery.addEventListener('mouseleave', () => {
    isDragging = false;
    gallery.classList.remove('is-dragging');
  });

  gallery.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - gallery.offsetLeft;
    const walk = x - startX;
    if (Math.abs(walk) > 5) dragMoved = true; // distinguishes a drag from a click
    gallery.scrollLeft = scrollStart - walk;
  });

  // Prevent a click that was actually a drag from triggering play/pause
  gallery.addEventListener('click', (e) => {
    if (dragMoved) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, true);

  /* Native touch scrolling (swipe) is already supported by the browser via
     overflow-x: auto + -webkit-overflow-scrolling: touch — no extra JS needed. */

  /* --- 4d. Update the "01 / 08" counter based on which card is most visible --- */
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          const index = entry.target.dataset.videoIndex;
          const displayIndex = String(Number(index) + 1).padStart(2, '0');
          galleryCurrentEl.textContent = displayIndex;
        }
      });
    }, {
      root: gallery,
      threshold: [0.6]
    });

    galleryCards.forEach((card) => counterObserver.observe(card));
  }

  /* ------------------------------------------------------------------
     5. Keyboard navigation for the gallery
     Arrow keys move focus/scroll through the horizontal gallery when
     the gallery region itself is focused.
     ------------------------------------------------------------------ */
  gallery.addEventListener('keydown', (e) => {
    const cardWidth = galleryCards[0]
      ? galleryCards[0].getBoundingClientRect().width + 24
      : 300;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      gallery.scrollBy({ left: cardWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      gallery.scrollBy({ left: -cardWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  });

})();
