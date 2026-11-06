const header = document.querySelector(".site-header");
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");
const desktopQuery = window.matchMedia("(min-width: 1121px)");

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

function closeDropdowns(except) {
  dropdowns().forEach((drop) => {
    if (drop !== except) setDropdown(drop, false);
  });
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

  button.addEventListener("click", () => {
    drop.classList.remove("is-dismissed");
    const open = drop.classList.contains("is-open");
    closeDropdowns(open ? null : drop);
    setDropdown(drop, !open);
    if (!open) drop.dataset.pinned = "true";
  });

  button.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowDown") return;
    event.preventDefault();
    drop.classList.remove("is-dismissed");
    closeDropdowns(drop);
    setDropdown(drop, true);
    drop.dataset.pinned = "true";
    drop.querySelector(".nav-panel a")?.focus();
  });

  drop.addEventListener("focusin", () => {
    if (drop.classList.contains("is-dismissed") || !desktopQuery.matches) return;
    button.setAttribute("aria-expanded", "true");
  });

  drop.addEventListener("mouseenter", () => {
    if (!desktopQuery.matches) return;
    drop.classList.remove("is-dismissed");
    if (dropdowns().some((item) => item.dataset.pinned === "true" && item !== drop)) return;
    closeDropdowns(drop);
    setDropdown(drop, true);
  });

  drop.addEventListener("mouseleave", () => {
    if (!desktopQuery.matches) return;
    drop.classList.remove("is-dismissed");
    delete drop.dataset.pinned;
    if (drop.contains(document.activeElement)) return;
    setDropdown(drop, false);
  });

  drop.addEventListener("focusout", (event) => {
    if (drop.contains(event.relatedTarget)) return;
    setDropdown(drop, false);
    drop.classList.remove("is-dismissed");
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const openDrop = dropdowns().find((drop) => drop.classList.contains("is-open") || drop.contains(document.activeElement));
  if (openDrop) {
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
  if (!header || header.contains(event.target)) return;
  closeDropdowns();
  if (toggle?.getAttribute("aria-expanded") === "true") setMenu(false);
});

nav?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    if (!desktopQuery.matches) setMenu(false);
  });
});

desktopQuery.addEventListener("change", () => {
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
