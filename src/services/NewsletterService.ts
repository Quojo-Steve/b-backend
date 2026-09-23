import { INewsletterRepository } from '../repositories/INewsletterRepository';
import { INewsletter, INewsletterSubscriber } from '../types/newsletter.types';
import { CreateNewsletterDto, SubscribeDto, UnsubscribeDto } from '../types/newsletter.schemas';
import { IEmailService } from './email/IEmailService';
import { NotFoundError, ConflictError } from '../errors/AppError';
import { Logger } from '../utils/Logger';

export interface SendResult {
  newsletter: INewsletter;
  recipientCount: number;
  failedRecipients: string[];
}

export class NewsletterService {
  private readonly logger = new Logger(NewsletterService.name);

  constructor(
    private readonly newsletterRepository: INewsletterRepository,
    private readonly emailService: IEmailService,
  ) {}

  public async create(dto: CreateNewsletterDto, createdBy: string): Promise<INewsletter> {
    const newsletter = await this.newsletterRepository.create({
      ...dto,
      createdBy,
      createdAt: new Date().toISOString(),
    });

    this.logger.info('Newsletter created', { newsletterId: newsletter.id, createdBy });
    return newsletter;
  }

  public async list(): Promise<INewsletter[]> {
    return this.newsletterRepository.findAll();
  }

  public async getById(id: string): Promise<INewsletter> {
    const newsletter = await this.newsletterRepository.findById(id);
    if (!newsletter) {
      throw new NotFoundError(`No newsletter found with id "${id}".`);
    }
    return newsletter;
  }

  /**
   * Sends a newsletter to every active subscriber. A newsletter can only
   * be sent once (mirrors TrainingApplicationService's "terminal state"
   * pattern for review) - resending would need a separate, explicit action
   * so it's never accidental.
   *
   * Recipients are emailed one at a time and a failure for one address
   * does not stop the rest from being sent; failures are collected and
   * returned so the caller (controller) can report exactly who was missed.
   */
  public async send(id: string): Promise<SendResult> {
    const newsletter = await this.getById(id);

    if (newsletter.sentAt) {
      throw new ConflictError(`Newsletter "${id}" has already been sent.`);
    }

    const subscribers = await this.newsletterRepository.listActiveSubscribers();
    const failedRecipients: string[] = [];

    for (const subscriber of subscribers) {
      try {
        await this.emailService.sendMail({
          to: subscriber.email,
          subject: newsletter.title,
          html: newsletter.bodyHtml,
        });
      } catch {
        failedRecipients.push(subscriber.email);
      }
    }

    const updated = await this.newsletterRepository.markSent(id, new Date().toISOString());
    if (!updated) {
      throw new NotFoundError(`No newsletter found with id "${id}".`);
    }

    this.logger.info('Newsletter send completed', {
      newsletterId: id,
      recipientCount: subscribers.length,
      failedCount: failedRecipients.length,
    });

    return { newsletter: updated, recipientCount: subscribers.length, failedRecipients };
  }

  public async subscribe(dto: SubscribeDto): Promise<INewsletterSubscriber> {
    const existing = await this.newsletterRepository.findSubscriberByEmail(dto.email);
    if (existing?.isActive) {
      throw new ConflictError(`"${dto.email}" is already subscribed to the newsletter.`);
    }

    const subscriber = await this.newsletterRepository.subscribe(dto.email);
    this.logger.info('Newsletter subscription added', { email: subscriber.email });
    return subscriber;
  }

  public async unsubscribe(dto: UnsubscribeDto): Promise<void> {
    await this.newsletterRepository.unsubscribe(dto.email);
    this.logger.info('Newsletter subscription removed', { email: dto.email });
  }

  public async listSubscribers(): Promise<INewsletterSubscriber[]> {
    return this.newsletterRepository.listActiveSubscribers();
  }
}
