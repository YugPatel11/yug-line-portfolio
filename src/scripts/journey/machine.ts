import type { JourneyMode, SimplifiedStep, StationCode, TicketData } from './types';
import { STATIONS, HASH_TO_STATION, STATION_ORDER } from './constants';
import { metroSound } from '../sound/metroSound';

export class JourneyStateMachine {
  private mode: JourneyMode = 'journey';
  private step: SimplifiedStep = 'choose';
  private selectedStation: StationCode = 'station-02';
  private currentStop: StationCode = 'station-00';
  private visited: Set<StationCode> = new Set(['station-00']);
  private announcerEl: HTMLElement | null = null;
  private decisionBarEl: HTMLElement | null = null;
  private stopIndicatorBar: HTMLElement | null = null;
  private stationSections: HTMLElement[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.announcerEl = document.getElementById('journey-announcer');
    this.decisionBarEl = document.getElementById('journey-decision-bar');
    this.stopIndicatorBar = document.getElementById('journey-stop-indicator-bar');
    this.stationSections = Array.from(document.querySelectorAll('section[id^="station-"]'));

    // Restore visited stops
    try {
      const stored = localStorage.getItem('yugline_visited');
      if (stored) {
        const arr = JSON.parse(stored) as StationCode[];
        arr.forEach((s) => this.visited.add(s));
      }
    } catch (e) {}

    // Check mode preference
    let initialMode: JourneyMode = 'journey';
    try {
      const storedMode = sessionStorage.getItem('yugline_mode');
      if (storedMode === 'express') {
        initialMode = 'express';
      }
    } catch (e) {}

    // Check hash for direct deep links (Section 1.3: deep links open directly with no ticket)
    const hash = window.location.hash.toLowerCase();
    if (hash && HASH_TO_STATION[hash] && HASH_TO_STATION[hash] !== 'station-00') {
      this.currentStop = HASH_TO_STATION[hash];
      this.visited.add(this.currentStop);
      this.mode = 'journey';
      this.step = 'stop';
      this.setMode('journey');
      this.showStopScreen(this.currentStop, false);
    } else {
      this.setMode(initialMode);
      if (initialMode === 'journey') {
        this.setStep('choose');
      }
    }

    // Bind hash changes
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.toLowerCase();
      if (newHash && HASH_TO_STATION[newHash]) {
        const target = HASH_TO_STATION[newHash];
        if (target === 'station-00') {
          this.backToStart();
        } else {
          this.navigateToStation(target, false);
        }
      }
    });

    this.bindDOMEvents();
  }

  public setMode(newMode: JourneyMode) {
    this.mode = newMode;
    document.body.setAttribute('data-mode', newMode);

    try {
      sessionStorage.setItem('yugline_mode', newMode);
    } catch (e) {}

    const dayPassBtns = document.querySelectorAll('.day-pass-toggle-btn');

    if (newMode === 'express') {
      // Express Mode: show all stations, remove inert
      this.stationSections.forEach((sec) => {
        sec.style.display = 'block';
        (sec as any).inert = false;
      });

      // Hide journey step panels & decision bars
      this.hideElement('journey-flow-wrapper');
      this.hideElement('journey-step-choose');
      this.hideElement('journey-step-ticket');
      this.hideElement('journey-step-gate');
      if (this.decisionBarEl) this.decisionBarEl.style.display = 'none';
      if (this.stopIndicatorBar) this.stopIndicatorBar.style.display = 'none';

      dayPassBtns.forEach((btn) => {
        btn.textContent = 'Switch to Journey Mode ➔';
        btn.setAttribute('aria-label', 'Switch to interactive Journey Mode');
      });

      this.announce('Express Mode active. All stops are visible in order.');
    } else {
      dayPassBtns.forEach((btn) => {
        btn.textContent = 'Skip the metro · see everything';
        btn.setAttribute('aria-label', 'Skip the metro · see everything');
      });

      if (this.step === 'stop') {
        this.hideElement('journey-flow-wrapper');
        this.showStopScreen(this.currentStop, false);
      } else {
        this.showElement('journey-flow-wrapper');
        this.setStep(this.step);
      }
    }
  }

  public setStep(step: SimplifiedStep) {
    this.step = step;

    // In journey mode, hide all station sections during steps 1-3
    if (step !== 'stop') {
      this.showElement('journey-flow-wrapper');
      this.stationSections.forEach((sec) => {
        sec.style.display = 'none';
        (sec as any).inert = true;
      });
      if (this.decisionBarEl) this.decisionBarEl.style.display = 'none';
      if (this.stopIndicatorBar) this.stopIndicatorBar.style.display = 'none';
    } else {
      this.hideElement('journey-flow-wrapper');
    }

    if (step === 'choose') {
      this.showElement('journey-step-choose');
      this.hideElement('journey-step-ticket');
      this.hideElement('journey-step-gate');
      this.announce('Step 1 of 3: Choose a stop.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const h = document.getElementById('choose-stop-heading');
      if (h) h.focus();
    } else if (step === 'ticket') {
      this.hideElement('journey-step-choose');
      this.showElement('journey-step-ticket');
      this.hideElement('journey-step-gate');
      this.populateTicketCard();
      this.announce('Step 2 of 3: Your ticket. Ready to proceed to gate.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const h = document.getElementById('ticket-step-heading');
      if (h) h.focus();
    } else if (step === 'gate') {
      this.hideElement('journey-step-choose');
      this.hideElement('journey-step-ticket');
      this.showElement('journey-step-gate');
      this.announce('Step 3 of 3: Scan your ticket to open the platform barrier.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      const h = document.getElementById('gate-step-heading');
      if (h) h.focus();
    }
  }

  // Station Choice Handler (Step 1 -> Step 2)
  public selectDestination(stationId: StationCode) {
    this.selectedStation = stationId;

    // Audio printer click
    metroSound.printer();

    // Check if repeat trip with Tap & Go (already visited)
    if (this.visited.has(stationId) && stationId !== 'station-00') {
      // Tap & Go direct jump to cinematic metro
      this.launchCinematicMetro(stationId);
      return;
    }

    this.setStep('ticket');
  }

  // Populate Ticket Card
  private async populateTicketCard() {
    const meta = STATIONS[this.selectedStation];
    if (!meta) return;

    const titleEl = document.getElementById('ticket-destination-title');
    const codeEl = document.getElementById('ticket-destination-code');
    const pnrEl = document.getElementById('ticket-pnr-val');
    const dateEl = document.getElementById('ticket-date-val');
    const bandEl = document.getElementById('ticket-line-band');
    const qrCanvas = document.getElementById('ticket-qr-code') as HTMLCanvasElement | null;

    if (titleEl) titleEl.textContent = meta.name.toUpperCase();
    if (codeEl) codeEl.textContent = meta.code;
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    if (pnrEl) pnrEl.textContent = pnr;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
    if (dateEl) dateEl.textContent = dateStr;

    if (bandEl) {
      const color = meta.line === 'ai' ? 'var(--line-ai)' :
                    meta.line === 'frontend' ? 'var(--line-frontend)' :
                    meta.line === 'backend' ? 'var(--line-backend)' :
                    meta.line === 'hardware' ? 'var(--line-hardware)' : 'var(--ink)';
      bandEl.style.backgroundColor = color;
    }

    // Lazy load QR code library
    if (qrCanvas) {
      try {
        const QRCode = await import('qrcode');
        const deepLink = `${window.location.origin}/#${meta.alias}`;
        await QRCode.toCanvas(qrCanvas, deepLink, {
          width: 56,
          margin: 1,
          color: { dark: '#111111', light: '#F4F1EA' },
        });
      } catch (e) {}
    }
  }

  // Launch Full-Screen Cinematic Metro (Step 4)
  public launchCinematicMetro(targetId?: StationCode) {
    const stationId = targetId || this.selectedStation;
    if ((window as any).__launchMetroCinematic) {
      (window as any).__launchMetroCinematic(stationId);
    } else {
      this.arriveAtStation(stationId);
    }
  }

  // Arrival at Station (Step 5)
  public arriveAtStation(stationId: StationCode) {
    this.currentStop = stationId;
    this.visited.add(stationId);

    try {
      localStorage.setItem('yugline_visited', JSON.stringify(Array.from(this.visited)));
    } catch (e) {}

    const meta = STATIONS[stationId];
    if (meta) {
      history.pushState(null, '', `#${meta.alias}`);
      document.title = meta.pageTitle;
    }

    this.showStopScreen(stationId, true);
  }

  // Render Stop Content with Top Indicator and Bottom Decision Bar
  private showStopScreen(stationId: StationCode, announceArrival: boolean = true) {
    this.step = 'stop';

    // Hide journey step panels
    this.hideElement('journey-step-choose');
    this.hideElement('journey-step-ticket');
    this.hideElement('journey-step-gate');

    // Show only active station
    this.stationSections.forEach((sec) => {
      if (sec.id === stationId) {
        sec.style.display = 'block';
        (sec as any).inert = false;
      } else {
        sec.style.display = 'none';
        (sec as any).inert = true;
      }
    });

    const meta = STATIONS[stationId];
    const currentIndex = STATION_ORDER.indexOf(stationId);
    const stopNumber = Math.max(1, currentIndex);

    // Slim top bar
    if (this.stopIndicatorBar) {
      this.stopIndicatorBar.style.display = 'flex';
      const label = document.getElementById('journey-stop-location-label');
      if (label && meta) {
        label.textContent = `You are at: ${meta.name} · Stop ${stopNumber} of 7`;
      }
    }

    // Fixed bottom decision bar
    if (this.decisionBarEl) {
      this.decisionBarEl.style.display = 'flex';
      this.updateDecisionBar();
    }

    if (announceArrival && meta) {
      this.announce(`Arrived at ${meta.name}. Stop ${stopNumber} of 7.`);
    }

    // Scroll to top and focus heading
    window.scrollTo({ top: 0, behavior: 'instant' as any });
    setTimeout(() => {
      const heading = document.getElementById(`heading-${stationId.replace('station-', 'st-')}`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }, 120);
  }

  // Update Decision Bar Labels (Section 5.4: Next: X →, Back to start, All stops)
  private updateDecisionBar() {
    const currentIndex = STATION_ORDER.indexOf(this.currentStop);
    const nextIndex = (currentIndex + 1) % STATION_ORDER.length;
    // Skip base station 00 for next stop
    const effectiveNext = nextIndex === 0 ? STATION_ORDER[1] : STATION_ORDER[nextIndex];
    const nextMeta = STATIONS[effectiveNext];

    const nextLabel = document.getElementById('decision-next-label');
    const restartBtn = document.getElementById('decision-restart-btn');
    const nextBtn = document.getElementById('decision-next-btn');

    if (this.currentStop === 'station-07') {
      // Last station: show Back to start and Restart
      if (nextBtn) nextBtn.style.display = 'none';
      if (restartBtn) restartBtn.classList.remove('hidden');
    } else {
      if (nextBtn) nextBtn.style.display = 'inline-flex';
      if (restartBtn) restartBtn.classList.add('hidden');
      if (nextLabel && nextMeta) {
        nextLabel.textContent = `Next: ${nextMeta.name.split('—')[0].trim()} →`;
      }
    }
  }

  // Next Station Action
  public nextStation() {
    const currentIndex = STATION_ORDER.indexOf(this.currentStop);
    const nextIndex = (currentIndex + 1) % STATION_ORDER.length;
    const nextId = nextIndex === 0 ? STATION_ORDER[1] : STATION_ORDER[nextIndex];
    this.selectedStation = nextId;
    this.launchCinematicMetro(nextId);
  }

  // Back to start (Returns to Step 1 Choose a stop)
  public backToStart() {
    if (this.mode === 'express') {
      const st00 = document.getElementById('station-00');
      if (st00) {
        st00.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    history.pushState(null, '', '#base');
    document.title = 'The Yug Line — Transit Map Portfolio';
    this.setStep('choose');
  }

  public navigateToStation(stationId: StationCode, updateHash: boolean = true) {
    this.selectedStation = stationId;
    this.launchCinematicMetro(stationId);
  }

  public announce(msg: string) {
    if (this.announcerEl) {
      this.announcerEl.textContent = msg;
    }
  }

  private showElement(id: string) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
  }

  private hideElement(id: string) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  }

  // Bind DOM Event Listeners
  private bindDOMEvents() {
    // 1. Day Pass Toggle (Skip the metro · see everything)
    document.querySelectorAll('.day-pass-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextMode = this.mode === 'journey' ? 'express' : 'journey';
        this.setMode(nextMode);
      });
    });

    // 1b. Hero Origin Choose Stop Button
    const heroChooseBtn = document.getElementById('hero-choose-stop-btn');
    if (heroChooseBtn) {
      heroChooseBtn.addEventListener('click', () => {
        if (this.mode === 'express') {
          this.setMode('journey');
        }
        this.setStep('choose');
      });
    }

    // 2. Destination Buttons (Step 1)
    document.querySelectorAll('.destination-choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-station-id') as StationCode;
        if (id) this.selectDestination(id);
      });
    });

    // 3. Ticket Screen Buttons (Step 2)
    const proceedGateBtn = document.getElementById('ticket-proceed-gate-btn');
    const changeStopBtn = document.getElementById('ticket-change-stop-btn');

    if (proceedGateBtn) {
      proceedGateBtn.addEventListener('click', () => {
        this.setStep('gate');
      });
    }
    if (changeStopBtn) {
      changeStopBtn.addEventListener('click', () => {
        this.setStep('choose');
      });
    }

    // 4. Decision Bar Buttons (Step 5)
    const backBtn = document.getElementById('decision-base-btn');
    const nextBtn = document.getElementById('decision-next-btn');
    const restartBtn = document.getElementById('decision-restart-btn');

    if (backBtn) {
      backBtn.addEventListener('click', () => this.backToStart());
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextStation());
    }
    if (restartBtn) {
      restartBtn.addEventListener('click', () => this.backToStart());
    }
  }
}

