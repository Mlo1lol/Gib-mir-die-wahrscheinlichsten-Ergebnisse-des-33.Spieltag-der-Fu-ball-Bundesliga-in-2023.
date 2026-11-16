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

  /* =====================================================================
     Version 3: Steuerjahr, Vorspann, Zeilen-Masken, Kapitel, Lenis, Magnet
     ===================================================================== */
  var G = window.gsap, ST = window.ScrollTrigger, SPLIT = window.SplitText, LENIS = window.Lenis;
  var hasG = !!(G && ST);
  if (hasG) G.registerPlugin(ST); if (hasG && SPLIT) G.registerPlugin(SPLIT);
  var desktop = window.matchMedia("(min-width: 901px)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- Steuerjahr ---------- */
  var monthNames = mLong;
  function yearEvents(pr, from) {
    var ev = [], y0 = from.getFullYear(), m0 = from.getMonth();
    function push(date, what, note, k) { ev.push({ date: date, what: what, note: note || "", k: k || "" }); }
    for (var i = 0; i < 12; i++) {
      var y = y0 + Math.floor((m0 + i) / 12), m = (m0 + i) % 12;
      var biz = pr.form !== "privat";
      if (biz && (!pr.quarterly || m % 3 === 0)) push(shift(d(y, m, 10)), "Umsatzsteuer-Voranmeldung", pr.quarterly ? "für das abgelaufene Quartal" : "für den Vormonat", "ust");
      if (biz && pr.staff) {
        push(shift(d(y, m, 10)), "Lohnsteuer-Anmeldung", "für den Vormonat", "lst");
        push(thirdLastBank(y, m), "Sozialversicherungsbeiträge", "drittletzter Bankarbeitstag", "sv");
      }
      if (m % 3 === 2) {
        if (pr.form === "gmbh") push(shift(d(y, m, 10)), "Körperschaftsteuer-Vorauszahlung", "mit Solidaritätszuschlag", "vz");
        else push(shift(d(y, m, 10)), "Einkommensteuer-Vorauszahlung", "falls festgesetzt", "vz");
      }
      if ((pr.form === "gmbh" || pr.form === "gewerbe") && m % 3 === 1) push(shift(d(y, m, 15)), "Gewerbesteuer-Vorauszahlung", "an die Gemeinde", "vz");
      if (m === 1 || m === 2) {
        var due = shift(d(y, 2, 0));
        if (due.getMonth() === m) push(due, "Abgabe Steuererklärungen " + (y - 2), "mit Steuerberater", "erkl");
      }
      if (pr.form === "gmbh" && m === 11) push(d(y, 11, 31), "Offenlegung Jahresabschluss " + (y - 1), "im Unternehmensregister", "hgb");
    }
    return ev.sort(function (a, b) { return a.date - b.date || a.what.localeCompare(b.what); });
  }

  var yearEl = document.querySelector("[data-year]"), profileForm = document.querySelector("[data-profile]");
  var totalEl = document.querySelector("[data-total]"), totalWord = document.querySelector("[data-total-word]");
  var shownTotal = 0;
  function readProfile() {
    var f = profileForm.elements;
    return { form: f.form.value, staff: f.staff.checked, quarterly: f.quarterly.checked };
  }
  function renderYear(animate) {
    if (!yearEl) return;
    var pr = readProfile();
    var privat = pr.form === "privat";
    profileForm.querySelectorAll(".switch").forEach(function (s) { s.classList.toggle("is-off", privat); s.querySelector("input").disabled = privat; });
    var start = d(today.getFullYear(), today.getMonth(), 1);
    var evs = yearEvents(pr, start), html = "", upcoming = 0;
    for (var i = 0; i < 12; i++) {
      var y = start.getFullYear() + Math.floor((start.getMonth() + i) / 12), m = (start.getMonth() + i) % 12;
      var items = evs.filter(function (e) { return e.date.getFullYear() === y && e.date.getMonth() === m; });
      html += '<li class="month' + (i === 0 ? " is-now" : "") + '"><div class="month-head"><h3>' + monthNames[m] + "</h3><small>" + (i === 0 ? "jetzt" : y) + "</small></div>";
      if (items.length) {
        html += "<ul>" + items.map(function (e) {
          var past = e.date < today; if (!past) upcoming++;
          return '<li class="ev' + (past ? " is-past" : "") + '" data-k="' + e.k + '"><span class="ev-day tnum">' + e.date.getDate() + '.</span><span class="ev-what">' + e.what + "<small>" + e.note + "</small></span></li>";
        }).join("") + "</ul>";
      } else html += '<p class="month-empty">Keine festen Termine.</p>';
      html += "</li>";
    }
    var paint = function () {
      yearEl.innerHTML = html;
      if (hasG && animate && !reduce) G.from(yearEl.querySelectorAll(".ev, .month-empty"), { y: 14, opacity: 0, duration: 0.6, ease: "expo.out", stagger: 0.012 });
      if (hasG) ST.refresh();
    };
    if (hasG && animate && !reduce) G.to(yearEl.querySelectorAll(".ev, .month-empty"), { opacity: 0, y: -8, duration: 0.18, ease: "power1.in", onComplete: paint }); else paint();
    if (totalWord) totalWord.textContent = upcoming === 1 ? "Termin" : "Termine";
    if (hasG && !reduce) { var o = { v: shownTotal }; G.to(o, { v: upcoming, duration: 0.9, ease: "expo.out", onUpdate: function () { totalEl.textContent = Math.round(o.v); } }); }
    else totalEl.textContent = upcoming;
    shownTotal = upcoming;
  }
  if (profileForm) { profileForm.addEventListener("change", function () { renderYear(true); }); renderYear(false); }

  /* ---------- Weiches Scrollen (Lenis), nur Maus/Trackpad ---------- */
  var lenis = null;
  if (hasG && LENIS && !reduce) {
    lenis = new LENIS({ lerp: 0.1, anchors: { offset: -60 }, autoRaf: false });
    lenis.on("scroll", ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
  }

  /* ---------- Vorspann ---------- */
  var loader = document.querySelector(".loader");
  function playHero() {
    root.classList.remove("is-loading");
  }
  if (loader && !root.classList.contains("no-intro") && hasG) {
    root.classList.add("is-loading");
    if (lenis) lenis.stop();
    G.timeline({ defaults: { ease: "expo.out" }, onComplete: function () { loader.remove(); if (lenis) lenis.start(); try { sessionStorage.setItem("koop-intro", "1"); } catch (e) {} } })
      .from(".loader-mark span", { yPercent: 110, duration: 0.9, stagger: 0.05 })
      .to(".loader-line i", { scaleX: 1, duration: 0.8, ease: "power2.inOut" }, 0.15)
      .to(".loader-mark span", { yPercent: -110, duration: 0.6, stagger: 0.03, ease: "expo.in" }, 1.0)
      .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut", onStart: playHero }, 1.35);
  } else if (loader) loader.remove();

  /* ---------- Überschriften schälen sich zeilenweise aus Masken ---------- */
  if (hasG && SPLIT && !reduce) {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      SPLIT.create(el, {
        type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true,
        onSplit: function (self) {
          return G.from(self.lines, { yPercent: 105, duration: 1.15, ease: "expo.out", stagger: 0.09,
            scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        }
      });
    });
  }

  /* ---------- Gepinnte Kapitel: Leistungen und Steuerjahr laufen seitwärts ---------- */
  if (hasG && !reduce) {
    var mm = G.matchMedia();
    mm.add("(min-width: 901px)", function () {
      var track = document.querySelector(".h-track"), sec = document.querySelector(".hscroll");
      if (track && sec) {
        G.to(track, { x: function () { return -(track.scrollWidth - window.innerWidth); }, ease: "none",
          scrollTrigger: { trigger: sec, start: "top top", end: function () { return "+=" + (track.scrollWidth - window.innerWidth); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } });
      }
      var ytrack = document.querySelector(".year-track"), ypin = document.querySelector(".year-pin"), bar = document.querySelector(".year-progress span");
      if (ytrack && ypin) {
        var dist = function () { return Math.max(0, ytrack.scrollWidth - window.innerWidth); };
        G.timeline({ scrollTrigger: { trigger: ypin, start: "center center", end: function () { return "+=" + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1 } })
          .to(ytrack, { x: function () { return -dist(); }, ease: "none" }, 0)
          .to(bar, { scaleX: 1, ease: "none" }, 0);
      }
    });
  }

  /* ---------- Magnetische Buttons ---------- */
  if (hasG && finePointer && !reduce) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var xTo = G.quickTo(el, "x", { duration: 0.6, ease: "expo.out" }), yTo = G.quickTo(el, "y", { duration: 0.6, ease: "expo.out" });
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width / 2)) * 0.28); yTo((e.clientY - (r.top + r.height / 2)) * 0.38);
      });
      el.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }

  if (hasG) { window.addEventListener("load", function () { ST.refresh(); }); }
})();
