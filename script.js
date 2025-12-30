// Mobile nav toggle
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");

if (nav && navToggle) {
  navToggle.addEventListener("click", () => {
    nav.classList.toggle("open");
  });
}

// Dropdown (desktop)
const dropdown = document.querySelector(".nav-dropdown");
const dropdownToggle = document.querySelector(".nav-dropdown-toggle");

if (dropdown && dropdownToggle) {
  dropdownToggle.addEventListener("click", (e) => {
    // On mobile the dropdown is always open; only toggle for larger screens
    if (window.matchMedia("(min-width: 769px)").matches) {
      e.stopPropagation();
      dropdown.classList.toggle("open");
    }
  });

  document.addEventListener("click", (e) => {
    if (
      window.matchMedia("(min-width: 769px)").matches &&
      !dropdown.contains(e.target)
    ) {
      dropdown.classList.remove("open");
    }
  });
}

// Scroll reveal animation
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealElements.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.2,
    }
  );

  revealElements.forEach((el) => observer.observe(el));
} else {
  // Fallback: just show all
  revealElements.forEach((el) => el.classList.add("in-view"));
}

// Dynamic year in footer
const yearSpan = document.getElementById("year");
if (yearSpan) {
  yearSpan.textContent = new Date().getFullYear();
}

// Ensure the loader exists and sits above any overlays
function getOrCreateLoader() {
  let loader = document.getElementById('page-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'page-loader';
    loader.setAttribute('role', 'status');
    loader.setAttribute('aria-live', 'polite');
    loader.setAttribute('aria-busy', 'false');
    loader.setAttribute('aria-hidden', 'true');
    Object.assign(loader.style, {
      position: 'fixed',
      inset: '0',
      display: 'none',          // hidden by default
      placeItems: 'center',
      background: 'rgba(255, 255, 255, 0.85)',
      zIndex: '2147483648',     // higher than any modal
      pointerEvents: 'auto'
    });
    // Optional spinner markup (style via CSS if available)
    loader.innerHTML = '<div class="spinner" aria-hidden="true"></div>';
    document.body.appendChild(loader);
  }
  return loader;
}

function showLoader() {
  const loader = getOrCreateLoader();
  loader.classList.add('active');
  loader.setAttribute('aria-busy', 'true');
  loader.setAttribute('aria-hidden', 'false');
  // Fallback inline styles to ensure visibility on all screens
  Object.assign(loader.style, {
    display: 'grid',
    position: 'fixed',
    inset: '0',
    zIndex: '2147483648',
    pointerEvents: 'auto'
  });
}

function hideLoader() {
  const loader = document.getElementById('page-loader');
  if (loader) {
    loader.classList.remove('active');
    loader.setAttribute('aria-busy', 'false');
    loader.setAttribute('aria-hidden', 'true');
    loader.style.display = 'none';
  }
}

function setupLinkLoader() {
  // Intercept navigation to any internal page (not just .html)
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (!href) return;

      // Allow modified clicks or _blank to behave normally
      if (
        link.target === '_blank' ||
        e.ctrlKey || e.metaKey || e.shiftKey || e.altKey
      ) {
        return;
      }

      const url = new URL(href, window.location.href);
      const isExternal = url.origin !== window.location.origin;
      const isHashOnly =
        (href.startsWith('#')) ||
        (url.pathname === window.location.pathname && !!url.hash && url.search === '');

      // Skip external, mailto/tel, and same-page hash links
      if (isExternal || href.startsWith('mailto:') || href.startsWith('tel:') || isHashOnly) {
        return;
      }

      e.preventDefault();
      showLoader();

      // Small delay so the loader is visible before navigating
      setTimeout(() => {
        window.location.href = url.href;
      }, 400);
    });
  });
}

// Hide the loader when the page finishes loading resources
window.addEventListener('load', () => {
  hideLoader();
});

// Also hide after BFCache restores (Safari/Firefox)
window.addEventListener('pageshow', () => {
  hideLoader();
});

