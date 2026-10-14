import { IEmailService } from '../email/IEmailService';
import { IRegistrationNotifier, RegistrationNotification } from './IRegistrationNotifier';

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/**
 * Sends a booking confirmation to the registrant. Only wired in by the
 * composition root when TRAINING_CONFIRMATION_EMAIL_ENABLED=true.
 */
export class EmailRegistrationNotifier implements IRegistrationNotifier {
  constructor(private readonly emailService: IEmailService) {}

  public async notifyRegistered({ application, training, cohort }: RegistrationNotification): Promise<void> {
    await this.emailService.sendMail({
      to: application.applicantEmail,
      subject: `Registration received: ${training.title} (${cohort.name})`,
      html: `
        <p>Dear ${escapeHtml(application.applicantFullName)},</p>
        <p>We have received your registration for <strong>${escapeHtml(training.title)}</strong>,
        cohort <strong>${escapeHtml(cohort.name)}</strong>
        (${formatDate(cohort.startDate)} to ${formatDate(cohort.endDate)}).</p>
        <p>This email confirms that your registration was recorded. The BRACE team will be in touch
        with further details.</p>
        <p>BRACE Digital Platform</p>`,
    });
  }
}
