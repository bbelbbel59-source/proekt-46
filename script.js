(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const root = document.documentElement;
  const header = $("#header");
  const toast = $("#toast");
  let toastTimer;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  };

  const store = {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        return;
      }
    },
  };

  const swapText = (button, text) => {
    const target = $(".btn-text", button);
    target.style.opacity = "0";
    setTimeout(() => {
      target.textContent = text;
      target.style.opacity = "1";
    }, 180);
  };

  const countUp = (element) => {
    const goal = Number(element.dataset.count);
    const duration = 2000;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      element.textContent = Math.round(goal * eased).toLocaleString("en-US").replace(/,/g, " ");
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const initReveal = () => {
    $$(".hero .reveal").forEach((el, i) => el.style.setProperty("--d", `${i * 0.14}s`));
    $$(".feature-grid, .product-grid, .steps, .gallery-grid, .accordion, .info-list, .checklist").forEach((parent) => {
      $$(":scope > .reveal", parent).forEach((el, i) => el.style.setProperty("--d", `${(i % 3) * 0.12}s`));
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("show");
          $$("[data-count]", entry.target).forEach(countUp);
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    $$(".reveal").forEach((el) => revealObserver.observe(el));

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          countUp(entry.target);
          counterObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );
    $$("[data-count]").forEach((el) => {
      if (!el.closest(".reveal")) counterObserver.observe(el);
    });
  };

  const initPreloader = () => {
    const preloader = $("#preloader");
    const minTime = new Promise((resolve) => setTimeout(resolve, 2200));
    const loaded = new Promise((resolve) => {
      if (document.readyState === "complete") resolve();
      else window.addEventListener("load", resolve, { once: true });
    });
    Promise.all([minTime, loaded]).then(() => {
      preloader.classList.add("done");
      initReveal();
      startTyping();
    });
  };

  const initTheme = () => {
    const saved = store.get("inklux-theme");
    if (saved) root.dataset.theme = saved;
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.dataset.theme = "dark";

    $("#themeToggle").addEventListener("click", () => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      store.set("inklux-theme", next);
      showToast(next === "dark" ? "Tungi rejim yoqildi" : "Kunduzgi rejim yoqildi");
    });
  };

  const initScroll = () => {
    const progress = $(".scroll-progress");
    const toTop = $("#toTop");

    const onScroll = () => {
      const top = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${(top / height) * 100}%`;
      header.classList.toggle("scrolled", top > 60);
      toTop.classList.toggle("show", top > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    const links = $$(".menu a");
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          links.forEach((link) => link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    $$("main section[id]").forEach((section) => sectionObserver.observe(section));
  };

  const initMenu = () => {
    const burger = $("#burger");
    const menu = $("#menu");
    const icon = $("use", burger);

    const setMenu = (open) => {
      menu.classList.toggle("open", open);
      document.body.classList.toggle("lock", open);
      icon.setAttribute("href", open ? "#i-x" : "#i-menu");
    };

    burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
    $$("a", menu).forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));
  };

  const startTyping = () => {
    const target = $("#typed");
    const words = ["san'at darajasini", "yangi ma'no", "premium ko'rinish", "o'chmas iz"];
    let wordIndex = 0;
    let charIndex = 0;
    let deleting = false;

    const type = () => {
      const word = words[wordIndex];
      charIndex += deleting ? -1 : 1;
      target.textContent = word.slice(0, charIndex);

      let delay = deleting ? 45 : 95;
      if (!deleting && charIndex === word.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && charIndex === 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        delay = 400;
      }
      setTimeout(type, delay);
    };
    type();
  };

  const initHeroButtons = () => {
    const heroBtn = $("#heroBtn");
    heroBtn.addEventListener("click", () => {
      swapText(heroBtn, "Pastga tushyapmiz...");
      setTimeout(() => swapText(heroBtn, "Kolleksiyani ko'rish"), 2000);
    });

    const paletteBtn = $("#paletteBtn");
    const palettes = [
      { name: "Oltin", brand: "#d4a84a", brand2: "#f3d98b", ink: "#1a1405" },
      { name: "Safir", brand: "#3b82f6", brand2: "#93c5fd", ink: "#06122e" },
      { name: "Zumrad", brand: "#10b981", brand2: "#6ee7b7", ink: "#03160f" },
      { name: "Yoqut", brand: "#f43f5e", brand2: "#fda4af", ink: "#2a050e" },
      { name: "Binafsha", brand: "#8b5cf6", brand2: "#c4b5fd", ink: "#14072e" },
    ];
    let current = 0;

    paletteBtn.addEventListener("click", () => {
      current = (current + 1) % palettes.length;
      const p = palettes[current];
      root.style.setProperty("--brand", p.brand);
      root.style.setProperty("--brand-2", p.brand2);
      root.style.setProperty("--brand-ink", p.ink);
      swapText(paletteBtn, `Rang: ${p.name}`);
      showToast(`${p.name} rang tanlandi`);
    });
  };

  const initProducts = () => {
    const filters = $$(".filter");
    const products = $$(".product");
    const cartCount = $("#cartCount");
    let cart = 0;

    filters.forEach((button) => {
      button.addEventListener("click", () => {
        filters.forEach((f) => f.classList.remove("active"));
        button.classList.add("active");
        const type = button.dataset.filter;
        products.forEach((product) => {
          const match = type === "all" || product.dataset.category === type;
          product.classList.toggle("hide", !match);
          product.classList.remove("pop");
          if (match) {
            void product.offsetWidth;
            product.classList.add("pop");
          }
        });
      });
    });

    $$(".like").forEach((button) => {
      button.addEventListener("click", () => {
        const liked = button.classList.toggle("liked");
        showToast(liked ? "Sevimlilarga qo'shildi" : "Sevimlilardan olib tashlandi");
      });
    });

    $$(".add-cart").forEach((button) => {
      button.addEventListener("click", () => {
        if (button.classList.contains("added")) return;
        button.classList.add("added");
        swapText(button, "Qo'shildi!");
        $("use", button).setAttribute("href", "#i-check");

        cart += 1;
        cartCount.textContent = cart;
        cartCount.classList.remove("bump");
        void cartCount.offsetWidth;
        cartCount.classList.add("bump");

        const name = button.closest(".product").querySelector("h3").textContent;
        showToast(`${name} savatga qo'shildi`);

        setTimeout(() => {
          button.classList.remove("added");
          swapText(button, "Savatga");
          $("use", button).setAttribute("href", "#i-cart");
        }, 2200);
      });
    });

    if (window.matchMedia("(hover: hover)").matches) {
      products.forEach((card) => {
        card.addEventListener("mousemove", (e) => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          card.style.transform = `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) rotateY(${(x * 7).toFixed(2)}deg) translateY(-8px)`;
        });
        card.addEventListener("mouseleave", () => {
          card.style.transform = "";
        });
      });
    }
  };

  const initAbout = () => {
    const button = $("#moreBtn");
    const text = $("#moreText");
    button.addEventListener("click", () => {
      const open = text.classList.toggle("open");
      swapText(button, open ? "Yopish" : "Batafsil o'qish");
      $(".icon", button).style.transform = open ? "rotate(180deg)" : "";
    });
  };

  const initGallery = () => {
    const lightbox = $("#lightbox");
    const image = $("#lbImg");

    const close = () => lightbox.classList.remove("open");

    $$(".g-item").forEach((item) => {
      item.addEventListener("click", () => {
        const img = $("img", item);
        image.src = img.src;
        image.alt = img.alt;
        lightbox.classList.add("open");
      });
    });

    $("#lbClose").addEventListener("click", close);
    lightbox.addEventListener("click", (e) => e.target === lightbox && close());
    document.addEventListener("keydown", (e) => e.key === "Escape" && close());
  };

  const initSlider = () => {
    const slides = $("#slides");
    const total = slides.children.length;
    const dotsBox = $("#dots");
    const slider = $("#slider");
    let index = 0;
    let timer;

    const dots = [...Array(total)].map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "dot";
      dot.setAttribute("aria-label", `${i + 1}-sharh`);
      dot.addEventListener("click", () => go(i));
      dotsBox.appendChild(dot);
      return dot;
    });

    const go = (i) => {
      index = (i + total) % total;
      slides.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((dot, n) => dot.classList.toggle("active", n === index));
      restart();
    };

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 5500);
    };

    $("#prevBtn").addEventListener("click", () => go(index - 1));
    $("#nextBtn").addEventListener("click", () => go(index + 1));
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", restart);

    let startX = 0;
    slider.addEventListener("touchstart", (e) => (startX = e.touches[0].clientX), { passive: true });
    slider.addEventListener("touchend", (e) => {
      const diff = e.changedTouches[0].clientX - startX;
      if (Math.abs(diff) > 50) go(diff < 0 ? index + 1 : index - 1);
    });

    go(0);
  };

  const initFaq = () => {
    const items = $$(".acc-item");
    items.forEach((item) => {
      const head = $(".acc-head", item);
      const body = $(".acc-body", item);
      head.addEventListener("click", () => {
        const willOpen = !item.classList.contains("open");
        items.forEach((other) => {
          other.classList.remove("open");
          $(".acc-body", other).style.maxHeight = null;
        });
        if (willOpen) {
          item.classList.add("open");
          body.style.maxHeight = `${body.scrollHeight}px`;
        }
      });
    });
  };

  const initForms = () => {
    const form = $("#contactForm");
    const button = $("#submitBtn");
    const error = $("#formError");
    const fields = $$(".field", form);

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      error.textContent = "";
      let valid = true;

      fields.forEach((field) => {
        const input = $("input, textarea", field);
        const value = input.value.trim();
        const emailOk = input.type !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const ok = value.length > 0 && emailOk;
        field.classList.toggle("invalid", !ok);
        if (!ok) valid = false;
      });

      if (!valid) {
        error.textContent = "Iltimos, barcha maydonlarni to'g'ri to'ldiring.";
        return;
      }

      button.classList.add("loading");
      swapText(button, "Yuborilmoqda...");

      setTimeout(() => {
        button.classList.remove("loading");
        button.classList.add("success");
        swapText(button, "Yuborildi! Rahmat");
        $("use", button).setAttribute("href", "#i-check");
        form.reset();
        showToast("Xabaringiz muvaffaqiyatli yuborildi");

        setTimeout(() => {
          button.classList.remove("success");
          swapText(button, "Xabarni yuborish");
          $("use", button).setAttribute("href", "#i-send");
        }, 3000);
      }, 1600);
    });

    $$("input, textarea", form).forEach((input) => {
      input.addEventListener("input", () => input.closest(".field").classList.remove("invalid"));
    });

    $("#newsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      e.target.reset();
      showToast("Obuna bo'lganingiz uchun rahmat!");
    });
  };

  initTheme();
  initPreloader();
  initScroll();
  initMenu();
  initHeroButtons();
  initProducts();
  initAbout();
  initGallery();
  initSlider();
  initFaq();
  initForms();
})();
