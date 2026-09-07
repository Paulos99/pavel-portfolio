(() => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-nav-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  const year = document.querySelector("[data-year]");
  const form = document.querySelector("[data-contact-form]");
  const status = document.querySelector("[data-form-status]");

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

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-in"));
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
            ? "Заявка скопирована. Вставьте её в Telegram или письмо Павлу."
            : "Не удалось скопировать. Выделите текст вручную из полей формы.";
          status.className = ok ? "form-status is-ok" : "form-status is-err";
        }
      } catch (_) {
        if (status) {
          status.textContent = "Не удалось скопировать. Воспользуйтесь формой на текущем сайте.";
          status.className = "form-status is-err";
        }
      }
    });
  }
})();
