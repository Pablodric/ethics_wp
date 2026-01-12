document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll(".step");
  const hoverBoxes = document.querySelectorAll(".hover-box");
  const progressBar = document.getElementById("bar");
  const navLinks = document.querySelectorAll(".navlinks a");

  // Scroll-to-top button (use existing one if present, else create)
  let scrollToTopBtn = document.querySelector(".scroll-to-top");
  if (!scrollToTopBtn) {
    scrollToTopBtn = document.createElement("button");
    scrollToTopBtn.textContent = "↑";
    scrollToTopBtn.classList.add("scroll-to-top");
    scrollToTopBtn.setAttribute("aria-label", "Scroll to top");
    document.body.appendChild(scrollToTopBtn);
  }

  // IMPORTANT: Let CSS handle styles (avoid inline blue mismatch)
  // Only control visibility
  scrollToTopBtn.style.display = "none";

  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // ===== Reveal + counters =====
  const revealEls = document.querySelectorAll(".reveal");
  const counterEls = document.querySelectorAll("[data-count]");

  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  function animateCount(el, target, duration = 900) {
    const startTime = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const val = Math.round(target * easeOutCubic(t));
      el.textContent = String(val);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const ioReveal = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in-view");

        // animate counters inside revealed block
        const countersInside = entry.target.querySelectorAll?.("[data-count]") || [];
        countersInside.forEach((c) => {
          if (c.dataset.done === "1") return;
          c.dataset.done = "1";
          animateCount(c, Number(c.dataset.count || "0"));
        });

        ioReveal.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => ioReveal.observe(el));

  // Safety: counters not wrapped in reveal
  const ioCounters = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.dataset.done === "1") return;
        el.dataset.done = "1";
        animateCount(el, Number(el.dataset.count || "0"));
        ioCounters.unobserve(el);
      });
    },
    { threshold: 0.4 }
  );

  counterEls.forEach((el) => {
    const parentReveal = el.closest(".reveal");
    if (!parentReveal) ioCounters.observe(el);
  });

  // ===== Scroll handlers (1 pass) =====
  function onScroll() {
    const vh = window.innerHeight;

    // Activate scrolly steps
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const inView = rect.top <= vh * 0.8 && rect.bottom >= 0;
      section.classList.toggle("active", inView);
    });

    // Activate hover-box glow when in viewport
    hoverBoxes.forEach((box) => {
      const rect = box.getBoundingClientRect();
      const inView = rect.top <= vh * 0.8 && rect.bottom >= 0;
      box.classList.toggle("active-hover", inView);
    });

    // Progress bar
    const totalHeight = document.documentElement.scrollHeight - vh;
    const scrolled = window.scrollY;
    const progress = totalHeight > 0 ? (scrolled / totalHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + "%";

    // Scroll-to-top visibility
    scrollToTopBtn.style.display = window.scrollY > 200 ? "block" : "none";

    // Optional: highlight nav for single-page anchors only
    // (if you use multipage links, keep them neutral)
    const hasAnchors = Array.from(navLinks).some(a => (a.getAttribute("href") || "").startsWith("#"));
    if (hasAnchors) {
      let currentSection = "";
      document.querySelectorAll("section").forEach((s) => {
        const r = s.getBoundingClientRect();
        if (r.top <= vh / 2 && r.bottom >= vh / 2) currentSection = s.id || "";
      });

      navLinks.forEach((link) => {
        const href = link.getAttribute("href") || "";
        link.style.color = href.includes(currentSection) ? "#00bcd4" : "#f0f0f0";
      });
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();
});
// ===== Project Deliverables: YouTube modal + Live Demo =====
(function () {
  const openBtn = document.getElementById("openVideo");
  const modal = document.getElementById("videoModal");
  const closeBackdrop = document.getElementById("closeVideo");
  const closeBtn = document.getElementById("closeVideoBtn");
  const ytFrame = document.getElementById("ytFrame");

  if (openBtn && modal) {
    const open = () => {
      modal.classList.add("show");
      modal.setAttribute("aria-hidden", "false");
    };

    const close = () => {
      modal.classList.remove("show");
      modal.setAttribute("aria-hidden", "true");
      // stop video playback by resetting src
      if (ytFrame) {
        const src = ytFrame.getAttribute("src");
        ytFrame.setAttribute("src", src);
      }
    };

    openBtn.addEventListener("click", open);
    closeBackdrop && closeBackdrop.addEventListener("click", close);
    closeBtn && closeBtn.addEventListener("click", close);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modal.classList.contains("show")) close();
    });
  }

  // Live demo (safe simulation)
  const input = document.getElementById("demoInput");
  const run = document.getElementById("runDemo");
  const clear = document.getElementById("clearDemo");
  const decision = document.getElementById("demoDecision");
  const reason = document.getElementById("demoReason");
  const next = document.getElementById("demoNext");

  function setResult(d, r, n) {
    if (decision) decision.textContent = d;
    if (reason) reason.textContent = r;
    if (next) next.textContent = n;
  }

  function triage(text) {
    const t = (text || "").toLowerCase();

    // Very simple heuristic rules (demo only)
    const highRisk = ["kill", "suicide", "self-harm", "rape", "weapon", "blood"];
    const harassment = ["idiot", "stupid", "hate you", "go die", "trash"];
    const privateData = ["address", "phone", "email", "passport", "credit card"];

    const hasHigh = highRisk.some(w => t.includes(w));
    const hasHarass = harassment.some(w => t.includes(w));
    const hasPrivacy = privateData.some(w => t.includes(w));

    if (!t.trim()) {
      return ["—", "Type a message first.", "—"];
    }

    if (hasHigh) {
      return ["Escalate", "Potential high-severity harm signal detected (demo heuristic).", "Escalate to protected review / higher safeguards"];
    }

    if (hasPrivacy) {
      return ["Escalate", "Possible sensitive personal data signal detected.", "Route to privacy-protected review"];
    }

    if (hasHarass) {
      return ["Auto-action", "Harassment-like language detected (low severity).", "Warn / throttle / remove (policy-dependent)"];
    }

    return ["Allow", "No clear risk signals detected.", "No action required"];
  }

  if (run && input) {
    run.addEventListener("click", () => {
      const [d, r, n] = triage(input.value);
      setResult(d, r, n);
    });
  }

  if (clear && input) {
    clear.addEventListener("click", () => {
      input.value = "";
      setResult("—", "—", "—");
      input.focus();
    });
  }
})();
// ===== Pulse Check (local demo) =====
(function () {
  const KEY = "pulse_votes_v1";
  const NOTE_KEY = "pulse_note_v1";

  const buttons = document.querySelectorAll(".pulseOption");
  const totalEl = document.getElementById("voteTotal");
  const topEl = document.getElementById("topChoice");

  const barWellbeing = document.getElementById("barWellbeing");
  const barFairness = document.getElementById("barFairness");
  const barSpeed = document.getElementById("barSpeed");

  const recEl = document.getElementById("pulseRecommendation");
  const goBtn = document.getElementById("pulseGoBtn");

  const noteInput = document.getElementById("pulseNoteInput");
  const saveNoteBtn = document.getElementById("savePulseNote");
  const clearNoteBtn = document.getElementById("clearPulseNote");
  const recentNoteEl = document.getElementById("pulseRecentNote");
  const refreshNoteBtn = document.getElementById("refreshPulseNote");

  if (!buttons.length) return; // not on this page

  function loadVotes() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {
        "Human wellbeing": 0,
        "Fairness & appeals": 0,
        "Speed & safety": 0
      };
    } catch {
      return { "Human wellbeing": 0, "Fairness & appeals": 0, "Speed & safety": 0 };
    }
  }

  function saveVotes(v) {
    localStorage.setItem(KEY, JSON.stringify(v));
  }

  function total(v) {
    return Object.values(v).reduce((a, b) => a + b, 0);
  }

  function topChoice(v) {
    const entries = Object.entries(v).sort((a, b) => b[1] - a[1]);
    return entries[0][1] === 0 ? "—" : entries[0][0];
  }

  function pct(v, choice) {
    const t = total(v);
    if (t === 0) return 0;
    return Math.round((v[choice] / t) * 100);
  }

  function render(v) {
    const t = total(v);
    totalEl && (totalEl.textContent = String(t));
    topEl && (topEl.textContent = topChoice(v));

    const pW = pct(v, "Human wellbeing");
    const pF = pct(v, "Fairness & appeals");
    const pS = pct(v, "Speed & safety");

    if (barWellbeing) barWellbeing.style.width = pW + "%";
    if (barFairness) barFairness.style.width = pF + "%";
    if (barSpeed) barSpeed.style.width = pS + "%";
  }

  function recommend(choice) {
    if (!recEl || !goBtn) return;

    if (choice === "Human wellbeing") {
      recEl.innerHTML = "<strong>You prioritize human wellbeing.</strong> Start with the Human Impact page to understand the psychological cost that AI should prevent.";
      goBtn.href = "human-impact.html";
    } else if (choice === "Fairness & appeals") {
      recEl.innerHTML = "<strong>You prioritize fairness and accountability.</strong> Go to Ethical Challenges to see the safeguards needed for legitimate moderation.";
      goBtn.href = "ethical-challenges.html";
    } else {
      recEl.innerHTML = "<strong>You prioritize speed and safety.</strong> Go to AI Benefits to see how triage and filtering can reduce exposure and response time.";
      goBtn.href = "ai-benefits.html";
    }
  }

  function select(choice) {
    buttons.forEach(b => b.classList.toggle("selected", b.dataset.choice === choice));
    recommend(choice);
  }

  // voting
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const choice = btn.dataset.choice;
      const v = loadVotes();
      v[choice] = (v[choice] || 0) + 1;
      saveVotes(v);
      render(v);
      select(choice);
    });
  });

  // notes
  function loadNote() {
    const n = localStorage.getItem(NOTE_KEY);
    if (recentNoteEl) recentNoteEl.textContent = n ? `“${n}”` : "No notes yet.";
  }

  if (saveNoteBtn && noteInput) {
    saveNoteBtn.addEventListener("click", () => {
      const val = (noteInput.value || "").trim();
      if (!val) return;
      localStorage.setItem(NOTE_KEY, val);
      noteInput.value = "";
      loadNote();
    });
  }

  if (clearNoteBtn && noteInput) {
    clearNoteBtn.addEventListener("click", () => {
      localStorage.removeItem(NOTE_KEY);
      noteInput.value = "";
      loadNote();
    });
  }

  refreshNoteBtn && refreshNoteBtn.addEventListener("click", loadNote);

  // init
  render(loadVotes());
  loadNote();
})();
// ===== Live Demo: REAL pretrained model (TFJS Toxicity) =====
(function () {
  const openBtn = document.getElementById("openDemo");
  const modal = document.getElementById("demoModal");
  const closeBackdrop = document.getElementById("closeDemo");
  const closeBtn = document.getElementById("closeDemoBtn");

  const input = document.getElementById("demoInput");
  const run = document.getElementById("runDemo");
  const clear = document.getElementById("clearDemo");

  const decisionEl = document.getElementById("demoDecision");
  const reasonEl = document.getElementById("demoReason");
  const modelStatusEl = document.getElementById("modelStatus");

  const predGrid = document.getElementById("predGrid");
  const thresh = document.getElementById("toxThreshold");
  const threshVal = document.getElementById("toxThresholdVal");

  if (!openBtn || !modal) return;

  let model = null;
  let modelLoading = false;

  function setDecision(d, r){
    if (decisionEl) decisionEl.textContent = d;
    if (reasonEl) reasonEl.textContent = r;
  }

  function setModelStatus(t){
    if (modelStatusEl) modelStatusEl.textContent = t;
  }

  function open(){
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    setTimeout(() => input && input.focus(), 0);
    ensureModel();
  }

  function close(){
    modal.classList.remove("show");
    modal.setAttribute("aria-hidden", "true");
  }

  openBtn.addEventListener("click", open);
  closeBackdrop && closeBackdrop.addEventListener("click", close);
  closeBtn && closeBtn.addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("show")) close();
  });

  if (thresh && threshVal){
    threshVal.textContent = Number(thresh.value).toFixed(2);
    thresh.addEventListener("input", () => {
      threshVal.textContent = Number(thresh.value).toFixed(2);
    });
  }

  function renderPredictions(rows){
    if (!predGrid) return;
    predGrid.innerHTML = "";
    rows.forEach(({label, score, hit}) => {
      const item = document.createElement("div");
      item.className = "predItem";
      item.innerHTML = `
        <span class="predLabel">${label}</span>
        <span class="predScore">${score.toFixed(2)}</span>
        <span class="predFlag ${hit ? "hit" : ""}">${hit ? "flag" : "ok"}</span>
      `;
      predGrid.appendChild(item);
    });
  }

  async function ensureModel(){
    if (model || modelLoading) return;
    modelLoading = true;

    try{
      setModelStatus("Loading pretrained model…");
      // Uses threshold only for the model’s internal “match”, but we also compute our own threshold decision below.
      const baseThreshold = 0.5;
      model = await toxicity.load(baseThreshold);
      setModelStatus("Model ready (pretrained)");
    }catch(err){
      console.error(err);
      setModelStatus("Failed to load model (check internet/CDN)");
    }finally{
      modelLoading = false;
    }
  }

  function decideFromScores(scores, threshold){
    // Example policy:
    // - If "threat" or "severe_toxicity" crosses threshold => Escalate
    // - If any other label crosses threshold => Auto-action
    // - Else Allow
    const map = Object.fromEntries(scores.map(s => [s.label, s.score]));
    const severe = (map["severe_toxicity"] || 0) >= threshold;
    const threat = (map["threat"] || 0) >= threshold;

    const anyFlag = scores.some(s => s.score >= threshold);

    if (severe || threat){
      return ["Escalate", "High-severity signal detected (threat/severe toxicity above threshold)."];
    }
    if (anyFlag){
      return ["Auto-action", "Toxicity-related signal detected above threshold."];
    }
    return ["Allow", "No label crosses the selected threshold."];
  }

  async function predict(){
    if (!model){
      await ensureModel();
      if (!model){
        setDecision("—", "Model not available. Check internet and reload.");
        return;
      }
    }

    const text = (input?.value || "").trim();
    if (!text){
      setDecision("—", "Type a message first.");
      renderPredictions([]);
      return;
    }

    setDecision("…", "Running prediction…");
    const threshold = thresh ? Number(thresh.value) : 0.7;

    try{
      const preds = await model.classify([text]); // returns array of label objects
      // Convert to label + probability of "true"
      const rows = preds.map(p => {
        const label = p.label; // e.g., "toxicity"
        const probTrue = p.results?.[0]?.probabilities?.[1] ?? 0; // index 1 = true
        return { label, score: probTrue, hit: probTrue >= threshold };
      });

      // Sort by highest score
      rows.sort((a,b) => b.score - a.score);

      renderPredictions(rows);

      const [d, r] = decideFromScores(rows, threshold);
      setDecision(d, r);
    }catch(err){
      console.error(err);
      setDecision("—", "Prediction failed. See console for details.");
    }
  }

  run && run.addEventListener("click", predict);

  clear && input && clear.addEventListener("click", () => {
    input.value = "";
    setDecision("—", "—");
    renderPredictions([]);
    input.focus();
  });
})();
