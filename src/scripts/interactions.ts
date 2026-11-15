export function initInteractions() {
  const isReduced = () =>
    document.documentElement.classList.contains('reduce-motion') ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Split-flap animation for hero text (Section 7.1)
  if (!isReduced()) {
    const splitFlapElements = document.querySelectorAll<HTMLElement>('.split-flap-target');
    splitFlapElements.forEach((el) => {
      const originalText = el.textContent || '';
      el.innerHTML = '';
      Array.from(originalText).forEach((char, index) => {
        const span = document.createElement('span');
        span.className = 'inline-block';
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.animation = `split-flap-flip 0.5s ease-out ${index * 30}ms forwards`;
        el.appendChild(span);
      });
    });
  }

  // 2. Station reveals in Express Mode via IntersectionObserver (Section 7.2)
  if (!isReduced()) {
    const stations = document.querySelectorAll('section[id^="station-"]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const dot = el.querySelector('.station-dot');
            const ticket = el.querySelector('.ticket');

            if (dot) {
              dot.animate(
                [
                  { transform: 'scale(0.6)', opacity: '0.5' },
                  { transform: 'scale(1.15)', opacity: '1' },
                  { transform: 'scale(1)', opacity: '1' },
                ],
                { duration: 400, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
              );
            }

            if (ticket) {
              ticket.animate(
                [
                  { transform: 'translateY(16px)', opacity: '0.6' },
                  { transform: 'translateY(0)', opacity: '1' },
                ],
                { duration: 450, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' }
              );
            }

            // Update tab title in Express mode: "Next stop: ..." (Section 7.7)
            const mode = document.body.getAttribute('data-mode');
            if (mode === 'express') {
              const h2 = el.querySelector('h2');
              if (h2) {
                document.title = `Next stop: ${h2.textContent?.trim()} — The Yug Line`;
              }
            }
          }
        });
      },
      { threshold: 0.25 }
    );

    stations.forEach((st) => observer.observe(st));
  }

  // 3. View Transitions API Theme Switch (Section 7.6)
  const themeToggle = document.getElementById('theme-toggle');
  const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

  const executeThemeToggle = () => {
    const toggle = () => {
      const isCurrentlyDark = document.documentElement.classList.contains('dark');
      const nextState = !isCurrentlyDark;
      if (nextState) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      try {
        localStorage.setItem('yugline_theme', nextState ? 'dark' : 'light');
      } catch (err) {}
    };

    if (!isReduced() && (document as any).startViewTransition) {
      (document as any).startViewTransition(() => toggle());
    } else {
      toggle();
    }
  };

  if (themeToggle) {
    themeToggle.onclick = (e) => {
      e.preventDefault();
      executeThemeToggle();
    };
  }
  if (mobileThemeToggle) {
    mobileThemeToggle.onclick = (e) => {
      e.preventDefault();
      executeThemeToggle();
    };
  }

  // 4. Keyboard Shortcuts Navigation (Section 6 & 11)
  const stationHashes = [
    '#base',
    '#board',
    '#ghumify',
    '#projects',
    '#crew',
    '#legend',
    '#education',
    '#contact',
  ];

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    // Ignore keystrokes when focus is in an input or editable field
    const active = document.activeElement;
    if (
      active &&
      (active.tagName === 'INPUT' ||
        active.tagName === 'TEXTAREA' ||
        active.tagName === 'SELECT' ||
        active.isContentEditable)
    ) {
      return;
    }

    // Ignore if Ctrl, Alt or Meta is held
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    if (e.key === 'd' || e.key === 'D') {
      const dayPassBtn =
        document.getElementById('day-pass-btn') ||
        document.getElementById('day-pass-header-btn');
      if (dayPassBtn) dayPassBtn.click();
    } else if (e.key === 'm' || e.key === 'M') {
      const motionBtn = document.getElementById('motion-toggle');
      if (motionBtn) motionBtn.click();
    } else if (e.key === 's' || e.key === 'S') {
      const soundBtn = document.getElementById('sound-toggle');
      if (soundBtn) soundBtn.click();
    } else if (e.key === 't' || e.key === 'T') {
      const cardBtn = document.getElementById('travel-card-btn');
      if (cardBtn) cardBtn.click();
    } else if (e.key === 'Escape') {
      const sheet = document.getElementById('all-stops-sheet');
      if (sheet && sheet.style.display !== 'none') {
        sheet.style.display = 'none';
      }
      const modal = document.getElementById('travel-card-modal');
      if (modal && !modal.classList.contains('hidden')) {
        const closeBtn = document.getElementById('travel-card-close');
        if (closeBtn) closeBtn.click();
      }
    } else if (e.key >= '1' && e.key <= '8') {
      const idx = parseInt(e.key, 10) - 1;
      const hash = stationHashes[idx];
      if (hash) {
        window.location.hash = hash;
      }
    }
  });
}
