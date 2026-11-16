/* Koop Steuerberatung — kleine Helfer, ohne Fremdbibliotheken, ohne Tracking. */
(function () {
  "use strict";
  document.documentElement.classList.add("js");

  var DAY = 86400000;
  var monthsShort = ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."];
  var monthsLong = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  var weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

  function d(y, m, day) { return new Date(y, m, day, 12); }
  function key(dt) { return dt.getFullYear() + "-" + dt.getMonth() + "-" + dt.getDate(); }
  function addDays(dt, n) { return new Date(dt.getTime() + n * DAY); }

  function easter(y) {
    var a = y % 19, b = Math.floor(y / 100), c = y % 100, e = Math.floor(b / 4), f = b % 4;
    var g = Math.floor((b + 8) / 25), h = Math.floor((b - g + 1) / 3);
    var i = (19 * a + b - e - h + 15) % 30, k = Math.floor(c / 4), l = c % 4;
    var m = (32 + 2 * f + 2 * k - i - l) % 7, n = Math.floor((a + 11 * i + 22 * m) / 451);
    var month = Math.floor((i + m - 7 * n + 114) / 31) - 1, day = ((i + m - 7 * n + 114) % 31) + 1;
    return d(y, month, day);
  }

  // Bundesweite Feiertage
  function nationalHolidays(y) {
    var e = easter(y);
    return [d(y, 0, 1), addDays(e, -2), addDays(e, 1), d(y, 4, 1), addDays(e, 39), addDays(e, 50), d(y, 9, 3), d(y, 11, 25), d(y, 11, 26)];
  }
  // Mecklenburg-Vorpommern: zusätzlich Frauentag (8.3.) und Reformationstag (31.10.)
  var cacheMV = {}, cacheBank = {};
  function holidaysMV(y) {
    if (!cacheMV[y]) {
      cacheMV[y] = {};
      nationalHolidays(y).concat([d(y, 2, 8), d(y, 9, 31)]).forEach(function (x) { cacheMV[y][key(x)] = 1; });
    }
    return cacheMV[y];
  }
  // Bankarbeitstage: bundesweite Feiertage, dazu 24. und 31.12.
  function bankHolidays(y) {
    if (!cacheBank[y]) {
      cacheBank[y] = {};
      nationalHolidays(y).concat([d(y, 11, 24), d(y, 11, 31)]).forEach(function (x) { cacheBank[y][key(x)] = 1; });
    }
    return cacheBank[y];
  }
  function isWorkdayMV(dt) { var w = dt.getDay(); return w !== 0 && w !== 6 && !holidaysMV(dt.getFullYear())[key(dt)]; }
  function isBankday(dt) { var w = dt.getDay(); return w !== 0 && w !== 6 && !bankHolidays(dt.getFullYear())[key(dt)]; }

  // § 108 Abs. 3 AO: fällt das Fristende auf Wochenende/Feiertag, gilt der nächste Werktag
  function shift(dt) { while (!isWorkdayMV(dt)) dt = addDays(dt, 1); return dt; }
  // drittletzter Bankarbeitstag des Monats (Sozialversicherungsbeiträge)
  function thirdLastBankday(y, m) {
    var dt = d(y, m + 1, 0), n = 0;
    while (true) { if (isBankday(dt)) { n++; if (n === 3) return dt; } dt = addDays(dt, -1); }
  }

  function deadlines(today) {
    var list = [], y0 = today.getFullYear(), m0 = today.getMonth();
    for (var i = 0; i < 5; i++) {
      var y = y0 + Math.floor((m0 + i) / 12), m = (m0 + i) % 12;
      list.push({ date: shift(d(y, m, 10)), what: "Umsatzsteuer-Voranmeldung, Lohnsteuer-Anmeldung" });
      list.push({ date: thirdLastBankday(y, m), what: "Sozialversicherungsbeiträge" });
      if (m === 2 || m === 5 || m === 8 || m === 11) list.push({ date: shift(d(y, m, 10)), what: "Vorauszahlung Einkommen- und Körperschaftsteuer" });
      if (m === 1 || m === 4 || m === 7 || m === 10) list.push({ date: shift(d(y, m, 15)), what: "Vorauszahlung Gewerbe- und Grundsteuer" });
    }
    var start = d(y0, m0, today.getDate());
    list = list.filter(function (x) { return x.date >= start; }).sort(function (a, b) { return a.date - b.date; });
    // Termine am selben Tag zusammenfassen
    var out = [];
    list.forEach(function (x) {
      var last = out[out.length - 1];
      if (last && key(last.date) === key(x.date)) last.parts.push(x.what);
      else out.push({ date: x.date, parts: [x.what] });
    });
    return out.slice(0, 4);
  }

  function fmtShort(dt) { return dt.getDate() + ". " + monthsShort[dt.getMonth()]; }
  function fmtLong(dt) { return dt.getDate() + ". " + monthsLong[dt.getMonth()] + " " + dt.getFullYear(); }
  function inDays(n) { return n === 0 ? "heute" : n === 1 ? "morgen" : "in " + n + " Tagen"; }

  var now = new Date();
  var today = d(now.getFullYear(), now.getMonth(), now.getDate());

  var slip = document.querySelector("[data-deadlines]");
  if (slip) {
    var html = "";
    deadlines(today).forEach(function (x) {
      var n = Math.round((x.date - today) / DAY);
      html += '<li class="' + (n <= 7 ? "is-soon" : "") + '"><time class="slip-date tnum" datetime="' + x.date.toISOString().slice(0, 10) + '">' + fmtShort(x.date) + '</time><span class="slip-what">' + x.parts.map(function (s) { return "<span>" + s + "</span>"; }).join("") + '</span><span class="slip-in tnum">' + inDays(n) + "</span></li>";
    });
    slip.innerHTML = html;
    var t = document.querySelector("[data-today]");
    if (t) t.textContent = "Stand: " + weekdays[now.getDay()] + ", " + fmtShort(today);
  }

  // Abgabefrist Steuererklärung mit Beratung: letzter Februartag des übernächsten Jahres (§ 149 Abs. 3 AO)
  var note = document.querySelector("[data-return-deadline]");
  if (note) {
    // ältestes Jahr, dessen Frist noch läuft
    var vz = today.getFullYear() - 2;
    var due = shift(d(vz + 2, 2, 0));
    if (due < today) { vz += 1; due = shift(d(vz + 2, 2, 0)); }
    note.innerHTML = "Steuererklärung " + vz + " noch offen? Mit uns gilt als Abgabefrist der <strong>" + fmtLong(due) + "</strong>.";
  }

  // Bürozeiten: Mo–Do 9–16, Fr 9–13
  var openEl = document.querySelector("[data-open]");
  if (openEl) {
    var wd = now.getDay(), mins = now.getHours() * 60 + now.getMinutes();
    var close = wd >= 1 && wd <= 4 ? 16 * 60 : wd === 5 ? 13 * 60 : 0;
    var label = openEl.querySelector("span:last-child");
    if (close && isWorkdayMV(today) && mins >= 9 * 60 && mins < close) {
      openEl.classList.add("is-open");
      label.textContent = "Jetzt im Büro erreichbar, heute bis " + close / 60 + " Uhr";
    } else {
      var next = addDays(today, mins < 9 * 60 ? 0 : 1);
      while (!(next.getDay() >= 1 && next.getDay() <= 5 && isWorkdayMV(next))) next = addDays(next, 1);
      var when = key(next) === key(today) ? "heute" : key(next) === key(addDays(today, 1)) ? "morgen" : weekdays[next.getDay()];
      label.textContent = "Gerade geschlossen. Wieder erreichbar " + when + " ab 9 Uhr";
    }
  }

  // Header-Linie beim Scrollen
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Menü (mobil)
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("nav");
  function setMenu(open) {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
    toggle.querySelector("use").setAttribute("href", open ? "#i-x" : "#i-menu");
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("menu-open", open);
  }
  if (toggle) {
    toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { setMenu(false); toggle.focus(); } });
    window.matchMedia("(min-width: 861px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });
  }

  // Aktiver Menüpunkt
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  if ("IntersectionObserver" in window && links.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) links.forEach(function (a) { a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + en.target.id); if (a.hasAttribute("aria-current")) a.setAttribute("aria-current", "true"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });
  }

  // Der eine Moment: Satz im Bau-Abschnitt füllt sich Wort für Wort, während man ihn liest
  var statement = document.querySelector("[data-words]");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (statement) {
    var parts = statement.textContent.trim().split(/\s+/);
    statement.innerHTML = parts.map(function (w) { return '<span class="w">' + w + "</span>"; }).join(" ");
    var words = statement.querySelectorAll(".w");
    if (reduce) { words.forEach(function (w) { w.classList.add("on"); }); }
    else {
      var ticking = false;
      var update = function () {
        ticking = false;
        var r = statement.getBoundingClientRect(), vh = window.innerHeight;
        var p = (vh * 0.85 - r.top) / (vh * 0.5 + r.height * 0.5);
        p = Math.max(0, Math.min(1, p));
        var lit = Math.round(p * words.length);
        for (var i = 0; i < words.length; i++) words[i].classList.toggle("on", i < lit);
      };
      window.addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener("resize", update);
      update();
    }
  }

  // Kontaktformular: prüft Felder und öffnet eine fertige E-Mail im eigenen Programm.
  // Hinweis für den Livebetrieb: kann durch ein serverseitiges Formular (z. B. PHP beim Hoster) ersetzt werden.
  var form = document.querySelector("[data-contact-form]");
  if (form) {
    var status = form.querySelector(".form-status");
    function setError(name, msg) {
      var field = form.querySelector('[name="' + name + '"]').closest(".field, .check-wrap");
      var err = field.querySelector(".field-error");
      if (msg) { field.setAttribute("data-invalid", ""); err.textContent = msg; }
      else { field.removeAttribute("data-invalid"); err.textContent = ""; }
      form.querySelector('[name="' + name + '"]').setAttribute("aria-invalid", msg ? "true" : "false");
      return !msg;
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      var ok = true, first = null;
      function check(name, msg) { var r = setError(name, msg); if (!r && !first) first = f[name]; ok = ok && r; }
      check("name", f.name.value.trim() ? "" : "Bitte geben Sie Ihren Namen an.");
      var reach = f.reach.value.trim();
      check("reach", !reach ? "Wie erreichen wir Sie? Telefonnummer oder E-Mail-Adresse genügt." : (/@/.test(reach) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reach)) ? "Die E-Mail-Adresse scheint unvollständig. Bitte prüfen Sie sie." : (!/@/.test(reach) && reach.replace(/\D/g, "").length < 6) ? "Die Telefonnummer scheint zu kurz. Bitte prüfen Sie sie." : "");
      check("privacy", f.privacy.checked ? "" : "Bitte bestätigen Sie den Datenschutzhinweis.");
      if (!ok) { status.className = "form-status"; status.textContent = ""; first.focus(); return; }
      var body = "Name: " + f.name.value.trim() + "\nErreichbar unter: " + reach + "\nAnliegen: " + f.topic.value + "\n\n" + f.message.value.trim();
      var href = "mailto:info@steuerberatung-koop.de?subject=" + encodeURIComponent("Anfrage über die Website: " + f.topic.value) + "&body=" + encodeURIComponent(body);
      window.location.href = href;
      status.className = "form-status ok";
      status.textContent = "Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. Bitte dort auf Senden klicken.";
    });
    ["name", "reach"].forEach(function (n) { form.elements[n].addEventListener("input", function () { if (this.closest(".field").hasAttribute("data-invalid")) setError(n, ""); }); });
    form.elements.privacy.addEventListener("change", function () { if (this.checked) setError("privacy", ""); });
  }
})();
