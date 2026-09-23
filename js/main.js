(function () {
  var root = document.documentElement;

  // Tema claro / oscuro
  var themeBtn = document.getElementById('themeToggle');
  themeBtn.addEventListener('click', function () {
    var current = root.getAttribute('data-theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    var next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

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

  // Aparición al hacer scroll
  var items = document.querySelectorAll('.reveal');
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

  // Copiar correo
  var copyBtn = document.getElementById('copyEmail');
  var copyLabel = document.getElementById('copyLabel');
  copyBtn.addEventListener('click', function () {
    var email = copyBtn.getAttribute('data-email');
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(email).then(function () {
      copyLabel.textContent = '¡Copiado!';
      setTimeout(function () { copyLabel.textContent = email; }, 1600);
    });
  });

  // Enfoque: el proceso se transforma paso a paso
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
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  // Trayectoria: capas acumuladas
  var layersEl = document.getElementById('layers');
  if (layersEl) {
    var start = +layersEl.dataset.start;
    var end = +layersEl.dataset.end;
    var total = end - start + 1;
    layersEl.style.setProperty('--cols', total);

    var axis = layersEl.querySelector('.layers__axis');
    for (var y = start; y <= end; y++) {
      var s = document.createElement('span');
      s.innerHTML = '<span class="full">' + y + '</span><span class="short">’' + String(y).slice(2) + '</span>';
      axis.appendChild(s);
    }

    var layers = layersEl.querySelectorAll('.layer');
    var span = document.getElementById('layerSpan');
    var unit = document.getElementById('layerUnit');
    var kicker = document.getElementById('layerKicker');
    var title = document.getElementById('layerTitle');
    var desc = document.getElementById('layerDesc');
    var tags = document.getElementById('layerTags');

    function select(layer) {
      layers.forEach(function (l) {
        l.classList.toggle('is-active', l === layer);
        l.setAttribute('aria-selected', l === layer);
      });
      var years = end - (+layer.dataset.from) + 1;
      span.textContent = years;
      unit.textContent = years === 1 ? 'año en esta capa' : 'años en esta capa';
      kicker.textContent = layer.dataset.from + ' → hoy';
      title.textContent = layer.dataset.title;
      desc.textContent = layer.dataset.desc;
      tags.innerHTML = '';
      layer.dataset.tags.split('|').forEach(function (t) {
        var li = document.createElement('li');
        li.textContent = t;
        tags.appendChild(li);
      });
    }

    // Las barras crecen desde la base (SAP B1) hacia arriba
    var n = layers.length;
    layers.forEach(function (layer, i) {
      var from = +layer.dataset.from;
      var bar = layer.querySelector('.layer__bar');
      bar.style.setProperty('--w', (end - from + 1) / total);
      bar.style.setProperty('--d', ((n - 1 - i) * 0.15) + 's');
      layer.querySelector('.layer__years').textContent = from + ' → hoy';
      layer.addEventListener('click', function () { select(layer); });
      layer.addEventListener('mouseenter', function () { select(layer); });
    });

    select(layersEl.querySelector('.layer.is-active') || layers[n - 1]);
  }

  document.getElementById('year').textContent = new Date().getFullYear();
})();
