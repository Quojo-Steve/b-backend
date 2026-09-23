export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Persistence-style swappable abstraction for sending email, mirroring
 * how IUserRepository lets the app run against in-memory data or MySQL
 * with no other code changing. NewsletterService depends only on this
 * interface; the composition root decides which implementation to
 * construct based on whether SMTP is configured (env.useSmtp).
 */
export interface IEmailService {
  sendMail(options: SendMailOptions): Promise<void>;
}
