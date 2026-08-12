const timelineData = [
  {
    date: "Aug 2021",
    title: "Started at Santa Clara University",
    place: "Santa Clara, CA",
    category: "education",
    desc: "Began a BS in Economics with a concentration in Statistics &amp; Data Analysis and a minor in Engineering."
  },
  {
    date: "Aug 2021",
    title: "Joined the Santa Clara Swim Team",
    place: "Santa Clara, CA",
    category: "athletics",
    desc: "Walked onto the varsity swim team as a freshman, balancing early-morning training with a full course load from day one."
  },
  {
    date: "2023 – 2025",
    title: "Santa Clara University Innovation Fellow",
    place: "Santa Clara, CA",
    category: "milestone",
    desc: "Selected as an Innovation Fellow spanning junior and senior year, part of a university-wide program recognizing student builders and researchers."
  },
  {
    date: "Mar – May 2024",
    title: "Consulting & Management Intern, PwC",
    place: "San Francisco, CA",
    category: "experience",
    desc: "Improved stakeholder engagement by 21% by consolidating field inputs and delivering sentiment analyses translated into structured KPIs and executive-ready Tableau dashboards. Increased nonprofit program enrollment by 60% using predictive analytics and structured data modeling.",
    skills: ["KPI Development", "Tableau", "Predictive Modeling", "Business Intelligence", "Stakeholder Reporting"]
  },
  {
    date: "Jun – Sep 2024",
    title: "Data Analytics & Professional Services Intern, Everpure",
    place: "Santa Clara, CA",
    category: "experience",
    desc: "Improved quarterly revenue forecasting accuracy by 17% using predictive models (XGBoost, Random Forest). Owned the full dashboard lifecycle in Tableau, and cut operational costs by 10% while accelerating installation stages by 87%.",
    skills: ["Predictive Modeling", "Tableau", "Business Intelligence", "Data Wrangling"]
  },
  {
    date: "2024 – 2025",
    title: "Undergraduate Teaching Assistant, Time Series Analysis",
    place: "Santa Clara, CA",
    category: "experience",
    desc: "Supported instruction for a senior-level time series analysis course, helping classmates work through forecasting models and problem sets.",
    skills: ["Time Series Analysis"]
  },
  {
    date: "2024 – 2025",
    title: "Student Researcher, Urban Issues Research Lab",
    place: "Santa Clara, CA",
    category: "experience",
    desc: "Contributed to research on urban policy questions as part of Santa Clara's Urban Issues Research Lab during senior year.",
    skills: ["Data Wrangling"]
  },
  {
    date: "2024 – 2025",
    title: "Team Captain &amp; Club President, Santa Clara Swimming",
    place: "Santa Clara, CA",
    category: "athletics",
    desc: "Named team captain and elected club president for senior year, leading a roster through training blocks, meets, and the balancing act of D1 athletics on top of a full economics course load. Back-to-back Swim MVP (2023-24, 2024-25) and 2024-25 Club Sports Athlete of the Year."
  },
  {
    date: "Jun 2025",
    title: "Graduated Santa Clara University",
    place: "Santa Clara, CA",
    category: "milestone",
    desc: "BS in Economics, Statistics &amp; Data Analysis, minor in Engineering. Bronco Scholarship recipient all four years and Economics Student Association member."
  },
  {
    date: "Jun – Sep 2025",
    title: "Research &amp; Data Science Intern, Arizona Office of Economic Opportunity",
    place: "Phoenix, AZ",
    category: "experience",
    desc: "Built and maintained a tracking database modeling 450k+ job postings with SQL and R. Designed Tableau dashboards with standardized KPIs, and automated reporting pipelines to cut manual effort by 22%.",
    skills: ["SQL", "R", "Tableau", "KPI Development", "Business Intelligence", "Stakeholder Reporting"]
  },
  {
    date: "Sep 2025",
    title: "Started Master's at NYU",
    place: "New York, NY",
    category: "education",
    desc: "Began an MS in Management and Analytics (STEM) at NYU after moving to New York. Distinguished Scholars Award; Consulting and Business Strategy Society."
  },
  {
    date: "Sep 2025",
    title: "Joined NYU Swimming &amp; Diving",
    place: "New York, NY",
    category: "athletics",
    desc: "Made the NCAA Division I Men's Varsity Swimming roster, training 20+ hours a week on top of a full graduate course load."
  },
  {
    date: "Jan – Mar 2026",
    title: "Operational Strategy &amp; People Analytics Extern, Amazon",
    place: "New York, NY",
    category: "experience",
    desc: "Engineered a data pipeline analyzing 500+ unstructured data points to uncover root causes of workforce attrition. Applied cohort segmentation and predictive analytics to design a pilot-ready intervention strategy projected to cut turnover risk by 10-15%.",
    skills: ["Predictive Modeling", "Cohort Segmentation", "Data Wrangling"]
  },
  {
    date: "Spring 2026",
    title: "SQL Coding Intensive Course",
    place: "New York, NY",
    category: "education",
    desc: "Admitted to and completing an intensive SQL coding program alongside the NYU course load.",
    skills: ["SQL"]
  },
  {
    date: "Summer 2026",
    title: "NPI Materials Intern, Everpure",
    place: "Santa Clara, CA",
    category: "experience",
    desc: "Returning to Everpure for a second internship, this time on the New Product Introduction materials team.",
    skills: ["Product Management"]
  },
  {
    date: "Dec 2026",
    title: "Graduating NYU",
    place: "New York, NY",
    category: "milestone",
    desc: "Expected to complete the MS in Management and Analytics (STEM), closing out five years of study with a BS and MS in hand, five internships, and an NCAA swimming career."
  }
];

