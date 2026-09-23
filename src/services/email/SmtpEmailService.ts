import nodemailer, { Transporter } from 'nodemailer';
import { IEmailService, SendMailOptions } from './IEmailService';
import { Logger } from '../../utils/Logger';
import { env } from '../../config/env.config';

/**
 * Real email delivery via SMTP (nodemailer). Constructed by the
 * composition root only when SMTP_HOST is configured; otherwise
 * ConsoleEmailService is used instead so the rest of the app never has
 * to know which one is active.
 */
export class SmtpEmailService implements IEmailService {
  private readonly logger = new Logger(SmtpEmailService.name);
  private readonly transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure, // true for port 465, false for 587/25 (STARTTLS)
      auth: env.smtpUser
        ? {
            user: env.smtpUser,
            pass: env.smtpPassword,
          }
        : undefined,
    });
  }

  public async sendMail({ to, subject, html }: SendMailOptions): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: env.mailFrom,
        to,
        subject,
        html,
      });
      this.logger.info('Email sent via SMTP', { to, subject, messageId: info.messageId });
    } catch (error) {
      this.logger.error('Failed to send email via SMTP', {
        to,
        subject,
        message: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
