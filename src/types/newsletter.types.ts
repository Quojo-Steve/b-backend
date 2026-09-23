export interface INewsletter {
  id: string;
  title: string;
  bodyHtml: string;
  createdBy: string; // id of the admin/web-manager who created it
  sentAt?: string; // ISO timestamp; undefined until actually sent
  createdAt: string;
}

export interface INewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean; // false after unsubscribe, without deleting history
}
