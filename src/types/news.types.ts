/**
 * News is a CMS-style content type (web manager posts updates, e.g. the
 * homepage news feed) - deliberately separate from Newsletter, which is
 * an email campaign sent to subscribers. The two share no code.
 */
export enum NewsStatus {
  PUBLISHED = 'published',
  DISABLED = 'disabled', // replaces delete - history/audit trail is preserved
}

export interface INews {
  id: string;
  title: string;
  titleFr: string;
  tag: string; // e.g. "Tanzania", "Programme"
  tagFr: string;
  pillar: string; // e.g. "Country support", "Training"
  pillarFr: string;
  note: string; // short summary shown on the card
  noteFr: string;
  body?: string;
  bodyFr?: string;
  imageUrl?: string; // relative URL under /uploads, e.g. "/uploads/news/172-abc.jpg"
  status: NewsStatus;
  publishedDate: string; // ISO date - the front-end-facing "date" field; admin-settable
  createdBy: string; // id of the admin/web-manager who created it
  createdAt: string;
  updatedAt: string;
}