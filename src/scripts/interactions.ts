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
  if (themeToggle) {
    themeToggle.onclick = (e) => {
      const toggle = () => {
        document.documentElement.classList.toggle('dark');
        try {
          const isDark = document.documentElement.classList.contains('dark');
          localStorage.setItem('yugline_theme', isDark ? 'dark' : 'light');
        } catch (err) {}
      };

      if (!isReduced() && (document as any).startViewTransition) {
        (document as any).startViewTransition(() => toggle());
      } else {
        toggle();
      }
    };
  }
}
