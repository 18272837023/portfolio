const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const root = document.documentElement;
const hero = document.querySelector(".hero");
const scene = document.querySelector(".hero-scene");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = [...document.querySelectorAll("#home, #work, #experience, #about")];
const contact = document.querySelector("#contact");
const header = document.querySelector(".site-header");
const nav = header.querySelector(".nav");
let frame = 0;
let pointerX = 0;
let activeHash;

function updateScroll() {
  frame = 0;
  const scrollable = root.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
  const headerBottom = header.getBoundingClientRect().bottom + 40;
  const activeSection = contact.getBoundingClientRect().top <= headerBottom
    ? null
    : sections.findLast(section => section.getBoundingClientRect().top <= headerBottom);
  const hash = activeSection ? `#${activeSection.id}` : "";
  root.style.setProperty("--progress", progress);
  header.classList.toggle("is-scrolled", hero.getBoundingClientRect().bottom <= headerBottom);

  if (hash !== activeHash) {
    activeHash = hash;
    navLinks.forEach(link => {
      if (link.hash === hash) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  if (!reducedMotion.matches && hero.getBoundingClientRect().bottom > 0) {
    scene.style.setProperty("--scene-x", `${pointerX}px`);
    scene.style.setProperty("--scene-y", `${Math.min(10, window.scrollY * .025)}px`);
  }
}

function scheduleUpdate() {
  if (!frame) frame = window.requestAnimationFrame(updateScroll);
}

window.addEventListener("scroll", scheduleUpdate, { passive: true });
window.addEventListener("resize", scheduleUpdate);
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  nav.addEventListener("pointermove", event => {
    if (!reducedMotion.matches) {
      const bounds = nav.getBoundingClientRect();
      nav.style.setProperty("--glass-x", `${event.clientX - bounds.left}px`);
    }
  }, { passive: true });
  hero.addEventListener("pointermove", event => {
    pointerX = (event.clientX / window.innerWidth - .5) * 10;
    scheduleUpdate();
  }, { passive: true });
  hero.addEventListener("pointerleave", () => {
    pointerX = 0;
    scheduleUpdate();
  });
}
scheduleUpdate();

if (!reducedMotion.matches && "IntersectionObserver" in window) {
  root.classList.add("motion");
  const revealObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    }
  }, { threshold: .12 });
  document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));
}

const heroBubbles = document.querySelector(".hero-bubbles");
const bubbleButtons = [...heroBubbles.querySelectorAll(".review-toggle")];

function setBubbleExpanded(button, expanded) {
  button.setAttribute("aria-expanded", String(expanded));
  document.getElementById(button.getAttribute("aria-controls")).inert = !expanded;
}

for (const button of bubbleButtons) {
  button.addEventListener("click", () => {
    const shouldExpand = button.getAttribute("aria-expanded") === "false";
    for (const toggle of bubbleButtons) {
      setBubbleExpanded(toggle, toggle === button && shouldExpand);
    }
  });
}
heroBubbles.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  const expanded = heroBubbles.querySelector('[aria-expanded="true"]');
  if (expanded) {
    setBubbleExpanded(expanded, false);
    expanded.focus({ preventScroll: true });
  }
});

const indieViewport = document.querySelector("#indie-viewport");
const indieToggle = document.querySelector(".indie-toggle");
const indieProducts = indieViewport.querySelector(".indie-products");
const indieCopy = indieProducts.cloneNode(true);
indieCopy.setAttribute("aria-hidden", "true");
indieCopy.querySelectorAll("a").forEach(link => { link.tabIndex = -1; });
indieProducts.after(indieCopy);

let indiePaused = false;
function updateIndiePlayback() {
  const isLooping = !reducedMotion.matches && !indiePaused;
  indieToggle.hidden = reducedMotion.matches;
  indieToggle.setAttribute("aria-pressed", String(indiePaused));
  indieViewport.classList.toggle("is-looping", isLooping);
  if (isLooping) indieViewport.scrollLeft = 0;
}

indieToggle.addEventListener("click", () => {
  indiePaused = !indiePaused;
  updateIndiePlayback();
});
reducedMotion.addEventListener("change", updateIndiePlayback);
indieProducts.addEventListener("focusin", event => {
  if (event.target.matches(":focus-visible")) event.target.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
});
indieProducts.addEventListener("focusout", event => {
  if (indieViewport.classList.contains("is-looping") && !indieProducts.contains(event.relatedTarget)) indieViewport.scrollLeft = 0;
});
updateIndiePlayback();

