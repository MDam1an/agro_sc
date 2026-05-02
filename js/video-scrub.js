/**
 * VIDEO SCROLL SCRUB
 * O vídeo avança/retrocede de acordo com o scroll.
 * Nenhum autoplay — controlado 100% pelo usuário.
 */
(function () {
  'use strict';

  const video    = document.getElementById('bgVideo');
  const wrapper  = document.getElementById('videoScrollWrapper');
  const progBar  = document.getElementById('scrollProgressBar');
  const blocks   = document.querySelectorAll('.vs-block');

  if (!video || !wrapper) return;

  let duration = 0;
  let rafPending = false;

  // Once metadata loaded, we know the duration
  video.addEventListener('loadedmetadata', () => {
    duration = video.duration; // ~6.04s
    video.currentTime = 0;
    video.pause();
    scrub(); // sync immediately
  });

  // Also handle if already loaded (cached)
  if (video.readyState >= 1) {
    duration = video.duration;
    video.currentTime = 0;
    video.pause();
  }

  function scrub() {
    if (!duration) return;

    const rect    = wrapper.getBoundingClientRect();
    const wh      = window.innerHeight;
    const total   = wrapper.offsetHeight - wh;   // scrollable px inside wrapper
    const scrolled = -rect.top;                  // how far we've scrolled into wrapper
    const progress = Math.max(0, Math.min(1, scrolled / total));

    // Set video time
    const targetTime = progress * duration;
    if (Math.abs(video.currentTime - targetTime) > 0.01) {
      video.currentTime = targetTime;
    }

    // Progress bar
    if (progBar) progBar.style.width = (progress * 100) + '%';

    // Show/hide vs-blocks based on progress windows
    blocks.forEach(block => {
      const from = parseFloat(block.dataset.from || 0);
      const to   = parseFloat(block.dataset.to   || 1);
      if (progress >= from && progress <= to) {
        block.classList.add('vs-visible');
      } else {
        block.classList.remove('vs-visible');
      }
    });

    // Nav transparency: solid when past video wrapper
    const navbar = document.getElementById('navbar');
    if (navbar) {
      const pastVideo = rect.bottom <= wh;
      navbar.classList.toggle('solid', pastVideo || scrolled < 0);
    }

    rafPending = false;
  }

  window.addEventListener('scroll', () => {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(scrub);
    }
  }, { passive: true });

  // Disable right-click / context menu on video
  video.addEventListener('contextmenu', e => e.preventDefault());

  // Prevent drag-to-download
  video.addEventListener('dragstart', e => e.preventDefault());

  // Initial scrub
  scrub();
})();
