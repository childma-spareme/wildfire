const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const desktopQuery = window.matchMedia("(min-width: 1121px)");
const CLOSE_DELAY = 450;
const SWITCH_DELAY = 350;
const CORRIDOR_PAD = 24;
let lastPointer = null;

document.addEventListener("pointermove", (event) => {
  lastPointer = { x: event.clientX, y: event.clientY };
}, { passive: true });

// While a panel is open, the strip of header between the bar and the panel top
// (as wide as the panel) counts as "inside", so moving sideways along the nav bar
// toward a far column of the mega menu does not close it.
function inCorridor(drop) {
  if (!lastPointer || !drop.classList.contains("is-open")) return false;
  const panel = drop.querySelector(".nav-panel");
  if (!panel) return false;
  const p = panel.getBoundingClientRect();
  const h = header ? header.getBoundingClientRect() : { top: 0 };
  const { x, y } = lastPointer;
  return x >= p.left - CORRIDOR_PAD && x <= p.right + CORRIDOR_PAD && y >= h.top && y <= p.top + 4;
}

if (header) {
  window.addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  }, { passive: true });
}

function dropdowns() {
  return [...document.querySelectorAll(".nav-dropdown")];
}

function setDropdown(drop, open) {
  drop.classList.toggle("is-open", open);
  const button = drop.querySelector(".nav-drop");
  if (button) button.setAttribute("aria-expanded", open ? "true" : "false");
  if (!open) delete drop.dataset.pinned;
}

const closeTimers = new WeakMap();
let switchTimer = null;
let switchTarget = null;

function cancelDropdownClose(drop) {
  const timer = closeTimers.get(drop);
  if (timer) {
    clearTimeout(timer);
    closeTimers.delete(drop);
  }
}

function cancelSwitch() {
  if (switchTimer) {
    clearTimeout(switchTimer);
    switchTimer = null;
  }
  switchTarget = null;
}

function scheduleDropdownClose(drop) {
  cancelDropdownClose(drop);
  const timer = window.setTimeout(() => {
    closeTimers.delete(drop);
    if (!desktopQuery.matches || drop.classList.contains("is-dismissed")) return;
    if (drop.matches(":hover") || drop.dataset.pressing === "true") return;
    if (inCorridor(drop)) {
      scheduleDropdownClose(drop);
      return;
    }
    delete drop.dataset.pinned;
    if (drop.contains(document.activeElement)) return;
    setDropdown(drop, false);
  }, CLOSE_DELAY);
  closeTimers.set(drop, timer);
}

function closeDropdowns(except) {
  dropdowns().forEach((drop) => {
    if (drop !== except) {
      cancelDropdownClose(drop);
      setDropdown(drop, false);
    }
  });
}

function openDropdown(drop) {
  cancelSwitch();
  cancelDropdownClose(drop);
  drop.classList.remove("is-dismissed");
  closeDropdowns(drop);
  setDropdown(drop, true);
}

function scheduleSwitch(drop) {
  if (switchTarget === drop) return;
  cancelSwitch();
  switchTarget = drop;
  switchTimer = window.setTimeout(() => {
    switchTimer = null;
    switchTarget = null;
    if (!desktopQuery.matches || !drop.matches(":hover")) return;
    openDropdown(drop);
  }, SWITCH_DELAY);
}

function setMenu(open) {
  if (!toggle || !header) return;
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  header.classList.toggle("nav-open", open);
  document.body.classList.toggle("nav-locked", open);
  const label = toggle.querySelector(".nav-toggle-label");
  if (label) label.textContent = open ? "Close" : "Menu";
  if (!open) closeDropdowns();
}

if (toggle) {
  toggle.addEventListener("click", (event) => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    setMenu(!open);
    if (!open && event.detail === 0) {
      nav?.querySelector("a, button")?.focus();
    }
  });
}

