(() => {
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isHeroLocation = () => ["", "#home", "#main", "#work"].includes(location.hash);
  const isReload = performance.getEntriesByType("navigation")[0]?.type === "reload";
  if (motion.matches || (!isReload && !isHeroLocation())) return;

  const previousScrollRestoration = history.scrollRestoration;
  if (isReload) {
    history.scrollRestoration = "manual";
    if (location.hash) history.replaceState(history.state, "", location.href.split("#")[0]);
  }

  const root = document.documentElement;
  root.classList.add("intro-active");

  document.addEventListener("DOMContentLoaded", () => {
    if (isReload) window.scrollTo({ top: 0, behavior: "instant" });
    const video = document.querySelector(".hero-intro-video");
    const source = video.querySelector("source");
    const background = document.querySelector(".hero-scene img");
    const backgroundReady = background.decode().catch(() => {});
    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    let playbackTimeout;
    let revealTimeout;
    let fade;

    function reveal() {
      listeners.abort();
      window.clearTimeout(playbackTimeout);
      window.clearTimeout(revealTimeout);
      video.pause();
      root.classList.remove("intro-active", "intro-crossfade");
      root.classList.add("intro-complete");
      if (isReload) history.scrollRestoration = previousScrollRestoration;
      fade?.cancel();
    }

    function watchForStall() {
      window.clearTimeout(playbackTimeout);
      playbackTimeout = window.setTimeout(reveal, 12000);
    }

    async function crossfade() {
      watchForStall();
      await backgroundReady;
      if (listeners.signal.aborted) return;
      window.clearTimeout(playbackTimeout);
      root.classList.add("intro-crossfade");
      fade = video.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 640,
        easing: "ease-in-out",
        fill: "forwards",
      });
      fade.finished.then(() => {
        revealTimeout = window.setTimeout(reveal, 200);
      }, () => {});
    }

    video.addEventListener("ended", crossfade, options);
    video.addEventListener("error", reveal, options);
    source.addEventListener("error", reveal, options);
    video.addEventListener("waiting", watchForStall, options);
    video.addEventListener("playing", () => window.clearTimeout(playbackTimeout), options);
    window.addEventListener("hashchange", () => {
      if (!isHeroLocation()) reveal();
    }, options);
    motion.addEventListener("change", () => {
      if (motion.matches) reveal();
    }, options);

    watchForStall();
    video.muted = true;
    video.play().catch(reveal);
  }, { once: true });
})();
