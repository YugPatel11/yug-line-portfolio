export type JourneyMode = 'journey' | 'express';

export type SimplifiedStep =
  | 'welcome'
  | 'choose'
  | 'ticket'
  | 'gate'
  | 'metro'
  | 'stop';

export type JourneyState =
  | 'welcome'
  | 'concourse'
  | 'window'
  | 'in-hand'
  | 'gate'
  | 'platform'
  | 'ride'
  | 'arrival'
  | 'station';

export type StationCode =
  | 'station-00'
  | 'station-01'
  | 'station-02'
  | 'station-03'
  | 'station-04'
  | 'station-05'
  | 'station-06'
  | 'station-07';

export interface StationMeta {
  id: StationCode;
  code: string;
  name: string;
  alias: string;
  teaser: string;
  pageTitle: string;
  line: 'frontend' | 'backend' | 'ai' | 'hardware' | 'central';
}

export interface TicketData {
  pnr: string;
  from: string;
  to: string;
  stationId: StationCode;
  date: string;
  time: string;
  fare: string;
  qrUrl: string;
  stamped?: boolean;
}