const dialog = document.querySelector("#case-dialog");
const caseContent = document.querySelector("#case-content");
const caseCounter = document.querySelector("#case-counter");
const chart = document.querySelector(".case-chart");
const chartUnit = document.querySelector("#chart-unit");
const chartPlot = document.querySelector("#chart-plot");
const chartGrid = document.querySelector("#chart-grid");
const chartBars = document.querySelector("#chart-bars");
const chartNote = document.querySelector("#chart-note");
const projectButtons = document.querySelectorAll(".hero-project");
const projectCharts = {
  remusic: {
    unit: "单位：万",
    max: 60,
    step: 15,
    points: [["月 UV", 10, "10 万+"], ["月 PV", 50, "50 万+"]],
    note: "商业化首月 MRR $3K，KR 达成率 300%。",
  },
  aivocal: {
    unit: "单位：万 PV",
    max: 40,
    step: 10,
    points: [["首月自然流量", 3, "3 万"], ["次月流量", 10, "10 万+"], ["峰值流量", 30, "30 万"]],
    note: "团队推文首月曝光 150 万，商业化首月 MRR $2K，KR 达成率 200%。",
  },
  aifans: {
    unit: "单位：个",
    max: 500,
    step: 100,
    points: [["上线后两周", 400, "400+"]],
    note: "三周完成产品上线，两周达成活跃 Agent 接入目标。",
  },
  clavisay: {
    unit: "单位：千 PV",
    max: 4,
    step: 1,
    points: [["上线首周流量", 3, "3K+"]],
    note: "插件上线次周进入 Chrome 应用商店核心关键词前五。",
  },
};

const chartObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(([entry], observer) => {
    if (entry.isIntersecting) {
      chart.classList.add("is-visible");
      observer.unobserve(chartPlot);
    }
  }, { root: dialog, threshold: .25 })
  : null;

function renderChart({ unit, max, step, points, note }) {
  chartUnit.textContent = unit;
  chartNote.textContent = note;

  const ticks = [];
  for (let value = max; value >= 0; value -= step) {
    const tick = document.createElement("span");
    tick.textContent = value;
    ticks.push(tick);
  }
  chartGrid.replaceChildren(...ticks);

  const bars = points.map(([label, value, display], index) => {
    const bar = document.createElement("li");
    bar.className = "chart-bar";
    bar.style.setProperty("--bar-level", `${value / max * 100}%`);
    bar.style.setProperty("--bar-delay", `${120 + index * 125}ms`);

    const fill = document.createElement("span");
    fill.className = "chart-fill";
    fill.setAttribute("aria-hidden", "true");
    const metric = document.createElement("strong");
    metric.className = "chart-value";
    metric.textContent = display;
    const caption = document.createElement("span");
    caption.className = "chart-label";
    caption.textContent = label;
    bar.append(fill, metric, caption);
    return bar;
  });
  chartBars.replaceChildren(...bars);
}

let opener;
projectButtons.forEach((button, index) => {
  button.addEventListener("click", () => {
    const project = button.dataset.project;
    const template = document.getElementById(project);
    caseContent.replaceChildren(template.content.cloneNode(true));
    dialog.dataset.project = project;
    caseCounter.textContent = `PROJECT ${String(index + 1).padStart(2, "0")} / ${String(projectButtons.length).padStart(2, "0")}`;
    chartObserver?.disconnect();
    chart.classList.remove("is-visible");
    renderChart(projectCharts[project]);
    opener = button;
    dialog.showModal();
    dialog.scrollTop = 0;
    if (chartObserver && !reducedMotion.matches) chartObserver.observe(chartPlot);
    else chart.classList.add("is-visible");
  });
});
dialog.addEventListener("close", () => {
  chartObserver?.disconnect();
  opener?.focus({ preventScroll: true });
});

const gallery = document.querySelector("#gallery-window");
const galleryNumber = document.querySelector("#gallery-number");
const galleryLabel = document.querySelector("#gallery-label");
const slides = [
  { file: "research", caption: "用户访谈 / User Research", alt: "3D 角色拿着平板，与用户面对面访谈" },
  { file: "review", caption: "产品评审 / Product Review", alt: "3D 角色站在屏幕前介绍产品路线图" },
  { file: "metrics", caption: "数据分析 / Product Analytics", alt: "3D 角色在电脑前分析产品指标" },
  { file: "ride", caption: "工作之外 / Off the Clock", alt: "3D 角色在河岸公园骑自行车" },
];
let selectedSlide = 0;
let imageRequest = 0;

async function changeSlide(direction) {
  selectedSlide = (selectedSlide + direction + slides.length) % slides.length;
  const slide = slides[selectedSlide];
  const request = ++imageRequest;
  const image = new Image();
  image.alt = slide.alt;
  image.src = `assets/${slide.file}.webp`;

  try {
    await image.decode();
  } catch {
    return;
  }
  if (request !== imageRequest) return;

  const outgoing = gallery.lastElementChild;
  gallery.replaceChildren(outgoing, image);
  galleryNumber.textContent = `${String(selectedSlide + 1).padStart(2, "0")} / 04`;
  galleryLabel.textContent = slide.caption;
  if (reducedMotion.matches) {
    outgoing.remove();
    return;
  }

  outgoing.alt = "";
  const fade = image.animate(
    [{ opacity: 0, transform: "scale(1.025)" }, { opacity: 1, transform: "none" }],
    { duration: 470, easing: "cubic-bezier(.22, 1, .36, 1)" },
  );
  fade.onfinish = () => outgoing.remove();
}

document.querySelectorAll("[data-slide]").forEach(button => {
  button.addEventListener("click", () => changeSlide(Number(button.dataset.slide)));
});
