import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Document } from './entities/document.entity';
import { User } from 'src/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { PrestataireRequirement } from 'src/prestataire-requirements/entities/prestataire-requirement.entity';
import { getCurrentTargetYear } from './../utils/currentTime';


@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async uploadDocument(userId: number, documentDto: any): Promise<Document> {
  if (!documentDto.file) {
    throw new BadRequestException('Fichier manquant');
  }

  const documentDate = new Date(documentDto.documentDate);
  const expirationDate = new Date(documentDto.expirationDate);

  if (isNaN(documentDate.getTime()) || isNaN(expirationDate.getTime())) {
    throw new BadRequestException('Dates invalides');
  }

  const requirementId = parseInt(documentDto.requirementId);
  const targetYear = parseInt(documentDto.targetYear) || getCurrentTargetYear();


  if (isNaN(requirementId)) {
    throw new BadRequestException('requirementId invalide');
  }

  const uploadFolder = path.join(__dirname, '..', '..', 'public', 'uploads', 'documents');
  if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder, { recursive: true });
  }

  const timestamp = Date.now();
  const safeFileName = `${timestamp}-${documentDto.file.originalname.replace(/\s+/g, '_')}`;
  const filePathOnDisk = path.join(uploadFolder, safeFileName);

  try {
    fs.writeFileSync(filePathOnDisk, documentDto.file.buffer);
  } catch (err) {
    console.error('Erreur d’écriture fichier:', err);
    throw new BadRequestException('Échec de l’écriture du fichier');
  }

  const documentType = documentDto.documentType?.trim();

  if (!documentType) {
    throw new BadRequestException('documentType manquant ou vide');
  }

  const existing = await this.documentRepository.findOne({
    where: {
      userId,
      documentType,
      targetYear,
    },
  });


  if (existing) {
    // Supprimer l'ancien fichier physique
    const fullPath = path.join(__dirname, '..', '..', 'public', existing.filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error('Erreur suppression fichier existant :', err);
      }
    }

    // Mettre à jour les champs
    existing.documentDate = documentDate;
    existing.expirationDate = expirationDate;
    existing.format = documentDto.format;
    existing.fileName = documentDto.file.originalname;
    existing.filePath = `uploads/documents/${safeFileName}`;
    existing.documentValid = 'no'; // 👈 repasse à non validé

    return await this.documentRepository.save(existing);
  }

  // ❗ Aucun document existant => on crée un nouveau
  const document = this.documentRepository.create({
    userId,
    documentType,
    documentDate,
    expirationDate,
    format: documentDto.format,
    fileName: documentDto.file.originalname,
    filePath: `uploads/documents/${safeFileName}`,
    requirementId,
    targetYear,
    documentValid: 'no',
  });

  return await this.documentRepository.save(document);
}


  async validateDocument(documentId: number, action: 'accept' | 'refuse'): Promise<User> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['user'],
    });

    if (!document || !document.user) {
      throw new BadRequestException('Document ou utilisateur introuvable');
    }

    document.documentValid = action === 'accept' ? 'yes' : 'no';
    await this.documentRepository.save(document);

    if (document.user.userStatus === 'prestataire') {
      await this.recalculateUserValidation(document.user.id);
    } else if (document.user.userStatus === 'livreur') {
      const currentYear = getCurrentTargetYear();
      const userDocs = await this.documentRepository.find({
        where: { userId: document.user.id, targetYear: currentYear },
      });

      const allValid = userDocs.length > 0 && userDocs.every(d => d.documentValid === 'yes');

      document.user.valid = allValid;
      await this.userRepository.save(document.user);
    } else {
      throw new BadRequestException('Statut utilisateur inconnu');
    }

    return document.user;
  }


  /**
   * Supprime tous les documents (en base et fichiers) d'un même utilisateur
   */
  async deleteDocumentsByUser(userId: number): Promise<void> {
    const docs = await this.documentRepository.find({ where: { userId } });
    for (const doc of docs) {
      const fullPath = path.join(__dirname, '..', '..', 'public', doc.filePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Erreur suppression fichier ${fullPath}:`, err);
        }
      }
    }
    await this.documentRepository.delete({ userId });
  }

  async findDocumentsByStatus(userStatus: 'livreur' | 'prestataire'): Promise<(Document & { fileUrl: string })[]> {
    const users = await this.userRepository.find({ where: { userStatus } });
    if (!users.length) {
      throw new BadRequestException(`Aucun utilisateur avec le statut ${userStatus}`);
    }

    const docs = await this.documentRepository.find({
      where: { userId: In(users.map((u) => u.id)) },
      relations: ['user'],
      order: { id: 'DESC' },
    });

    return docs.map((d) => ({ ...d, fileUrl: `http://127.0.0.1:3001/${d.filePath}` }));
  }

  async findAll(): Promise<(Document & { fileUrl: string })[]> {
    const docs = await this.documentRepository.find({ relations: ['user'], order: { id: 'DESC' } });
    return docs.map((d) => ({ ...d, fileUrl: `http://127.0.0.1:3001/${d.filePath}` }));
  }

  async findByUser(userId: number): Promise<Document[]> {
    return this.documentRepository.find({ where: { userId } });
  }

  async getAllUsersRequirementsWithDocuments(): Promise<{
    [userId: number]: {
      user: {
        id: number;
        userFirstName: string;
        userLastName: string;
        email: string;
      };
      requirements: PrestataireRequirement[];
    };
  }> {
    const users = await this.userRepository.find({
      where: { userStatus: 'prestataire' },
      relations: ['prestataireRole', 'prestataireRole.requirements'],
    });

    const result: {
      [userId: number]: {
        user: {
          id: number;
          userFirstName: string;
          userLastName: string;
          email: string;
        };
        requirements: PrestataireRequirement[];
      };
    } = {};

    for (const user of users) {
      result[user.id] = {
        user: {
          id: user.id,
          userFirstName: user.userFirstName,
          userLastName: user.userLastName,
          email: user.email,
        },
        requirements: user.prestataireRole?.requirements || [],
      };
    }

    return result;
  }

  async deleteDocumentById(id: number): Promise<void> {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) throw new BadRequestException("Document introuvable");

    const fullPath = path.join(__dirname, '..', '..', 'public', doc.filePath);
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (err) {
        console.error(`Erreur suppression fichier ${fullPath}:`, err);
      }
    }

    await this.documentRepository.delete({ id });
  }

  async recalculateUserValidation(userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['prestataireRole', 'prestataireRole.requirements'],
    });

    if (!user || user.userStatus !== 'prestataire') return;

    const currentYear = getCurrentTargetYear();
    const userDocs = await this.documentRepository.find({ where: { userId } });

    const requiredNames = user.prestataireRole?.requirements.map(r => r.name) || [];

    const currentYearDocs = userDocs.filter(d => d.targetYear === currentYear);

    const allValid = requiredNames.every(reqName =>
      currentYearDocs.find(d => d.documentType === reqName && d.documentValid === 'yes')
    );

    user.valid = allValid;
    await this.userRepository.save(user);
  }



}