const timelineEl = document.getElementById("timeline");

function renderTimeline() {
  timelineEl.innerHTML = timelineData.map(item => `
    <div class="entry" data-category="${item.category}" data-skills="${(item.skills || []).join("|")}">

      <div class="entry-card">
        <div class="entry-header">
          <span class="entry-date">${item.date}</span>
          <span class="entry-tag tag-${item.category}">${item.category}</span>
        </div>
        <div class="entry-body">
          <div class="entry-title">${item.title}</div>
          <div class="entry-place">${item.place}</div>
          <p class="entry-desc">${item.desc}</p>
          <button class="entry-toggle" type="button">▾ MORE</button>
        </div>
      </div>
    </div>
  `).join("") + `<div class="timeline-pulse"></div>`;
  observeEntries();
  setupTimelineToggle();
}

function setupTimelineToggle() {
  // Only show the toggle on entries whose description is actually clipped.
  document.querySelectorAll(".entry").forEach(entry => {
    const desc = entry.querySelector(".entry-desc");
    if (desc && desc.scrollHeight > desc.clientHeight + 1) {
      entry.classList.add("truncatable");
    }
  });

  timelineEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".entry-toggle");
    if (!btn) return;
    const entry = btn.closest(".entry");
    const expanded = entry.classList.toggle("expanded");
    btn.textContent = expanded ? "▴ LESS" : "▾ MORE";
    playBlip(expanded ? 620 : 480, 0.06, "sine");
  });
}

function revealVisibleEntries() {
  document.querySelectorAll(".entry:not(.in-view), .reveal:not(.in-view)").forEach(entry => {
    if (entry.getBoundingClientRect().top < window.innerHeight * 0.92) {
      entry.classList.add("in-view");
    }
  });
  updateBadgeCounters();
}

function updateBadgeCounters() {
  document.querySelectorAll("[data-badge-counter]").forEach(counterEl => {
    const section = document.querySelector(counterEl.dataset.badgeCounter);
    if (!section) return;
    const total = section.querySelectorAll(".ach-badge").length;
    const unlocked = section.querySelectorAll(".ach-badge.in-view").length;
    counterEl.textContent = `${unlocked} / ${total}`;
  });
}

