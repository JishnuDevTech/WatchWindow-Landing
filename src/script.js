lucide.createIcons();

if (window.gsap && window.ScrollTrigger) {
  gsap.registerPlugin(ScrollTrigger);
  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    // Hero: one orchestrated entrance.
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .from(".hl", { yPercent: 110, duration: 1.1, stagger: 0.12 })
      .from(".hero-sub", { opacity: 0, y: 20, duration: 0.8 }, "-=0.4");

    // Problem: each line comes into focus as it reaches the reader's eye line.
    gsap.utils.toArray(".q").forEach((q) =>
      gsap.fromTo(q, { opacity: 0.15 }, {
        opacity: 1, ease: "none",
        scrollTrigger: { trigger: q, start: "top 80%", end: "top 50%", scrub: true },
      })
    );

    // Schedule scene: scroll drives the booking. State (captions, conflict colour) follows progress.
    const board = document.getElementById("board");
    gsap.set("#maya", { opacity: 0, y: -40, xPercent: -25 });
    gsap.set(["#kabir", "#dad", "#free"], { opacity: 0 });
    board.dataset.step = "0";

    gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: {
        trigger: "#how", start: "top top", end: "+=220%", pin: true, scrub: 0.6,
        onUpdate: (st) => { board.dataset.step = st.progress < 0.33 ? 0 : st.progress < 0.66 ? 1 : 2; },
      },
    })
      .to(["#kabir", "#dad"], { opacity: 1, stagger: 0.3, duration: 0.5 })
      .to("#maya", { opacity: 1, y: 0, duration: 0.8 }, 1)
      .to("#maya", { xPercent: 0, duration: 0.8 }, 2)
      .to("#free", { opacity: 1, duration: 0.4 }, 2.6)
      .to({}, { duration: 0.3 });

    // Ecosystem: the rail fills left to right, lighting each stage.
    const nodes = gsap.utils.toArray("#eco .node");
    nodes.forEach((n) => n.classList.remove("on"));
    gsap.set(".rail", { "--p": 0 });
    ScrollTrigger.create({
      trigger: "#eco", start: "top 70%", end: "bottom 60%", scrub: true,
      onUpdate: (st) => {
        gsap.set(".rail", { "--p": st.progress });
        nodes.forEach((n, i) => n.classList.toggle("on", st.progress >= i / nodes.length + 0.02));
      },
    });
  });
}

// Fill these in; empty values hide their links.
const SITE = { app: "/app", github: "", linkedin: "", email: "" };
document.querySelectorAll("[data-cfg]").forEach((el) => {
  const v = SITE[el.dataset.cfg];
  if (!v) return el.closest("li")?.remove() ?? el.remove();
  el.href = el.dataset.cfg === "email" ? "mailto:" + v : v;
});

const nav = document.getElementById("nav"), menu = document.getElementById("menu"), btn = document.getElementById("menuBtn");
addEventListener("scroll", () => nav.classList.toggle("scrolled", scrollY > 40), { passive: true });
btn.addEventListener("click", () => { const o = menu.hidden; menu.hidden = !o; btn.setAttribute("aria-expanded", o); });
menu.addEventListener("click", () => { menu.hidden = true; btn.setAttribute("aria-expanded", false); });

// Hero status updates
const status = document.getElementById("statusText"), msgs = ["Free at 10:30 PM", "Dad's match until 8:30", "Maya's movie until 10:30"];
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  let i = 0;
  setInterval(() => { status.style.opacity = 0; setTimeout(() => { status.textContent = msgs[++i % msgs.length]; status.style.opacity = 1; }, 300); }, 4500);
}

// Interactive demo: first free gap tonight starts at 8:30 PM and ends at 11 PM.
const sel = { who: "Maya", what: "Movie", dur: 2 }, dNew = document.getElementById("dNew"), out = document.getElementById("demoOut"), rsv = document.getElementById("reserve");
const fmt = (h) => { const m = h % 1 ? "30" : "00", x = Math.floor(h) % 12 || 12; return `${x}:${m} ${h >= 12 && h < 24 ? "PM" : "AM"}`; };
function renderDemo(locked) {
  const start = 20.5, end = start + sel.dur, ok = end <= 23;
  dNew.style.opacity = ok ? 1 : 0; rsv.disabled = !ok || locked;
  dNew.style.width = sel.dur * 20 + "%";
  document.getElementById("dNewT").textContent = `${sel.who} · ${sel.what}`;
  document.getElementById("dNewS").textContent = `${fmt(start)} – ${fmt(end)}`;
  dNew.style.background = locked ? "rgb(255 194 75 / .35)" : "";
  out.textContent = !ok ? `No ${sel.dur}-hour window tonight. Try a shorter one.` : locked ? "Reserved. Everyone can see it." : `${fmt(start)} – ${fmt(end)}`;
  rsv.textContent = locked ? "Reserved" : "Reserve this window";
}
document.getElementById("demoControls").addEventListener("click", (e) => {
  const c = e.target.closest(".chip"); if (!c) return;
  c.parentElement.querySelectorAll(".chip").forEach((x) => x.setAttribute("aria-pressed", x === c));
  sel[c.dataset.k] = c.dataset.k === "dur" ? +c.dataset.v : c.textContent;
  renderDemo(false);
});
rsv.addEventListener("click", () => renderDemo(true));