dropdowns().forEach((drop) => {
  const button = drop.querySelector(".nav-drop");
  if (!button) return;

  button.addEventListener("click", (event) => {
    const hubLink = button.matches("a[href='/who-we-help/']");
    if (hubLink && desktopQuery.matches) return;
    if (hubLink) event.preventDefault();
    cancelDropdownClose(drop);
    cancelSwitch();
    drop.classList.remove("is-dismissed");
    const open = drop.classList.contains("is-open");
    if (open) {
      setDropdown(drop, false);
      return;
    }
    openDropdown(drop);
    drop.dataset.pinned = "true";
  });

  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    openDropdown(drop);
    drop.dataset.pinned = "true";
    drop.querySelector(".nav-panel a")?.focus();
  });

  drop.addEventListener("focusin", () => {
    if (drop.classList.contains("is-dismissed") || !desktopQuery.matches) return;
    cancelDropdownClose(drop);
    setDropdown(drop, true);
  });

  drop.addEventListener("mouseenter", () => {
    if (!desktopQuery.matches) return;
    cancelDropdownClose(drop);
    drop.classList.remove("is-dismissed");
    if (drop.classList.contains("is-open")) {
      cancelSwitch();
      return;
    }
    const anotherOpen = dropdowns().some((item) => item.classList.contains("is-open"));
    if (anotherOpen) {
      scheduleSwitch(drop);
      return;
    }
    openDropdown(drop);
  });

  drop.addEventListener("mouseleave", () => {
    if (!desktopQuery.matches) return;
    if (switchTarget === drop) cancelSwitch();
    scheduleDropdownClose(drop);
  });

  drop.addEventListener("pointerdown", () => {
    drop.dataset.pressing = "true";
  });

  drop.addEventListener("pointerup", () => {
    delete drop.dataset.pressing;
  });

  drop.addEventListener("pointercancel", () => {
    delete drop.dataset.pressing;
  });

  drop.addEventListener("focusout", (event) => {
    if (drop.contains(event.relatedTarget)) return;
    if (drop.dataset.pressing === "true" || drop.matches(":hover")) return;
    if (!desktopQuery.matches) {
      setDropdown(drop, false);
      drop.classList.remove("is-dismissed");
      return;
    }
    window.setTimeout(() => {
      if (drop.dataset.pressing === "true" || drop.matches(":hover") || drop.contains(document.activeElement)) return;
      setDropdown(drop, false);
      drop.classList.remove("is-dismissed");
    }, 0);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openDrop = dropdowns().find((drop) => drop.classList.contains("is-open") || drop.contains(document.activeElement));
  if (openDrop) {
    cancelDropdownClose(openDrop);
    cancelSwitch();
    setDropdown(openDrop, false);
    openDrop.classList.add("is-dismissed");
    openDrop.querySelector(".nav-drop")?.focus();
    return;
  }
  if (toggle?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    toggle.focus();
  }
});

document.addEventListener("click", (event) => {
  if (!header || header.contains(event.target) || event.target.closest?.(".nav-dropdown")) return;
  closeDropdowns();
  if (toggle?.getAttribute("aria-expanded") === "true") setMenu(false);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (!desktopQuery.matches && !link.classList.contains("nav-drop")) setMenu(false);
  });
});

desktopQuery.addEventListener("change", () => {
  cancelSwitch();
  closeDropdowns();
  if (desktopQuery.matches) setMenu(false);
});

const path = window.location.pathname.replace(/\/index\.html$/, "").replace(/\/$/, "") || "/";
document.querySelectorAll("#site-nav a[href]").forEach((link) => {
  const href = link.getAttribute("href");
  if (!href || href.startsWith("#") || href.startsWith("/#") || href.startsWith("tel:")) return;
  const target = href.replace(/\/$/, "") || "/";
  if (target === path) link.setAttribute("aria-current", "page");
});

// Conversion tracking: tap-to-call, mailto, and lead form submits.
// Uses a beacon so the event can leave even when the browser starts a phone
// dial or navigates away to Formspree. Does not prevent default actions.
function trackGtag(name, params) {
  if (typeof gtag !== "function") return;
  gtag("event", name, params);
}

document.addEventListener("click", (event) => {
  const link = event.target.closest && event.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href") || "";
  const text = (link.textContent || "").replace(/\s+/g, " ").trim();
  if (/^tel:/i.test(href)) {
    const phoneNumber = href.replace(/^tel:/i, "").replace(/\D/g, "");
    trackGtag("phone_call", {
      link_url: href,
      phone_number: phoneNumber,
      page_location: location.pathname,
      link_text: text,
      transport_type: "beacon"
    });
    return;
  }
  if (/^mailto:/i.test(href)) {
    trackGtag("email_click", {
      link_url: href,
      page_location: location.pathname,
      link_text: text,
      transport_type: "beacon"
    });
  }
});

document.addEventListener("submit", (event) => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.id !== "lead-form" && !form.classList.contains("contact-form")) return;
  trackGtag("generate_lead", {
    form_id: form.id || "lead-form",
    page_location: location.pathname,
    transport_type: "beacon"
  });
});
