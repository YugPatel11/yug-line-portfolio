export type LineId = 'frontend' | 'backend' | 'ai' | 'hardware';

export interface LineInfo {
  id: LineId;
  name: string;
  colorVar: string;
}

export interface ProfileData {
  name: string;
  role: string;
  tagline: string;
  status: string;
  experienceYears: string;
  grantTotal: string;
  leadershipRole: string;
  education: {
    degree: string;
    institution: string;
    period: string;
    semester: string;
    cgpaYear1: string;
    cgpaYear2: string;
    focus: string;
  };
  contacts: {
    emailLink: string;
    whatsappLink: string;
    linkedin: string;
    github: string;
    instagram: string;
    resumeUrl: string;
  };
}

export interface AchievementItem {
  id: string;
  title: string;
  subtitle: string;
  statusTag: 'WINNER' | 'TOP 10' | '1ST PRIZE' | 'RECOGNITION' | 'FINALIST';
  metricNumber?: number;
  metricSuffix?: string;
  metricLabel?: string;
  details: string;
  institution: string;
  externalLink?: string;
  externalLinkText?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  lines: LineId[];
  techStack: string[];
  grantAmount?: string;
  pictogram: string;
  featured: boolean;
  liveUrl?: string;
  repoUrl?: string;
  prototypeUrl?: string;
  hasDetailModal?: boolean;
}

export interface ExperienceItem {
  role: string;
  organization: string;
  period?: string;
  type: string;
  highlights: string[];
  links?: { label: string; url: string }[];
}

export interface TechGroup {
  lineId: LineId;
  category: string;
  items: string[];
}
