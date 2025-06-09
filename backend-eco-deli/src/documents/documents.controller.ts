import {
  Controller,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  BadRequestException,
  UploadedFiles,
  UseInterceptors,
  Get,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Document } from './entities/document.entity';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('multi-upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('file'))
  async multiUploadDocuments(
    @Request() req,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: any,
  ) {
    if (!req.user) {
      throw new BadRequestException('Utilisateur non authentifié');
    }
    const userId = req.user.userId || req.user.sub;

    let documentsData: any[];
    try {
      documentsData = JSON.parse(body.documents);
    } catch {
      throw new BadRequestException('Format des métadonnées JSON invalide');
    }

    if (!Array.isArray(documentsData) || documentsData.length !== files.length) {
      throw new BadRequestException('Nombre de fichiers et de métadonnées incohérent');
    }

    const uploaded: Document[] = [];
    for (let i = 0; i < files.length; i++) {
      const documentDto = { ...documentsData[i], file: files[i] };
      const saved = await this.documentsService.uploadDocument(userId, documentDto);
      uploaded.push(saved);
    }

    return { message: 'Documents téléchargés avec succès', uploaded };
  }

  @Post(':userId/refuse-all')
  @UseGuards(JwtAuthGuard)
  async refuseAllByUser(@Request() req, @Param('userId') userIdParam: string) {
    if (!req.user) {
      throw new BadRequestException('Utilisateur non authentifié');
    }
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('userId invalide');
    }

    await this.documentsService.deleteDocumentsByUser(userId);
    return { message: `Tous les documents de l'utilisateur #${userId} ont été supprimés.` };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getDocumentsByUser(@Param('userId') userIdParam: string) {
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('userId invalide');
    }

    return this.documentsService.findByUser(userId);
  }

}