if (window.gsap && window.ScrollTrigger) {
  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    // Chaos sorts itself out as you scroll.
    const label = document.getElementById("chaosState");
    gsap.timeline({ scrollTrigger: { trigger: "#chaos", start: "top 30%", end: "+=70%", scrub: true,
      onUpdate: (st) => { const r = st.progress > 0.5; label.textContent = r ? "One shared window." : "Nobody's sure."; label.className = r ? "text-glow" : "text-clash"; } } })
      .to("#cDad", { y: 0, borderColor: "#6fa8ff" }, 0).to("#cMaya", { y: 90, borderColor: "#ffc24b" }, 0).to("#cKabir", { y: 180, borderColor: "#6fa8ff" }, 0);

    gsap.from(".step", { opacity: 0, y: 30, stagger: 0.15, duration: 0.8, scrollTrigger: { trigger: "#steps", start: "top 70%" } });
    gsap.from(".ask", { opacity: 0, x: -30, stagger: 0.25, duration: 0.8, scrollTrigger: { trigger: "#ask", start: "top 60%" } });
  });
}

// Cinematic layer: inertial scroll, sections that lift over each other, tilted panels, horizontal steps.
if (window.gsap && window.ScrollTrigger) {
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches && window.Lenis) {
    const lenis = new Lenis({ lerp: 0.09, anchors: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  const $ = (s) => document.querySelector(s), id = (s) => document.getElementById(s);

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
    const bar = document.createElement("div");
    bar.style.cssText = "position:fixed;left:0;right:0;top:0;height:3px;background:#ffc24b;transform-origin:0 50%;z-index:60";
    document.body.append(bar);
    gsap.fromTo(bar, { scaleX: 0 }, { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: true } });

    // Hero recedes as the page rises over it.
    gsap.to("#top h1", { scale: 0.82, opacity: 0.1, y: -60, transformOrigin: "0 0", ease: "none",
      scrollTrigger: { trigger: "#top", start: "top top", end: "bottom top", scrub: true } });

    // Sections lift: the next one slides up over a pinned, receding section.
    ["chaos", "ecosystem", "ask", "vision", "try"].forEach((s) => id(s).classList.add("lift"));
    ["story", "family", "ecosystem", "ask", "vision"].forEach((s) => {
      const el = id(s), end = () => "+=" + innerHeight;
      ScrollTrigger.create({ trigger: el, start: "bottom bottom", end, pin: true, pinSpacing: false });
      gsap.to(el, { scale: 0.92, opacity: 0.35, transformOrigin: "50% 100%", ease: "none",
        scrollTrigger: { trigger: el, start: "bottom bottom", end, scrub: true } });
    });

    // Product panels tilt up into place like a lifted screen.
    [["#board > .rounded-3xl", "#how"], ["#demo .self-start", "#demo"]].forEach(([sel, tr]) =>
      gsap.fromTo(sel, { rotateX: 32, scale: 0.82, y: 100, transformPerspective: 1200, transformOrigin: "50% 100%" },
        { rotateX: 0, scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: tr, start: "top bottom", end: "top 20%", scrub: true } }));

    gsap.fromTo("#family h2", { scale: 1.3, transformOrigin: "0 50%" }, { scale: 1, ease: "none",
      scrollTrigger: { trigger: "#family", start: "top bottom", end: "top 30%", scrub: true } });
    gsap.from("#family .space-y-3 > div > div", { clipPath: "inset(0 100% 0 0)", stagger: 0.2, ease: "none",
      scrollTrigger: { trigger: "#family .space-y-3", start: "top 85%", end: "top 40%", scrub: true } });

    id("try").style.overflow = "hidden";
    gsap.fromTo("#try h2", { xPercent: 18 }, { xPercent: 0, ease: "none",
      scrollTrigger: { trigger: "#try", start: "top bottom", end: "top 25%", scrub: true } });
    return () => bar.remove();
  });

  // Desktop: the three steps travel sideways while the page holds still.
  gsap.matchMedia().add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
    const sec = id("steps"), wrap = sec.firstElementChild, ol = sec.querySelector("ol"), lis = ol.querySelectorAll("li");
    Object.assign(sec.style, { overflow: "hidden", display: "flex", alignItems: "center", minHeight: "100svh" });
    wrap.style.width = "100%";
    Object.assign(ol.style, { display: "flex", gap: "8vw", width: "max-content" });
    lis.forEach((li) => (li.style.width = "min(44vw, 36rem)"));
    gsap.to(ol, { x: () => -(ol.scrollWidth - wrap.clientWidth), ease: "none",
      scrollTrigger: { trigger: sec, pin: true, start: "top top", end: () => "+=" + ol.scrollWidth, scrub: 0.6, invalidateOnRefresh: true } });
    return () => { [sec, ol, wrap, ...lis].forEach((e) => e.removeAttribute("style")); };
  });

  addEventListener("load", () => { ScrollTrigger.sort(); ScrollTrigger.refresh(); });
}