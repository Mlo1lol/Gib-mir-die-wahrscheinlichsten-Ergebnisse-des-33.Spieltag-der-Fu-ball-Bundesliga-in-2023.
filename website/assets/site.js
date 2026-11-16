/* Koop Steuerberatung — Bewegung und Helfer. Keine Fremdbibliotheken, kein Tracking. */
(function () {
  "use strict";
  var root = document.documentElement;
  root.classList.add("js");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) root.classList.add("rm");

  /* ======================= Fristen ======================= */
  var DAY = 86400000;
  var mShort = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
  var mLong = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var wd = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  function d(y, m, day) { return new Date(y, m, day, 12); }
  function key(x) { return x.getFullYear() + "-" + x.getMonth() + "-" + x.getDate(); }
  function add(x, n) { return new Date(x.getTime() + n * DAY); }
  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, e = Math.floor(b / 4), f = b % 4, g = Math.floor((b + 8) / 25), h = Math.floor((b - g + 1) / 3);
    var i = (19 * a + b - e - h + 15) % 30, k = Math.floor(c / 4), l = c % 4, m = (32 + 2 * f + 2 * k - i - l) % 7, n = Math.floor((a + 11 * i + 22 * m) / 451);
    return d(y, Math.floor((i + m - 7 * n + 114) / 31) - 1, ((i + m - 7 * n + 114) % 31) + 1);
  }
  function national(y) { var e = easter(y); return [d(y, 0, 1), add(e, -2), add(e, 1), d(y, 4, 1), add(e, 39), add(e, 50), d(y, 9, 3), d(y, 11, 25), d(y, 11, 26)]; }
  var cMV = {}, cBank = {};
  function setOf(list) { var s = {}; list.forEach(function (x) { s[key(x)] = 1; }); return s; }
  function mv(y) { return cMV[y] || (cMV[y] = setOf(national(y).concat([d(y, 2, 8), d(y, 9, 31)]))); } // + Frauentag, Reformationstag
  function bank(y) { return cBank[y] || (cBank[y] = setOf(national(y).concat([d(y, 11, 24), d(y, 11, 31)]))); }
  function workMV(x) { var w = x.getDay(); return w && w !== 6 && !mv(x.getFullYear())[key(x)]; }
  function bankday(x) { var w = x.getDay(); return w && w !== 6 && !bank(x.getFullYear())[key(x)]; }
  function shift(x) { while (!workMV(x)) x = add(x, 1); return x; } // § 108 Abs. 3 AO
  function thirdLastBank(y, m) { var x = d(y, m + 1, 0), n = 0; for (;;) { if (bankday(x) && ++n === 3) return x; x = add(x, -1); } }

  function deadlines(today) {
    var list = [], y0 = today.getFullYear(), m0 = today.getMonth();
    for (var i = 0; i < 5; i++) {
      var y = y0 + Math.floor((m0 + i) / 12), m = (m0 + i) % 12;
      list.push({ date: shift(d(y, m, 10)), what: "Umsatzsteuer-Voranmeldung, Lohnsteuer-Anmeldung" });
      list.push({ date: thirdLastBank(y, m), what: "Sozialversicherungsbeiträge" });
      if (m % 3 === 2) list.push({ date: shift(d(y, m, 10)), what: "Vorauszahlung Einkommen- und Körperschaftsteuer" });
      if (m % 3 === 1) list.push({ date: shift(d(y, m, 15)), what: "Vorauszahlung Gewerbe- und Grundsteuer" });
    }
    list = list.filter(function (x) { return x.date >= today; }).sort(function (a, b) { return a.date - b.date; });
    var out = [];
    list.forEach(function (x) {
      var last = out[out.length - 1];
      if (last && key(last.date) === key(x.date)) last.parts.push(x.what); else out.push({ date: x.date, parts: [x.what] });
    });
    return out.slice(0, 4);
  }
  function fShort(x) { return x.getDate() + ". " + mShort[x.getMonth()]; }
  function fLong(x) { return x.getDate() + ". " + mLong[x.getMonth()] + " " + x.getFullYear(); }

  var now = new Date();
  var today = d(now.getFullYear(), now.getMonth(), now.getDate());

  var listEl = document.querySelector("[data-deadlines]");
  if (listEl) {
    listEl.innerHTML = deadlines(today).map(function (x, i) {
      var n = Math.round((x.date - today) / DAY);
      return '<li style="--i:' + i + '" class="' + (n <= 7 ? "is-soon" : "") + '"><time class="slip-date tnum" datetime="' + x.date.toISOString().slice(0, 10) + '">' + fShort(x.date) +
        '</time><span class="slip-what">' + x.parts.map(function (s) { return "<span>" + s + "</span>"; }).join("") +
        '</span><span class="slip-in tnum">' + (n === 0 ? "heute" : n === 1 ? "morgen" : "in " + n + " Tagen") + "</span></li>";
    }).join("");
    var t = document.querySelector("[data-today]");
    if (t) t.textContent = "Stand: " + wd[now.getDay()] + ", " + fShort(today);
  }
  // Abgabefrist mit Beratung: letzter Februartag des übernächsten Jahres (§ 149 Abs. 3 AO); ältestes noch offenes Jahr
  var rd = document.querySelector("[data-return-deadline]");
  if (rd) {
    var vz = today.getFullYear() - 2, due = shift(d(vz + 2, 2, 0));
    if (due < today) { vz++; due = shift(d(vz + 2, 2, 0)); }
    rd.querySelector("strong").textContent = fLong(due);
    rd.querySelector("[data-vz]").textContent = vz;
  }

  /* ======================= Bürozeiten ======================= */
  var openEl = document.querySelector("[data-open]");
  if (openEl) {
    var w = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var close = w >= 1 && w <= 4 ? 960 : w === 5 ? 780 : 0;
    var label = openEl.querySelector("span:last-child");
    if (close && workMV(today) && mins >= 540 && mins < close) {
      openEl.classList.add("is-open");
      label.textContent = "Jetzt im Büro erreichbar, heute bis " + close / 60 + " Uhr";
    } else {
      var nx = add(today, mins < 540 ? 0 : 1);
      while (!(nx.getDay() >= 1 && nx.getDay() <= 5 && workMV(nx))) nx = add(nx, 1);
      var when = key(nx) === key(today) ? "heute" : key(nx) === key(add(today, 1)) ? "morgen" : "am " + wd[nx.getDay()];
      label.textContent = "Gerade geschlossen. Wieder erreichbar " + when + " ab 9 Uhr";
    }
  }

  /* ======================= Satz in Wörter zerlegen ======================= */
  var words = [];
  document.querySelectorAll("[data-words]").forEach(function (el) {
    var html = el.innerHTML.replace(/<em>(.*?)<\/em>/g, function (_, inner) { return inner.split(/\s+/).map(function (x) { return "\u0001" + x; }).join(" "); });
    el.innerHTML = html.trim().split(/\s+/).map(function (x) {
      var acc = x.charAt(0) === "\u0001";
      return '<span class="w' + (acc ? " accent" : "") + '">' + (acc ? x.slice(1) : x) + "</span>";
    }).join(" ");
    words.push(el.querySelectorAll(".w"));
  });

  /* ======================= Scroll-Choreografie ======================= */
  // Jedes [data-scroll] bekommt --p (0…1) als Fortschritt.
  //  sticky: Fortschritt durch den hohen Container (Bühne bleibt stehen)
  //  view:   Fortschritt, während das Element durchs Bild läuft
  //  enter:  Fortschritt vom Auftauchen unten bis zur Bildmitte
  var scrollEls = Array.prototype.slice.call(document.querySelectorAll("[data-scroll]"));
  var vh = window.innerHeight;
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function progress(el) {
    var r = el.getBoundingClientRect(), mode = el.getAttribute("data-scroll");
    if (mode === "sticky") return clamp(-r.top / Math.max(1, r.height - vh));
    if (mode === "view") return clamp((vh - r.top) / (vh + r.height));
    return clamp((vh - r.top) / (vh * 0.6)); // enter
  }
  var slip = document.querySelector(".slip");
  var steps = document.querySelectorAll(".step");
  function frame() {
    ticking = false;
    for (var i = 0; i < scrollEls.length; i++) {
      var el = scrollEls[i], p = progress(el);
      var ease = el.hasAttribute("data-ease") ? 1 - Math.pow(1 - p, 3) : p;
      el.style.setProperty("--p", ease.toFixed(4));
      if (el.classList.contains("statement")) {
        var ws = words[0], lit = Math.round(clamp((p - 0.08) / 0.78) * ws.length);
        for (var k = 0; k < ws.length; k++) ws[k].classList.toggle("on", k < lit);
      }
      if (el.classList.contains("process")) {
        for (var s = 0; s < steps.length; s++) steps[s].classList.toggle("on", p >= s / steps.length * 0.9 + 0.02);
      }
      if (el === slip && p > 0.92) slip.classList.add("is-flat");
    }
    var nav = document.querySelector(".nav-bar");
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 10);
  }
  var ticking = false;
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  if (reduce) {
    scrollEls.forEach(function (el) { el.style.setProperty("--p", el.classList.contains("hero") || el.classList.contains("zoom") ? "0" : "1"); });
    words.forEach(function (ws) { ws.forEach(function (w) { w.classList.add("on"); }); });
    steps.forEach(function (s) { s.classList.add("on"); });
    if (slip) slip.classList.add("is-flat");
    var z = document.querySelector(".zoom"); if (z) z.style.setProperty("--p", "1");
  } else {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { vh = window.innerHeight; onScroll(); });
    frame();
  }

  /* ======================= Einblenden ======================= */
  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduce) {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); ro.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -12% 0px" });
    reveals.forEach(function (el) { ro.observe(el); });
  } else reveals.forEach(function (el) { el.classList.add("is-in"); });

  /* ======================= Zahlen zählen hoch ======================= */
  var counters = document.querySelectorAll("[data-count]");
  function runCount(el) {
    var to = +el.getAttribute("data-count"), from = +(el.getAttribute("data-from") || 0), dur = 1600, t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var k = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = Math.round(from + (to - from) * e);
      if (k < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && !reduce) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { runCount(e.target); co.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = el.getAttribute("data-from") || "0"; co.observe(el); });
  }

  /* ======================= Karten-Schiene ======================= */
  var rail = document.querySelector(".rail");
  if (rail) {
    var prev = document.querySelector("[data-rail-prev]"), next = document.querySelector("[data-rail-next]");
    var stepW = function () { var c = rail.querySelector(".card"); return c ? c.getBoundingClientRect().width + 20 : 300; };
    prev.addEventListener("click", function () { rail.scrollBy({ left: -stepW(), behavior: reduce ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { rail.scrollBy({ left: stepW(), behavior: reduce ? "auto" : "smooth" }); });
    var upd = function () { prev.disabled = rail.scrollLeft < 4; next.disabled = rail.scrollLeft + rail.clientWidth > rail.scrollWidth - 4; };
    rail.addEventListener("scroll", upd, { passive: true }); window.addEventListener("resize", upd); upd();
  }

  /* ======================= Menü ======================= */
  var btn = document.querySelector(".menu-btn"), panel = document.getElementById("menu");
  function setMenu(open) {
    btn.setAttribute("aria-expanded", String(open));
    btn.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    panel.classList.toggle("is-open", open);
    panel.setAttribute("aria-hidden", String(!open));
    if (open) panel.removeAttribute("inert"); else panel.setAttribute("inert", "");
    document.body.classList.toggle("menu-open", open);
  }
  if (btn && panel) {
    btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    panel.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); } });
    window.matchMedia("(min-width: 901px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  // aktiver Menüpunkt
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-links a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) { if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });
  }

  /* ======================= Formular ======================= */
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector(".form-status");
    var setErr = function (name, msg) {
      var input = form.elements[name], wrap = input.closest(".field"), err = wrap.querySelector(".field-error");
      if (msg) wrap.setAttribute("data-invalid", ""); else wrap.removeAttribute("data-invalid");
      err.textContent = msg || ""; input.setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    };
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements, first = null, ok = true;
      var check = function (n, msg) { if (!setErr(n, msg)) { ok = false; first = first || f[n]; } };
      var reach = f.reach.value.trim();
      check("name", f.name.value.trim() ? "" : "Bitte geben Sie Ihren Namen an.");
      check("reach", !reach ? "Wie erreichen wir Sie? Telefonnummer oder E-Mail-Adresse genügt." :
        /@/.test(reach) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reach) ? "Die E-Mail-Adresse scheint unvollständig. Bitte prüfen Sie sie." :
        !/@/.test(reach) && reach.replace(/\D/g, "").length < 6 ? "Die Telefonnummer scheint zu kurz. Bitte prüfen Sie sie." : "");
      check("privacy", f.privacy.checked ? "" : "Bitte bestätigen Sie den Datenschutzhinweis.");
      if (!ok) { status.className = "form-status"; status.textContent = ""; first.focus(); return; }
      var body = "Name: " + f.name.value.trim() + "\nErreichbar unter: " + reach + "\nAnliegen: " + f.topic.value + "\n\n" + f.message.value.trim();
      window.location.href = "mailto:info@steuerberatung-koop.de?subject=" + encodeURIComponent("Anfrage über die Website: " + f.topic.value) + "&body=" + encodeURIComponent(body);
      status.className = "form-status ok";
      status.textContent = "Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. Bitte dort auf Senden klicken.";
    });
    ["name", "reach"].forEach(function (n) { form.elements[n].addEventListener("input", function () { if (this.closest(".field").hasAttribute("data-invalid")) setErr(n, ""); }); });
    form.elements.privacy.addEventListener("change", function () { if (this.checked) setErr("privacy", ""); });
  }
})();
