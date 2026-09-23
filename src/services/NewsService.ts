import fs from 'fs';
import path from 'path';
import { INewsRepository } from '../repositories/INewsRepository';
import { INews, NewsStatus } from '../types/news.types';
import { CreateNewsDto, UpdateNewsDto } from '../types/news.schemas';
import { NotFoundError } from '../errors/AppError';
import { Logger } from '../utils/Logger';
import { NEWS_UPLOAD_DIR } from '../config/uploads.config';

export class NewsService {
  private readonly logger = new Logger(NewsService.name);

  constructor(private readonly newsRepository: INewsRepository) {}

  public async create(dto: CreateNewsDto, imageUrl: string | undefined, createdBy: string): Promise<INews> {
    const news = await this.newsRepository.create({
      title: dto.title,
      tag: dto.tag,
      pillar: dto.pillar,
      note: dto.note,
      body: dto.body,
      imageUrl,
      status: NewsStatus.PUBLISHED,
      publishedDate: (dto.publishedDate ?? new Date()).toISOString(),
      createdBy,
    });

    this.logger.info('News item created', { newsId: news.id, createdBy });
    return news;
  }

  /** Public feed - published items only, most recent first. */
  public async listPublished(): Promise<INews[]> {
    return this.newsRepository.findAll(false);
  }

  /** Admin dashboard - every item regardless of status. */
  public async listAll(): Promise<INews[]> {
    return this.newsRepository.findAll(true);
  }

  /** Public single-item lookup - hides disabled items as if they don't exist. */
  public async getPublishedById(id: string): Promise<INews> {
    const news = await this.newsRepository.findById(id);
    if (!news || news.status !== NewsStatus.PUBLISHED) {
      throw new NotFoundError(`No news item found with id "${id}".`);
    }
    return news;
  }

  /** Admin single-item lookup - any status, e.g. for an edit screen. */
  public async getByIdForAdmin(id: string): Promise<INews> {
    const news = await this.newsRepository.findById(id);
    if (!news) {
      throw new NotFoundError(`No news item found with id "${id}".`);
    }
    return news;
  }

  public async update(id: string, dto: UpdateNewsDto, newImageUrl: string | undefined): Promise<INews> {
    const existing = await this.getByIdForAdmin(id);

    if (newImageUrl && existing.imageUrl) {
      this.deleteImageFile(existing.imageUrl);
    }

    const updated = await this.newsRepository.update(id, {
      ...dto,
      publishedDate: dto.publishedDate ? dto.publishedDate.toISOString() : undefined,
      ...(newImageUrl && { imageUrl: newImageUrl }),
    });

    if (!updated) {
      throw new NotFoundError(`No news item found with id "${id}".`);
    }

    this.logger.info('News item updated', { newsId: id });
    return updated;
  }

  /**
   * Replaces delete: flips status between PUBLISHED and DISABLED. History
   * (who created it, when, previous content) is never removed.
   */
  public async setStatus(id: string, status: NewsStatus): Promise<INews> {
    const updated = await this.newsRepository.update(id, { status });
    if (!updated) {
      throw new NotFoundError(`No news item found with id "${id}".`);
    }

    this.logger.info('News item status changed', { newsId: id, status });
    return updated;
  }

  /** Best-effort cleanup of a replaced image; never fails the request. */
  private deleteImageFile(imageUrl: string): void {
    try {
      const filename = path.basename(imageUrl);
      const filePath = path.join(NEWS_UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      this.logger.warn('Failed to delete replaced news image', {
        imageUrl,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}