import type { JourneyMode, JourneyState, StationCode, TicketData } from './types';
import { STATIONS, HASH_TO_STATION, STATION_ORDER } from './constants';

export class JourneyStateMachine {
  private mode: JourneyMode = 'express';
  private state: JourneyState = 'concourse';
  private currentStation: StationCode = 'station-00';
  private visited: Set<StationCode> = new Set(['station-00']);
  private hasTravelCard: boolean = false;
  private currentTicket: TicketData | null = null;
  private announcerEl: HTMLElement | null = null;
  private decisionBarEl: HTMLElement | null = null;
  private stationSections: HTMLElement[] = [];

  constructor() {
    this.init();
  }

  private init() {
    this.announcerEl = document.getElementById('journey-announcer');
    this.decisionBarEl = document.getElementById('journey-decision-bar');
    this.stationSections = Array.from(document.querySelectorAll('section[id^="station-"]'));

    // Check stored Travel Card status
    try {
      if (localStorage.getItem('yugline_travel_card') === 'true') {
        this.hasTravelCard = true;
      }
      const visitedJson = localStorage.getItem('yugline_visited');
      if (visitedJson) {
        const arr = JSON.parse(visitedJson) as StationCode[];
        arr.forEach((s) => this.visited.add(s));
      }
    } catch (e) {}

    // Check preferred mode
    let initialMode: JourneyMode = 'journey';
    try {
      const storedMode = sessionStorage.getItem('yugline_mode');
      if (storedMode === 'express') {
        initialMode = 'express';
      }
    } catch (e) {}

    // Check URL hash
    const hash = window.location.hash.toLowerCase();
    if (hash && HASH_TO_STATION[hash]) {
      this.currentStation = HASH_TO_STATION[hash];
      this.visited.add(this.currentStation);
    }

    this.setMode(initialMode);

    // Bind hash change listener
    window.addEventListener('hashchange', () => {
      const newHash = window.location.hash.toLowerCase();
      if (newHash && HASH_TO_STATION[newHash]) {
        this.navigateToStation(HASH_TO_STATION[newHash], false);
      }
    });

    this.bindControls();
  }

  public setMode(newMode: JourneyMode) {
    this.mode = newMode;
    document.body.setAttribute('data-mode', newMode);

    try {
      sessionStorage.setItem('yugline_mode', newMode);
    } catch (e) {}

    if (newMode === 'express') {
      this.enableExpressMode();
    } else {
      this.enableJourneyMode();
    }
  }

  private enableExpressMode() {
    // Show all stations, remove inert
    this.stationSections.forEach((sec) => {
      sec.style.display = '';
      (sec as any).inert = false;
    });

    if (this.decisionBarEl) {
      this.decisionBarEl.style.display = 'none';
    }

    const dayPassBtns = document.querySelectorAll('.day-pass-toggle-btn');
    dayPassBtns.forEach((btn) => {
      btn.textContent = 'Switch to Journey Mode ➔';
      btn.setAttribute('aria-label', 'Switch to interactive Journey Mode');
    });

    this.announce('Express Mode active. All stations are visible in order.');
  }

  private enableJourneyMode() {
    this.renderCurrentStation();

    const dayPassBtns = document.querySelectorAll('.day-pass-toggle-btn');
    dayPassBtns.forEach((btn) => {
      btn.textContent = 'Day Pass — skip booking';
      btn.setAttribute('aria-label', 'Day Pass — Switch to full scrolling page');
    });

    if (this.decisionBarEl) {
      this.decisionBarEl.style.display = 'flex';
    }

    this.updateDecisionBar();
  }

  public navigateToStation(stationId: StationCode, updateHash: boolean = true) {
    this.currentStation = stationId;
    this.visited.add(stationId);

    try {
      localStorage.setItem('yugline_visited', JSON.stringify(Array.from(this.visited)));
      if (this.visited.size > 1) {
        localStorage.setItem('yugline_travel_card', 'true');
        this.hasTravelCard = true;
      }
    } catch (e) {}

    const meta = STATIONS[stationId];
    if (updateHash && meta) {
      history.pushState(null, '', `#${meta.alias}`);
    }

    document.title = meta ? meta.pageTitle : 'The Yug Line';

    if (this.mode === 'journey') {
      this.renderCurrentStation();
      this.announce(`Arrived at Station ${meta?.code || stationId}, ${meta?.name || ''}`);
      this.focusStationHeading(stationId);
    } else {
      // In express mode, scroll to station
      const el = document.getElementById(stationId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        this.focusStationHeading(stationId);
      }
    }

    this.updateDecisionBar();
  }

  private renderCurrentStation() {
    this.stationSections.forEach((sec) => {
      if (sec.id === this.currentStation) {
        sec.style.display = 'block';
        (sec as any).inert = false;
      } else {
        sec.style.display = 'none';
        (sec as any).inert = true;
      }
    });
  }

  private focusStationHeading(stationId: StationCode) {
    setTimeout(() => {
      const heading = document.getElementById(`heading-${stationId.replace('station-', 'st-')}`);
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }, 100);
  }

  private updateDecisionBar() {
    if (!this.decisionBarEl) return;

    const currentIndex = STATION_ORDER.indexOf(this.currentStation);
    const nextStation = STATION_ORDER[(currentIndex + 1) % STATION_ORDER.length];
    const nextMeta = STATIONS[nextStation];

    const nextBtn = document.getElementById('decision-next-btn');
    if (nextBtn && nextMeta) {
      if (this.currentStation === 'station-07') {
        nextBtn.innerHTML = `<span>Restart Journey (00)</span> <span>➔</span>`;
        nextBtn.setAttribute('data-target', 'station-00');
      } else {
        nextBtn.innerHTML = `<span>Next Station: ${nextMeta.code} · ${nextMeta.name}</span> <span>➔</span>`;
        nextBtn.setAttribute('data-target', nextStation);
      }
    }

    // Ghumify "Change Line" button visibility
    const changeLineBtn = document.getElementById('decision-change-line-btn');
    if (changeLineBtn) {
      if (this.currentStation === 'station-02') {
        changeLineBtn.classList.remove('hidden');
      } else {
        changeLineBtn.classList.add('hidden');
      }
    }

    // Travel card progress indicator
    const cardChip = document.getElementById('travel-card-chip');
    if (cardChip) {
      cardChip.textContent = `${this.visited.size} / 8 Stops`;
    }
  }

  public announce(message: string) {
    if (this.announcerEl) {
      this.announcerEl.textContent = message;
    }
  }

  private bindControls() {
    // Day Pass toggles
    document.querySelectorAll('.day-pass-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nextMode = this.mode === 'journey' ? 'express' : 'journey';
        this.setMode(nextMode);
      });
    });

    // Next Station button in decision bar
    const nextBtn = document.getElementById('decision-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const target = nextBtn.getAttribute('data-target') as StationCode;
        if (target) {
          this.navigateToStation(target);
        }
      });
    }

    // Back to Base button
    const baseBtn = document.getElementById('decision-base-btn');
    if (baseBtn) {
      baseBtn.addEventListener('click', () => {
        this.navigateToStation('station-00');
      });
    }

    // Ghumify "Change Line" action
    const changeLineBtn = document.getElementById('decision-change-line-btn');
    if (changeLineBtn) {
      changeLineBtn.addEventListener('click', () => {
        this.navigateToStation('station-03');
      });
    }
  }
}
