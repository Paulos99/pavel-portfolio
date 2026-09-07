(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const year = document.querySelector("[data-year]");
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener("click", () => {
      const open = mobileNav.hasAttribute("hidden");
      if (open) mobileNav.removeAttribute("hidden");
      else mobileNav.setAttribute("hidden", "");
      toggle.setAttribute("aria-expanded", String(open));
    });
    mobileNav.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        mobileNav.setAttribute("hidden", "");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (!reduce && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el, i) => {
      el.style.transitionDelay = `${Math.min(i % 6, 4) * 60}ms`;
      io.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
  }

  const tilt = document.querySelector("[data-tilt]");
  if (tilt && !reduce && window.matchMedia("(pointer: fine)").matches) {
    tilt.addEventListener("pointermove", (e) => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `perspective(700px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-2px)`;
    });
    tilt.addEventListener("pointerleave", () => {
      tilt.style.transform = "";
    });
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = String(data.get("name") || "").trim();
      const contact = String(data.get("contact") || "").trim();
      const task = String(data.get("task") || "").trim();
      const privacy = form.querySelector('[name="privacy"]');
      if (!name || !contact || !task || !(privacy && privacy.checked)) {
        if (status) {
          status.textContent = "Заполните имя, способ связи, задачу и согласие.";
          status.className = "form-status is-err";
        }
        return;
      }
      const brief = [
        "Заявка с портфолио paulos99.github.io/pavel-portfolio",
        `Имя: ${name}`,
        `Связь: ${contact}`,
        "",
        "Задача:",
        task,
      ].join("\n");
      try {
        const ok = await copyText(brief);
        if (status) {
          status.textContent = ok
            ? "Заявка скопирована. Вставьте в Telegram или письмо."
            : "Не удалось скопировать — скопируйте поля вручную.";
          status.className = ok ? "form-status is-ok" : "form-status is-err";
        }
      } catch (_) {
        if (status) {
          status.textContent = "Не удалось скопировать.";
          status.className = "form-status is-err";
        }
      }
    });
  }

  // Live case previews: load iframes when visible, play scroll reel
  const previewRoots = document.querySelectorAll("[data-preview]");
  if (previewRoots.length && "IntersectionObserver" in window) {
    const loadIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const root = e.target;
          const frame = root.querySelector(".preview-frame");
          if (!frame) return;
          if (frame.dataset.src && !frame.getAttribute("src")) {
            frame.setAttribute("src", frame.dataset.src);
          }
          if (root.getAttribute("data-preview") === "scroll") {
            frame.classList.add("is-playing");
          }
          // app/interact: live iframe, no reel
          loadIo.unobserve(root);
        });
      },
      { rootMargin: "200px 0px", threshold: 0.05 }
    );
    previewRoots.forEach((el) => loadIo.observe(el));
  } else {
    document.querySelectorAll(".preview-frame").forEach((frame) => {
      if (frame.dataset.src) frame.setAttribute("src", frame.dataset.src);
      frame.classList.add("is-playing");
    });
  }

})();
