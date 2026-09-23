import { IEmailService, SendMailOptions } from './IEmailService';
import { Logger } from '../../utils/Logger';

/**
 * Default email "sender" used whenever SMTP is not configured. Instead of
 * delivering anything, it logs the full email to the console so the
 * newsletter feature (create -> send -> subscriber receives it) can be
 * exercised end-to-end in local development or tests without needing a
 * real mail account.
 *
 * Swap to SmtpEmailService automatically the moment SMTP_HOST is set in
 * .env - see composition/container.ts.
 */
export class ConsoleEmailService implements IEmailService {
  private readonly logger = new Logger(ConsoleEmailService.name);

  public async sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
    this.logger.info('Email dispatched (console transport - no SMTP configured)', {
      to,
      subject,
      preview: html.length > 200 ? `${html.slice(0, 200)}...` : html,
    });
  }
}
