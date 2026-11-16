/* Rechtsanwalt Tietmann — Bewegungsebene. GSAP, ScrollTrigger, SplitText und Lenis, selbst gehostet.
   Fällt eine Bibliothek aus, bleibt die Seite vollständig sichtbar und bedienbar. */
(function () {
  "use strict";
  var G = window.gsap, ST = window.ScrollTrigger, SPLIT = window.SplitText, LENIS = window.Lenis;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var DAY = 864e5;

  /* ---------- Fristring: verbleibende Tage der Klagefrist ---------- */
  var ringWrap = document.getElementById("ring"), fg = ringWrap && ringWrap.querySelector(".rfg");
  var ringN = document.getElementById("ring-n"), ringL = document.getElementById("ring-l");
  var C = 2 * Math.PI * 52, shown = 0;
  window.__ring = function (str) {
    if (!ringWrap) return;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (!str || str > today.toLocaleDateString("sv-SE")) { ringWrap.hidden = true; return; }
    var p = str.split("-").map(Number), start = new Date(p[0], p[1] - 1, p[2]);
    var end = deadline(str), total = Math.max(1, Math.round((end - start) / DAY)), left = daysLeft(end);
    var frac = Math.max(0, Math.min(1, left / total));
    ringWrap.hidden = false;
    ringWrap.classList.toggle("urgent", left < 7);
    ringL.textContent = left < 0 ? "Frist abgelaufen" : left === 1 ? "Tag verbleibt" : "Tage verbleiben";
    var target = Math.max(0, left);
    if (G && !reduce) {
      G.to(fg, { strokeDashoffset: C * (1 - frac), duration: 1.1, ease: "expo.out" });
      var o = { v: shown };
      G.to(o, { v: target, duration: 1.1, ease: "expo.out", onUpdate: function () { ringN.textContent = Math.round(o.v); } });
    } else { fg.style.strokeDashoffset = C * (1 - frac); ringN.textContent = target; }
    shown = target;
  };

  if (!G || !ST) return;
  G.registerPlugin(ST); if (SPLIT) G.registerPlugin(SPLIT);

  /* ---------- Lesefortschritt ---------- */
  G.to(".readbar", { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: 0.3 } });

  if (reduce) return;

  /* ---------- Weiches Scrollen ---------- */
  if (LENIS) {
    var lenis = new LENIS({ lerp: 0.1, anchors: { offset: -110 }, autoRaf: false });
    lenis.on("scroll", ST.update);
    G.ticker.add(function (t) { lenis.raf(t * 1000); });
    G.ticker.lagSmoothing(0);
    // Rechtsgebiet-Leiste der Waage: gleiche Zielposition wie im Entwurf, aber über Lenis angesteuert
    var story = document.getElementById("story"), nCards = document.querySelectorAll(".scard").length;
    document.querySelectorAll(".rail button").forEach(function (b) {
      b.addEventListener("click", function (e) {
        e.stopImmediatePropagation();
        var k = +b.dataset.step, total = story.offsetHeight - window.innerHeight;
        lenis.scrollTo(story.offsetTop + total * ((k + 0.75) / nCards), { duration: 1.4 });
      }, true);
    });
  }

  /* ---------- Überschriften aus Zeilen-Masken ---------- */
  if (SPLIT) {
    document.querySelectorAll("[data-split]").forEach(function (el) {
      SPLIT.create(el, {
        type: "lines", mask: "lines", linesClass: "split-line", autoSplit: true,
        onSplit: function (self) {
          return G.from(self.lines, { yPercent: 108, duration: 1.15, ease: "expo.out", stagger: 0.09, scrollTrigger: { trigger: el, start: "top 88%", once: true } });
        }
      });
    });
  }

  /* ---------- Inhalte gleiten gestaffelt herein ---------- */
  var groups = [".checks li", ".aud", ".facts li", ".creds", "details", ".cinfo dl > *", ".slot", "#f", ".lead", ".deadline", ".about .portrait"];
  groups.forEach(function (sel) {
    var els = document.querySelectorAll(sel);
    if (!els.length) return;
    G.set(els, { opacity: 0, y: 28 });
    ST.batch(els, { start: "top 90%", once: true, onEnter: function (b) { G.to(b, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08, overwrite: true }); } });
  });
  // Sicherung: nichts bleibt versteckt, falls ein Trigger nicht feuert
  window.addEventListener("load", function () { setTimeout(function () { ST.refresh(); }, 50); });

  /* ---------- Ablauf: Linie füllt sich, Schritte leuchten auf ---------- */
  var steps = document.querySelectorAll(".steps li");
  if (steps.length) {
    G.set(steps, { opacity: 0.35 });
    G.to(".steps-line", {
      scaleX: 1, ease: "none",
      scrollTrigger: { trigger: ".steps", start: "top 80%", end: "bottom 45%", scrub: 0.6,
        onUpdate: function (self) { steps.forEach(function (s, i) { G.to(s, { opacity: self.progress >= i / steps.length * 0.92 + 0.02 ? 1 : 0.35, duration: 0.4, overwrite: "auto" }); }); } }
    });
  }

  /* ---------- Kosten: obere Karte tritt zurück, wenn die nächste kommt ---------- */
  G.matchMedia().add("(min-width: 901px)", function () {
    var cards = G.utils.toArray(".cost");
    cards.forEach(function (c, i) {
      var next = cards[i + 1]; if (!next) return;
      var st = { trigger: next, start: "top 85%", end: "top 30%", scrub: true };
      G.to(c, { scale: 0.94, filter: "brightness(0.94)", ease: "none", scrollTrigger: st });
      G.to(c.children, { opacity: 0.2, ease: "none", scrollTrigger: { trigger: next, start: "top 85%", end: "top 30%", scrub: true } });
    });
  });

  /* ---------- FAQ öffnet sich weich ---------- */
  document.querySelectorAll("details").forEach(function (d) {
    var sum = d.querySelector("summary"), body = d.querySelector("p");
    sum.addEventListener("click", function (e) {
      e.preventDefault();
      if (d.open) {
        G.to(body, { height: 0, opacity: 0, duration: 0.4, ease: "power3.inOut", onComplete: function () { d.open = false; G.set(body, { clearProps: "all" }); ST.refresh(); } });
      } else {
        d.open = true;
        G.from(body, { height: 0, opacity: 0, duration: 0.55, ease: "expo.out", onComplete: function () { G.set(body, { clearProps: "height" }); ST.refresh(); } });
      }
    });
  });

  /* ---------- Fuß-Wortmarke steigt auf ---------- */
  G.from(".foot-mark span", { yPercent: 60, ease: "none", scrollTrigger: { trigger: "footer", start: "top bottom", end: "top 40%", scrub: 0.6 } });

  /* ---------- Magnetische Buttons ---------- */
  if (fine) {
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var xTo = G.quickTo(el, "x", { duration: 0.6, ease: "expo.out" }), yTo = G.quickTo(el, "y", { duration: 0.6, ease: "expo.out" });
      el.addEventListener("pointermove", function (e) { var r = el.getBoundingClientRect(); xTo((e.clientX - r.left - r.width / 2) * 0.25); yTo((e.clientY - r.top - r.height / 2) * 0.35); });
      el.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }
})();