// Prepare link interception and show loader when the user leaves the page
document.addEventListener('DOMContentLoaded', () => {
  setupLinkLoader();

  window.addEventListener('beforeunload', () => {
    showLoader();
  });
});

// INSERT: Toggle small map in footer when clicking the location
// REPLACE the existing block with always-visible map setup
document.addEventListener('DOMContentLoaded', function () {
  var locationMap = document.getElementById('location-map');
  if (!locationMap) return;

  // Ensure the map is always visible under the address
  locationMap.removeAttribute('hidden');
  locationMap.style.display = 'block';

  const iframe = locationMap.querySelector('iframe');
  if (iframe) {
    iframe.style.width = '100%';
    iframe.style.height = '260px'; // adjust height to your preference
    iframe.style.display = 'block';
    iframe.style.border = '0';
  }
});

document.addEventListener('DOMContentLoaded', function () {
  var locationLink = document.getElementById('location-link') || document.getElementById('contact-location');
  var locationMap = document.getElementById('location-map');

  if (locationLink && locationMap) {
    locationLink.setAttribute('role', 'button');
    locationLink.setAttribute('aria-expanded', 'false');

    // Create modal overlay elements
    const overlay = document.createElement('div');
    overlay.id = 'map-modal-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0, 0, 0, 0.6)',
      // Center modal using CSS Grid
      display: 'none',
      zIndex: '2147483647',
      pointerEvents: 'auto',
      // Grid centering is more robust across browsers
      placeItems: 'center'
    });

    const modal = document.createElement('div');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Location map');
    Object.assign(modal.style, {
      background: '#fff',
      borderRadius: '12px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      width: 'min(900px, 90vw)',
      height: 'min(600px, 75vh)',
      maxWidth: '90vw',
      maxHeight: '75vh',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex'
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close map');
    closeBtn.innerHTML = '&times;';
    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '8px',
      right: '12px',
      fontSize: '28px',
      lineHeight: '28px',
      background: 'transparent',
      border: 'none',
      cursor: 'pointer'
    });

    const content = document.createElement('div');
    Object.assign(content.style, {
      flex: '1 1 auto',
      width: '100%',
      height: '100%'
    });

    modal.appendChild(closeBtn);
    modal.appendChild(content);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    let originalParent = null;
    let placeholder = null;

    function openModal() {
      try {
        console.log('Opening map modal');
        originalParent = locationMap.parentElement;
        placeholder = document.createElement('div');
        placeholder.style.display = 'none';
        originalParent.insertBefore(placeholder, locationMap);

        // Ensure the map is visible inside the modal
        locationMap.removeAttribute('hidden');

        // Force the map container and iframe to be visible and fill the modal
        locationMap.style.display = 'block';
        const iframe = locationMap.querySelector('iframe');
        if (iframe) {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.display = 'block';
        }

        // Ensure modal stacking and visibility
        modal.style.zIndex = '2147483647';
        overlay.style.opacity = '1';
        // Center via grid
        overlay.style.display = 'grid';
        overlay.setAttribute('aria-hidden', 'false');
        content.appendChild(locationMap);
        locationLink.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      } catch (err) {
        console.error('Map modal open failed, falling back to inline reveal', err);
        // Fallback: if something goes wrong moving the iframe, just reveal it inline
        locationMap.removeAttribute('hidden');
        locationMap.style.display = 'block';
        const iframe = locationMap.querySelector('iframe');
        if (iframe) {
          iframe.style.width = '100%';
          iframe.style.height = '220px';
          iframe.style.display = 'block';
        }
        locationMap.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    function closeModal() {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      locationLink.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';

      // Restore the map back to its original position and hide it again
      if (placeholder && originalParent) {
        originalParent.insertBefore(locationMap, placeholder);
        originalParent.removeChild(placeholder);
        locationMap.setAttribute('hidden', '');
      }
    }

    locationLink.addEventListener('click', function (e) {
      e.preventDefault();
      openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        closeModal();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.style.display === 'flex') {
        closeModal();
      }
    });
  }
});



