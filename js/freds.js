(() => {
  const year = document.getElementById("year");
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const eventsBoard = document.getElementById("eventsBoard");
  const eventsCta = document.getElementById("eventsCta");
  const hoursTable = document.getElementById("hoursTable");
  const menuSections = document.getElementById("menuSections");
  const menuSource = document.getElementById("menuSource");
  const galleryGrid = document.getElementById("galleryGrid");
  const reviewGrid = document.getElementById("reviewGrid");
  const amenityChips = document.getElementById("amenityChips");
  const crewGrid = document.getElementById("crewGrid");
  const crewHeading = document.getElementById("crewHeading");
  const crewLead = document.getElementById("crewLead");
  const crewNote = document.getElementById("crewNote");
  const announceModal = document.getElementById("announceModal");
  const announceMedia = document.getElementById("announceMedia");
  const announceEyebrow = document.getElementById("announceEyebrow");
  const announceTitle = document.getElementById("announceTitle");
  const announceBody = document.getElementById("announceBody");
  const announceCta = document.getElementById("announceCta");
  const announceLater = document.getElementById("announceLater");

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    if (!nav || !document.body.classList.contains("home")) return;
    nav.classList.toggle("is-solid", window.scrollY > 40);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (toggle && links) {
    const setOpen = (open) => {
      toggle.classList.toggle("is-open", open);
      links.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };

    toggle.addEventListener("click", () => {
      setOpen(!links.classList.contains("is-open"));
    });

    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setOpen(false));
    });
  }

  const observeReveals = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = document.querySelectorAll(".reveal:not(.is-in)");

    if (reduceMotion) {
      reveals.forEach((el) => el.classList.add("is-in"));
      return;
    }

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -4% 0px", threshold: 0.05 }
      );
      reveals.forEach((el) => io.observe(el));
      window.setTimeout(() => {
        document.querySelectorAll(".reveal:not(.is-in)").forEach((el) => el.classList.add("is-in"));
      }, 1200);
    } else {
      reveals.forEach((el) => el.classList.add("is-in"));
    }
  };

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const formatEventDate = (iso) => {
    const d = new Date(`${iso}T12:00:00`);
    if (Number.isNaN(d.getTime())) return { day: "--", month: "" };
    return { day: String(d.getDate()), month: MONTHS[d.getMonth()] };
  };

  const escapeHtml = (value) =>
    String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const loadJson = async (path) => {
    const res = await fetch(path, { cache: "no-store" });
    if (!res.ok) throw new Error("bad status");
    return res.json();
  };

  const renderEvents = (events) => {
    if (!eventsBoard) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = [...events]
      .filter((e) => {
        const d = new Date(`${e.date}T23:59:59`);
        return !Number.isNaN(d.getTime()) && d >= today;
      })
      .sort((a, b) => a.date.localeCompare(b.date));

    if (!upcoming.length) {
      eventsBoard.innerHTML = `<p class="event-empty">No upcoming events listed. Follow @fredslondon for the latest.</p>`;
      return;
    }

    eventsBoard.innerHTML = upcoming
      .map((event) => {
        const { day, month } = formatEventDate(event.date);
        return `
      <article class="event-row reveal">
        <div class="event-date">
          <span class="day">${day}</span>
          <span class="month">${month}</span>
        </div>
        <div class="event-body">
          <h3>${escapeHtml(event.title)}</h3>
          <p>${escapeHtml(event.description)}</p>
        </div>
        <div class="event-side">${escapeHtml(event.time)}</div>
      </article>`;
      })
      .join("");
  };

  const applyPlace = (place) => {
    if (hoursTable && place.hours?.length) {
      hoursTable.querySelector("tbody").innerHTML = place.hours
        .map((h) => `<tr><td>${escapeHtml(h.days)}</td><td>${escapeHtml(h.time)}</td></tr>`)
        .join("");
    }

    if (amenityChips && place.amenities?.length) {
      amenityChips.innerHTML = place.amenities
        .slice(0, 6)
        .map((a) => `<span class="chip">${escapeHtml(a)}</span>`)
        .join("");
    }
  };

  const renderGallery = (data) => {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = (data.items || [])
      .map((item) => {
        const caption = item.caption
          ? `<figcaption>${escapeHtml(item.caption)}</figcaption>`
          : "";
        return `
      <figure class="gallery-item reveal">
        <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.alt || item.caption || "")}" loading="lazy">
        ${caption}
      </figure>`;
      })
      .join("");
  };

  const renderReviews = (data) => {
    if (!reviewGrid) return;
    reviewGrid.innerHTML = (data.reviews || [])
      .slice(0, 6)
      .map(
        (r) => `
      <article class="review reveal">
        <p>“${escapeHtml(r.quote)}”</p>
        <footer>${escapeHtml(r.author)} · ${escapeHtml(r.source)}</footer>
      </article>`
      )
      .join("");
  };

  const initials = (name) => {
    const parts = String(name || "")
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "F";
    if (parts[0].toLowerCase() === "the") return parts[1]?.slice(0, 1).toUpperCase() || "B";
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() || "")
      .join("");
  };

  const renderCrew = (data) => {
    if (!crewGrid) return;
    if (crewHeading && data.heading) crewHeading.textContent = data.heading;
    if (crewLead && data.lead) crewLead.textContent = data.lead;
    if (crewNote) {
      crewNote.textContent = data.note || "";
      crewNote.hidden = !data.note;
    }

    crewGrid.innerHTML = (data.members || [])
      .map((m) => {
        const tone = m.tone === "lime" || m.tone === "sky" ? m.tone : "yellow";
        return `
      <article class="crew-card reveal">
        <div class="crew-avatar crew-avatar--${tone}" aria-hidden="true">${escapeHtml(initials(m.name))}</div>
        <div>
          <h3>${escapeHtml(m.name)}</h3>
          <p class="crew-role">${escapeHtml(m.role)}</p>
          <p>${escapeHtml(m.bio)}</p>
        </div>
      </article>`;
      })
      .join("");
  };

  const toneClass = (tone) => {
    if (tone === "lime") return "menu-section--lime";
    if (tone === "sky") return "menu-section--sky";
    return "menu-section--yellow";
  };

  const closeAnnounce = () => {
    if (!announceModal) return;
    announceModal.hidden = true;
    document.body.classList.remove("announce-open");
  };

  const openAnnounce = (data) => {
    if (!announceModal || !data?.enabled) return;
    const storageKey = `freds-announce-dismissed:${data.id || "default"}`;
    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
    } catch {
      /* private mode */
    }

    if (announceEyebrow) announceEyebrow.textContent = data.eyebrow || "New";
    if (announceTitle) announceTitle.textContent = data.title || "What's new";
    if (announceBody) announceBody.textContent = data.body || "";
    if (announceCta) {
      announceCta.textContent = data.ctaLabel || "Visit us";
      announceCta.href = data.ctaHref || "#visit";
    }
    if (announceLater) announceLater.textContent = data.secondaryLabel || "Maybe later";

    if (announceMedia) {
      announceMedia.innerHTML = (data.images || [])
        .slice(0, 2)
        .map(
          (img) => `
        <figure>
          <img src="${escapeHtml(img.src)}" alt="${escapeHtml(img.alt || "")}" loading="eager">
        </figure>`
        )
        .join("");
    }

    announceModal.hidden = false;
    document.body.classList.add("announce-open");

    const dismiss = () => {
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch {
        /* ignore */
      }
      closeAnnounce();
    };

    announceModal.querySelectorAll("[data-announce-close]").forEach((el) => {
      el.addEventListener("click", dismiss, { once: true });
    });

    announceCta?.addEventListener(
      "click",
      () => {
        try {
          sessionStorage.setItem(storageKey, "1");
        } catch {
          /* ignore */
        }
        closeAnnounce();
      },
      { once: true }
    );

    const onKey = (e) => {
      if (e.key === "Escape") {
        dismiss();
        window.removeEventListener("keydown", onKey);
      }
    };
    window.addEventListener("keydown", onKey);
  };

  const renderMenu = (data) => {
    if (!menuSections) return;
    if (menuSource && data.sourceNote) menuSource.textContent = data.sourceNote;

    menuSections.innerHTML = (data.categories || [])
      .map((cat) => {
        const layout = cat.layout || "grid";
        let body = "";

        if (layout === "list") {
          const featured = cat.featuredImage
            ? `<div class="menu-featured"><img src="${escapeHtml(cat.featuredImage)}" alt="${escapeHtml(cat.title)}" loading="lazy"></div>`
            : "";
          body = `${featured}<div class="menu-list">${(cat.items || [])
            .map((item) => `<div class="menu-row">${escapeHtml(item.name)}</div>`)
            .join("")}</div>`;
        } else {
          body = `<div class="menu-grid">${(cat.items || [])
            .map((item) => {
              const img = item.image
                ? `<div class="menu-img"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}" loading="lazy"></div>`
                : `<div class="menu-img" aria-hidden="true"></div>`;
              return `<article class="menu-item">${img}<div class="menu-name">${escapeHtml(item.name)}</div></article>`;
            })
            .join("")}</div>`;
        }

        return `
      <section class="menu-section ${toneClass(cat.tone)} reveal" id="menu-${escapeHtml(cat.id)}">
        <h2>${escapeHtml(cat.title)}</h2>
        ${body}
      </section>`;
      })
      .join("");
  };

  const boot = async () => {
    try {
      const place = await loadJson("data/place.json");
      applyPlace(place);
    } catch {
      /* keep defaults */
    }

    try {
      const crew = await loadJson("data/crew.json");
      renderCrew(crew);
    } catch {
      /* optional */
    }

    try {
      const gallery = await loadJson("data/gallery.json");
      renderGallery(gallery);
    } catch {
      /* optional */
    }

    try {
      const reviews = await loadJson("data/reviews.json");
      renderReviews(reviews);
    } catch {
      /* optional */
    }

    try {
      const eventsData = await loadJson("data/events.json");
      renderEvents(eventsData.events || []);
      if (eventsCta && eventsData.cta?.href) {
        eventsCta.href = eventsData.cta.href;
        if (eventsData.cta.label) eventsCta.textContent = eventsData.cta.label;
      }
    } catch {
      if (eventsBoard) {
        eventsBoard.innerHTML = `<p class="event-empty">Follow @fredslondon for upcoming community events.</p>`;
      }
    }

    try {
      const menuData = await loadJson("data/menu.json");
      renderMenu(menuData);
    } catch {
      if (menuSections) {
        menuSections.innerHTML = `<p class="event-empty">Menu details coming soon. Ask at the counter or DM @fredslondon.</p>`;
      }
    }

    if (document.body.classList.contains("home")) {
      try {
        const announcement = await loadJson("data/announcement.json");
        window.setTimeout(() => openAnnounce(announcement), 700);
      } catch {
        /* optional */
      }
    }

    observeReveals();
  };

  observeReveals();
  boot();
})();
