(() => {
  const header = document.querySelector(".site-header");
  const progressBar = document.querySelector(".progress__bar");
  const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
  const sections = Array.from(document.querySelectorAll("main section[id]"));
  const rangeSections = Array.from(document.querySelectorAll("section[data-range]"));
  const navToggle = document.querySelector(".nav-toggle");
  const navCloseTargets = Array.from(document.querySelectorAll("[data-nav-close]"));
  const rangeLabel = document.querySelector(".brand__subtitle");
  const root = document.documentElement;
  const clearPreload = () => root.classList.remove("preload");
  const defaultRange = rangeLabel ? rangeLabel.textContent : "";
  const mobileQuery = window.matchMedia("(max-width: 980px)");
  let activeSection = sections[0] || null;

  const setNavOpen = (isOpen) => {
    document.body.classList.toggle("nav-open", isOpen);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }
  };

  if (navToggle) {
    navToggle.addEventListener("click", () => {
      const isOpen = document.body.classList.contains("nav-open");
      setNavOpen(!isOpen);
    });
  }

  navCloseTargets.forEach((target) => {
    target.addEventListener("click", () => setNavOpen(false));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setNavOpen(false);
    }
  });

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  const setRangeLabel = (section) => {
    if (!rangeLabel) return;
    if (!mobileQuery.matches) {
      rangeLabel.textContent = defaultRange;
      return;
    }
    if (!section) return;
    const range = section.dataset.range || defaultRange;
    rangeLabel.textContent = range;
  };

  const updateRangeFromScroll = () => {
    if (!rangeSections.length) {
      setRangeLabel(activeSection);
      return;
    }
    if (!mobileQuery.matches) {
      setRangeLabel(activeSection);
      return;
    }
    const headerOffset = header ? header.getBoundingClientRect().height + 12 : 80;
    let current = rangeSections[0];
    rangeSections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top - headerOffset <= 0) {
        current = section;
      }
    });
    activeSection = current;
    setRangeLabel(current);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
          activeSection = entry.target;
          setRangeLabel(entry.target);
        }
      });
    },
    { rootMargin: "-30% 0px -55% 0px", threshold: 0.2 }
  );

  sections.forEach((section) => observer.observe(section));
  updateRangeFromScroll();

  mobileQuery.addEventListener("change", () => {
    updateRangeFromScroll();
  });

  let ticking = false;
  const updateChrome = () => {
    const offset = window.scrollY || window.pageYOffset;
    header.classList.toggle("is-scrolled", offset > 24);
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (offset / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    updateRangeFromScroll();
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(() => {
        updateChrome();
        ticking = false;
      });
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", updateChrome);
  updateChrome();

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (prefersReducedMotion.matches) {
    document.body.classList.add("reduced-motion");
    clearPreload();
    return;
  }

  if (!window.gsap || !window.ScrollTrigger) {
    clearPreload();
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  const heroItems = document.querySelectorAll(".hero .reveal");
  if (heroItems.length) {
    gsap.set(heroItems, { autoAlpha: 0, y: 24 });
    window.requestAnimationFrame(() => {
      clearPreload();
      gsap.to(heroItems, {
        autoAlpha: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.2,
      });
    });
  } else {
    clearPreload();
  }

  const chapterNodes = gsap.utils.toArray(".chapter");
  chapterNodes.forEach((section) => {
    const content = section.querySelector(".chapter__content");
    const media = section.querySelector(".chapter__media img");

    if (content) {
      gsap.from(content.children, {
        autoAlpha: 0,
        y: 26,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: section,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });
    }

    if (media) {
      gsap.fromTo(
        media,
        { scale: 1.05, filter: "brightness(0.92)" },
        {
          scale: 1,
          filter: "brightness(1)",
          duration: 1.2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: section,
            start: "top 80%",
          },
        }
      );

      gsap.to(media, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    const color = section.dataset.color;
    if (color) {
      ScrollTrigger.create({
        trigger: section,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () =>
          gsap.to(document.body, {
            backgroundColor: color,
            duration: 0.8,
            ease: "power2.out",
          }),
        onEnterBack: () =>
          gsap.to(document.body, {
            backgroundColor: color,
            duration: 0.8,
            ease: "power2.out",
          }),
      });
    }
  });

  const timelineItems = document.querySelectorAll(".timeline__list li");
  if (timelineItems.length) {
    gsap.from(timelineItems, {
      autoAlpha: 0,
      x: -18,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.08,
      scrollTrigger: {
        trigger: ".timeline__list",
        start: "top 75%",
      },
    });
  }
})();