function setupLiveClock() {
  const el = document.getElementById("hudClock");
  if (!el) return;
  const zones = [
    { label: "NYC", tz: "America/New_York" },
    { label: "SF", tz: "America/Los_Angeles" },
    { label: "SCL", tz: "America/Santiago" }
  ].map(z => ({
    label: z.label,
    formatter: new Intl.DateTimeFormat("en-US", { timeZone: z.tz, hour: "2-digit", minute: "2-digit", hour12: false })
  }));
  const update = () => {
    const now = new Date();
    el.textContent = zones.map(z => `${z.label} ${z.formatter.format(now)}`).join("  ·  ");
  };
  update();
  setInterval(update, 1000);
}

function setupPortraitTilt() {
  const wrap = document.querySelector(".portrait-tilt");
  const inner = document.getElementById("portraitTiltInner");
  if (!wrap || !inner) return;
  wrap.addEventListener("mousemove", (e) => {
    const rect = wrap.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    inner.style.transform = `rotateX(${(-y * 16).toFixed(2)}deg) rotateY(${(x * 16).toFixed(2)}deg)`;
  });
  wrap.addEventListener("mouseleave", () => {
    inner.style.transform = "";
  });
}

function setupSkillLinks() {
  document.querySelectorAll(".tags span").forEach(tag => {
    const skill = tag.textContent.trim();
    const hasMatch = Array.from(document.querySelectorAll(".entry")).some(entry =>
      (entry.dataset.skills || "").split("|").includes(skill)
    );
    if (!hasMatch) return;
    tag.dataset.linked = "true";
    tag.addEventListener("mouseenter", () => {
      document.querySelectorAll(".entry").forEach(entry => {
        if ((entry.dataset.skills || "").split("|").includes(skill)) {
          entry.classList.add("skill-highlight");
        }
      });
    });
    tag.addEventListener("mouseleave", () => {
      document.querySelectorAll(".entry.skill-highlight").forEach(entry => {
        entry.classList.remove("skill-highlight");
      });
    });
  });
}

function setupGradCountdown() {
  const el = document.getElementById("gradCountdown");
  if (!el) return;
  const target = new Date("2026-12-01T00:00:00");
  const diffDays = Math.max(0, Math.ceil((target - new Date()) / 86400000));
  el.textContent = diffDays;
}

function setupCopyLink() {
  const btn = document.getElementById("copyLinkBtn");
  if (!btn) return;
  const original = btn.textContent;
  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      btn.textContent = "COPIED ✓";
      playBlip(880, 0.08, "square");
    } catch (e) {
      btn.textContent = "COPY FAILED";
    }
    setTimeout(() => { btn.textContent = original; }, 1600);
  });
}

function setupVisitorCounter() {
  const el = document.getElementById("visitorCounter");
  if (!el) return;
  const key = "dg_visit_count";
  let count = parseInt(localStorage.getItem(key) || "4217", 10);
  count += 1;
  localStorage.setItem(key, count);
  el.textContent = String(count).padStart(6, "0");
}

function observeEntries() {
  revealVisibleEntries();
  window.addEventListener("scroll", revealVisibleEntries, { passive: true });
  window.addEventListener("resize", revealVisibleEntries);
  window.addEventListener("hashchange", () => setTimeout(revealVisibleEntries, 350));

  // Safety net: catches anchor-jump navigation and any environment where
  // the scroll event doesn't fire for programmatic scrolling.
  const start = Date.now();
  const poll = () => {
    revealVisibleEntries();
    if (Date.now() - start < 2500) requestAnimationFrame(poll);
  };
  requestAnimationFrame(poll);
}

function setupStagger() {
  document.querySelectorAll(".ach-grid").forEach(grid => {
    Array.from(grid.children).forEach((child, i) => {
      child.style.transitionDelay = (i % 6) * 70 + "ms";
    });
  });
  document.querySelectorAll(".about-skills").forEach(wrap => {
    Array.from(wrap.children).forEach((child, i) => {
      child.style.transitionDelay = i * 90 + "ms";
    });
  });
  document.querySelectorAll(".logo-strip").forEach(wrap => {
    Array.from(wrap.children).forEach((child, i) => {
      child.style.transitionDelay = i * 60 + "ms";
    });
  });
}

