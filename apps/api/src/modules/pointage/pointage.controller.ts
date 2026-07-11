import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StartPointageDto } from './dto/start-pointage.dto';
import { SaveTachesDto } from './dto/save-taches.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { HistoriqueQueryDto } from './dto/historique-query.dto';
import { PointageService } from './pointage.service';

@ApiTags('pointage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('pointages')
export class PointageController {
  constructor(private readonly pointageService: PointageService) {}

  @Post('start')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Démarre le pointage du jour sur un chantier' })
  @ApiResponse({ status: 201, description: 'Pointage EN_COURS créé' })
  @ApiResponse({ status: 409, description: 'Un pointage est déjà en cours' })
  @ApiResponse({ status: 404, description: 'Chantier introuvable' })
  start(
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: StartPointageDto,
  ) {
    return this.pointageService.startPointage(user.id, user.companyId, dto);
  }

  @Get('aujourd-hui')
  @ApiOperation({
    summary: 'Retourne le pointage EN_COURS du jour si existant',
  })
  @ApiResponse({ status: 200, description: 'Pointage actif ou null' })
  findTodayActive(@CurrentUser() user: { id: string; companyId: string }) {
    return this.pointageService.findTodayActive(user.id, user.companyId);
  }

  @Patch(':id/terminer')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Termine le pointage en cours et calcule la durée' })
  @ApiResponse({
    status: 200,
    description: 'Pointage TERMINE avec totalHours calculé',
  })
  @ApiResponse({ status: 404, description: 'Pointage introuvable' })
  @ApiResponse({ status: 409, description: 'Le pointage n est pas EN_COURS' })
  stop(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
  ) {
    return this.pointageService.stopPointage(id, user.id, user.companyId);
  }

  @Get('types-taches')
  @ApiOperation({
    summary: 'Retourne la liste des types de tâches disponibles',
  })
  @ApiResponse({ status: 200, description: 'Liste des types de tâches' })
  getTypesTaches() {
    return this.pointageService.getTypesTaches();
  }

  @Post(':id/taches')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Enregistre les types de travaux d un pointage' })
  @ApiResponse({ status: 200, description: 'Tâches sauvegardées' })
  @ApiResponse({ status: 404, description: 'Pointage introuvable' })
  saveTaches(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: SaveTachesDto,
  ) {
    return this.pointageService.saveTaches(id, user.id, user.companyId, dto);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Ajoute ou met à jour le commentaire d un pointage',
  })
  @ApiResponse({ status: 200, description: 'Commentaire sauvegardé' })
  @ApiResponse({ status: 404, description: 'Pointage introuvable' })
  updateComment(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: UpdateCommentDto,
  ) {
    return this.pointageService.updateComment(id, user.id, user.companyId, dto);
  }

  @Get('mon-historique')
  @ApiOperation({
    summary: 'Historique paginé des pointages de l ouvrier courant',
  })
  @ApiResponse({ status: 200, description: 'Liste paginée de pointages' })
  findHistorique(
    @CurrentUser() user: { id: string; companyId: string },
    @Query() query: HistoriqueQueryDto,
  ) {
    return this.pointageService.findHistorique(user.id, user.companyId, query);
  }

  @Get('mes-stats')
  @ApiOperation({
    summary:
      'Statistiques mensuelles de l ouvrier (totalHeures, totalJours, dernierPointage)',
  })
  @ApiResponse({ status: 200, description: 'Statistiques du mois demandé' })
  findMesStats(
    @CurrentUser() user: { id: string; companyId: string },
    @Query('mois') mois?: string,
  ) {
    return this.pointageService.findMesStats(user.id, user.companyId, mois);
  }
}
