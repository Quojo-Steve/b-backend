/**
 * Press releases are content items that are publicly readable but managed by
 * web managers or super admins. They have their own lifecycle and storage
 * so they don't conflate with the news feed or newsletter email campaigns.
 */
export enum PressReleaseStatus {
  PUBLISHED = 'published',
  DISABLED = 'disabled',
}

export interface IPressRelease {
  id: string;
  title: string;
  titleFr?: string;
  summary?: string;
  summaryFr?: string;
  documentUrl?: string;
  documentName?: string;
  status: PressReleaseStatus;
  releaseDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