function setupFilters() {
  const pills = document.querySelectorAll(".filter-pill");
  pills.forEach(pill => {
    pill.addEventListener("click", () => {
      pills.forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      const filter = pill.dataset.filter;
      document.querySelectorAll(".entry").forEach(entry => {
        const match = filter === "all" || entry.dataset.category === filter;
        entry.classList.toggle("hidden-filter", !match);
      });
      document.querySelectorAll(".entry:not(.hidden-filter) .entry-card").forEach(card => {
        card.classList.remove("filter-flicker");
        void card.offsetWidth;
        card.classList.add("filter-flicker");
      });
      playBlip(520, 0.07, "square");
    });
  });
}

// ---------- Synthesized UI sound effects (muted by default) ----------
let audioCtx = null;
let soundEnabled = false;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBlip(freq, duration, type) {
  if (!soundEnabled) return;
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type || "square";
  osc.frequency.value = freq || 660;
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (duration || 0.08));
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + (duration || 0.08));
}

function setupSoundToggle() {
  const btn = document.getElementById("soundToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    btn.textContent = soundEnabled ? "🔊" : "🔇";
    if (soundEnabled) {
      getAudioCtx().resume?.();
      playBlip(880, 0.1, "square");
    }
  });
}

function setupNavShadow() {
  window.addEventListener("scroll", () => {
    document.body.classList.toggle("scrolled", window.scrollY > 40);
  });
}

function setupHeroGlow() {
  const hero = document.querySelector(".hero");
  const glow = document.querySelector(".hero-glow");
  if (!hero || !glow) return;
  hero.addEventListener("mousemove", (e) => {
    const rect = hero.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    glow.style.setProperty("--mx", x + "%");
    glow.style.setProperty("--my", y + "%");
  });
}

function setupArrowPulse() {
  document.querySelectorAll(".origin-arrow").forEach((arrow, i) => {
    arrow.style.animationDelay = i * 0.35 + "s";
  });
}

function setupScrollProgress() {
  const fill = document.getElementById("scrollProgressFill");
  if (!fill) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    fill.style.width = pct + "%";
  };
  update();
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
}

// ---------- Konami code easter egg ----------
function spawnConfetti() {
  const container = document.getElementById("confettiContainer");
  if (!container) return;
  const colors = ["#22d3ee", "#ffd23f", "#ff8c1a", "#22c55e", "#ff3b3b", "#ffffff"];
  for (let i = 0; i < 60; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "vw";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2 + Math.random() * 1.5 + "s";
    piece.style.animationDelay = Math.random() * 0.4 + "s";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

function showCheatBanner() {
  const banner = document.createElement("div");
  banner.className = "cheat-banner";
  banner.textContent = "CHEAT CODE ACTIVATED";
  document.body.appendChild(banner);
  setTimeout(() => banner.remove(), 2300);
}

function setupKonamiCode() {
  const sequence = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let progress = 0;
  window.addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const expected = sequence[progress];
    if (key === expected) {
      progress++;
      if (progress === sequence.length) {
        spawnConfetti();
        showCheatBanner();
        [660, 880, 990, 1320].forEach((f, i) => setTimeout(() => playBlip(f, 0.12, "square"), i * 90));
        progress = 0;
      }
    } else {
      progress = key === sequence[0] ? 1 : 0;
    }
  });
}

setupStagger();
renderTimeline();
setupFilters();
setupNavShadow();
setupHeroGlow();
setupArrowPulse();
setupScrollProgress();
setupKonamiCode();
setupLiveClock();
setupPortraitTilt();
setupSoundToggle();
setupSkillLinks();
setupGradCountdown();
setupCopyLink();
setupVisitorCounter();
