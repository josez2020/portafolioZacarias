(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Menú móvil
  var menuBtn = document.getElementById('menuToggle');
  var links = document.getElementById('navLinks');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      links.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Aparición al hacer scroll (incluye la línea de la trayectoria)
  var items = document.querySelectorAll('.reveal, .road');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // 04 · Así transformo un proceso
  var journey = document.getElementById('journey');
  if (journey) {
    var stage = document.getElementById('stage');
    var steps = journey.querySelectorAll('.jstep');
    var stepLabel = document.getElementById('stageStep');
    var statusLabel = document.getElementById('stageStatus');
    var STEP_MS = 4200;
    var current = 0;
    var timer = null;
    var userTookControl = false;
    journey.style.setProperty('--step-ms', STEP_MS + 'ms');

    function goTo(i) {
      current = i;
      for (var k = 1; k <= steps.length; k++) stage.classList.toggle('at-' + k, k <= i + 1);
      steps.forEach(function (s, idx) {
        s.classList.toggle('is-active', idx === i);
        s.classList.toggle('is-done', idx < i);
        s.setAttribute('aria-selected', idx === i);
      });
      stepLabel.textContent = '0' + (i + 1) + ' / 0' + steps.length;
      statusLabel.textContent = steps[i].dataset.status;

      // Reinicia la barra de avance
      var bar = steps[i].querySelector('.jstep__bar');
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    }

    function play() {
      if (userTookControl || reduceMotion || timer) return;
      journey.classList.add('playing');
      timer = setInterval(function () { goTo((current + 1) % steps.length); }, STEP_MS);
    }
    function stop() {
      clearInterval(timer);
      timer = null;
      journey.classList.remove('playing');
    }

    steps.forEach(function (s, idx) {
      s.addEventListener('click', function () {
        userTookControl = true;
        stop();
        goTo(idx);
      });
    });

    goTo(0);

    // Solo avanza mientras la sección está en pantalla
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : stop(); });
      }, { threshold: 0.4 }).observe(journey);
    }
  }

  // 05 · Recorrido del portal: cambia de módulo solo o con las pestañas
  var tour = document.getElementById('tour');
  if (tour) {
    var tImgs = tour.querySelectorAll('.tour__img');
    var tTabs = tour.querySelectorAll('.tour__tab');
    var TOUR_MS = 4500, tIdx = 0, tTimer = null, tUser = false;
    tour.style.setProperty('--tour-ms', TOUR_MS + 'ms');

    function show(i) {
      tIdx = i;
      tImgs.forEach(function (img, k) { img.classList.toggle('is-on', k === i); });
      tTabs.forEach(function (tab, k) {
        tab.classList.toggle('is-on', k === i);
        tab.setAttribute('aria-selected', k === i);
      });
      var bar = tTabs[i].querySelector('.tour__bar');
      bar.style.animation = 'none';
      void bar.offsetWidth;
      bar.style.animation = '';
    }
    function tPlay() {
      if (tUser || reduceMotion || tTimer) return;
      tour.classList.add('playing');
      tTimer = setInterval(function () { show((tIdx + 1) % tImgs.length); }, TOUR_MS);
    }
    function tStop() {
      clearInterval(tTimer);
      tTimer = null;
      tour.classList.remove('playing');
    }

    tTabs.forEach(function (tab, k) {
      tab.addEventListener('click', function () { tUser = true; tStop(); show(k); });
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? tPlay() : tStop(); });
      }, { threshold: 0.35 }).observe(tour);
    }
  }

  // 07 · Visor de casos
  var cases = document.getElementById('cases');
  if (cases) {
    var tabs = cases.querySelectorAll('.cases__nav button');
    tabs.forEach(function (tab) {
      tab.setAttribute('aria-controls', tab.dataset.case);
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle('is-active', on);
          t.setAttribute('aria-selected', on);
          document.getElementById(t.dataset.case).classList.toggle('is-active', on);
        });
        tab.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
      });
    });
  }

  // 08 · Evidencia: carga capturas, filtros y visor
  var gallery = document.getElementById('gallery');
  if (gallery) {
    var shots = gallery.querySelectorAll('.shot');
    var lightbox = document.getElementById('lightbox');
    var lbImg = document.getElementById('lightboxImg');
    var lbCap = document.getElementById('lightboxCap');

    shots.forEach(function (shot) {
      var src = shot.dataset.src;
      if (!src) return;
      var img = new Image();
      img.alt = shot.querySelector('strong').textContent;
      img.onload = function () {
        shot.querySelector('.shot__frame').appendChild(img);
        shot.classList.add('has-img');
        shot.tabIndex = 0;
      };
      img.src = src;

      function open() {
        if (!shot.classList.contains('has-img') || !lightbox.showModal) return;
        lbImg.src = src;
        lbImg.alt = img.alt;
        lbCap.textContent = img.alt + ' · ' + shot.querySelector('figcaption span').textContent;
        lightbox.showModal();
      }
      shot.addEventListener('click', open);
      shot.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); });
    });

    document.getElementById('lightboxClose').addEventListener('click', function () { lightbox.close(); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) lightbox.close(); });

    var filters = document.querySelectorAll('#galleryFilters button');
    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.dataset.filter;
        filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        shots.forEach(function (s) { s.hidden = f !== 'all' && s.dataset.cat !== f; });
      });
    });
  }

  // Contacto: WhatsApp y correo con mensaje listo. Se arman aquí para no
  // dejar el número ni el correo como texto en el HTML.
  var MENSAJE = 'Hola José, vi tu portafolio. Busco soluciones de TI y me gustaría platicar contigo.';
  var waBtn = document.getElementById('waBtn');
  var mailBtn = document.getElementById('mailBtn');
  if (waBtn) {
    waBtn.href = 'https://wa.me/' + ['52', '55', '8617', '1426'].join('') + '?text=' + encodeURIComponent(MENSAJE);
  }
  if (mailBtn) {
    mailBtn.href = 'mailto:' + ['zacariasj384', 'gmail.com'].join('@') +
      '?subject=' + encodeURIComponent('Soluciones de TI') +
      '&body=' + encodeURIComponent(MENSAJE);
  }

  // Botón volver arriba: aparece al bajar
  var toTop = document.getElementById('toTop');
  function onScroll() { toTop.classList.toggle('show', window.scrollY > 600); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // El menú es fijo, así que un enlace a #top no mueve la página: se sube por código
  document.querySelectorAll('a[href="#top"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      links.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (history.replaceState) history.replaceState(null, '', location.pathname + location.search);
    });
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
