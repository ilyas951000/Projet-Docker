import { Controller, Post, Param, Body, Get, UseGuards, BadRequestException, Delete } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('livreur')
  async getDocumentsLivreur() {
    try {
      return await this.documentsService.findDocumentsByStatus('livreur');
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des documents des livreurs');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('prestataire')
  async getDocumentsPrestataire() {
    try {
      return await this.documentsService.findDocumentsByStatus('prestataire');
    } catch (error) {
      throw new BadRequestException('Erreur lors de la récupération des documents des prestataires');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/validate')
  async validateDocument(
    @Param('id') id: string,
    @Body() body: { action: 'accept' | 'refuse' },
  ) {
    const documentId = parseInt(id, 10);
    if (isNaN(documentId)) {
      throw new BadRequestException('ID de document invalide');
    }
    return await this.documentsService.validateDocument(documentId, body.action);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/refuse-all')
  async refuseAllByUser(
    @Param('userId') userIdParam: string,
  ) {
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Paramètre userId invalide');
    }
    await this.documentsService.deleteDocumentsByUser(userId);
    return {
      message: `Tous les documents de l'utilisateur #${userId} ont été supprimés.`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':userId/accept-all')
  async acceptAllByUser(
    @Param('userId') userIdParam: string,
  ) {
    const userId = parseInt(userIdParam, 10);
    if (isNaN(userId)) {
      throw new BadRequestException('Paramètre userId invalide');
    }
    const allDocs = (await this.documentsService.findAll()).filter(d => d.userId === userId);
    await Promise.all(
      allDocs.map(doc => this.documentsService.validateDocument(doc.id, 'accept'))
    );
    return {
      message: `Tous les documents de l'utilisateur #${userId} ont été acceptés.`,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('requirements/by-user')
  async getRequirementsByUser() {
    return await this.documentsService.getAllUsersRequirementsWithDocuments();
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    const docId = parseInt(id, 10);
    if (isNaN(docId)) throw new BadRequestException('ID invalide');
    await this.documentsService.deleteDocumentById(docId);
    return { message: 'Document supprimé' };
  }


}