import fs from 'fs';
import path from 'path';
import { IPressRelease, PressReleaseStatus } from '../types/pressRelease.types';
import { IPressReleaseRepository } from '../repositories/IPressReleaseRepository';
import { CreatePressReleaseDto, UpdatePressReleaseDto } from '../types/pressRelease.schemas';
import { NotFoundError } from '../errors/AppError';
import { Logger } from '../utils/Logger';
import { PRESS_RELEASE_UPLOAD_DIR } from '../config/uploads.config';

export class PressReleaseService {
  private readonly logger = new Logger(PressReleaseService.name);

  constructor(private readonly pressReleaseRepository: IPressReleaseRepository) {}

  public async create(
    dto: CreatePressReleaseDto,
    documentUrl: string | undefined,
    documentName: string | undefined,
    createdBy: string,
  ): Promise<IPressRelease> {
    const pressRelease = await this.pressReleaseRepository.create({
      title: dto.title,
      summary: dto.summary,
      documentUrl,
      documentName,
      status: PressReleaseStatus.PUBLISHED,
      releaseDate: (dto.releaseDate ?? new Date()).toISOString(),
      createdBy,
    });

    this.logger.info('Press release created', { pressReleaseId: pressRelease.id, createdBy });
    return pressRelease;
  }

  public async listPublished(): Promise<IPressRelease[]> {
    return this.pressReleaseRepository.findAll(false);
  }

  public async listAll(): Promise<IPressRelease[]> {
    return this.pressReleaseRepository.findAll(true);
  }

  public async getPublishedById(id: string): Promise<IPressRelease> {
    const pressRelease = await this.pressReleaseRepository.findById(id);
    if (!pressRelease || pressRelease.status !== PressReleaseStatus.PUBLISHED) {
      throw new NotFoundError(`No press release found with id "${id}".`);
    }
    return pressRelease;
  }

  public async getByIdForAdmin(id: string): Promise<IPressRelease> {
    const pressRelease = await this.pressReleaseRepository.findById(id);
    if (!pressRelease) {
      throw new NotFoundError(`No press release found with id "${id}".`);
    }
    return pressRelease;
  }

  public async update(
    id: string,
    dto: UpdatePressReleaseDto,
    newDocumentUrl: string | undefined,
    newDocumentName: string | undefined,
  ): Promise<IPressRelease> {
    const existing = await this.getByIdForAdmin(id);

    if (newDocumentUrl && existing.documentUrl) {
      this.deleteDocumentFile(existing.documentUrl);
    }

    const updated = await this.pressReleaseRepository.update(id, {
      ...dto,
      releaseDate: dto.releaseDate ? dto.releaseDate.toISOString() : undefined,
      ...(newDocumentUrl && { documentUrl: newDocumentUrl }),
      ...(newDocumentName !== undefined && { documentName: newDocumentName }),
    });

    if (!updated) {
      throw new NotFoundError(`No press release found with id "${id}".`);
    }

    this.logger.info('Press release updated', { pressReleaseId: id });
    return updated;
  }

  public async setStatus(id: string, status: PressReleaseStatus): Promise<IPressRelease> {
    const updated = await this.pressReleaseRepository.update(id, { status });
    if (!updated) {
      throw new NotFoundError(`No press release found with id "${id}".`);
    }

    this.logger.info('Press release status changed', { pressReleaseId: id, status });
    return updated;
  }

  private deleteDocumentFile(documentUrl: string): void {
    try {
      const filename = path.basename(documentUrl);
      const filePath = path.join(PRESS_RELEASE_UPLOAD_DIR, filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      this.logger.warn('Failed to delete replaced press release document', {
        documentUrl,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
