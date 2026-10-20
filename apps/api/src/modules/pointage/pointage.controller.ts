import {
  Body,
  Controller,
  Delete,
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
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StartPointageDto } from './dto/start-pointage.dto';
import { SaveTachesDto } from './dto/save-taches.dto';
import { SaveRepartitionDto } from './dto/save-repartition.dto';
import { SoumettrePointageDto } from './dto/soumettre-pointage.dto';
import { HistoriqueQueryDto } from './dto/historique-query.dto';
import { FindPointagesQueryDto } from './dto/find-pointages-query.dto';
import { CorrigerPointageDto } from './dto/corriger-pointage.dto';
import { ValiderBatchDto } from './dto/valider-batch.dto';
import { RejeterPointageDto } from './dto/rejeter-pointage.dto';
import { PointageService } from './pointage.service';

@ApiTags('pointage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pointages')
export class PointageController {
  constructor(private readonly pointageService: PointageService) {}

  @Get()
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({
    summary: 'Liste tous les pointages de l entreprise (patron)',
  })
  findAll(
    @CurrentUser() user: { companyId: string },
    @Query() query: FindPointagesQueryDto,
  ) {
    return this.pointageService.findAllForPatron(user.companyId, query);
  }

  @Post('start')
  @Roles('OUVRIER')
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
  @Roles('OUVRIER')
  @ApiOperation({
    summary: 'Retourne le pointage EN_COURS du jour si existant',
  })
  @ApiResponse({ status: 200, description: 'Pointage actif ou null' })
  findTodayActive(@CurrentUser() user: { id: string; companyId: string }) {
    return this.pointageService.findTodayActive(user.id, user.companyId);
  }

  @Patch(':id/terminer')
  @Roles('OUVRIER')
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

  @Delete(':id')
  @Roles('OUVRIER')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Annule et supprime un pointage en cours' })
  cancel(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
  ) {
    return this.pointageService.cancelPointage(id, user.id, user.companyId);
  }

  @Patch(':id/soumettre')
  @Roles('OUVRIER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soumet un pointage terminé ou rejeté' })
  soumettre(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: SoumettrePointageDto,
  ) {
    return this.pointageService.soumettrePointage(
      id,
      user.id,
      user.companyId,
      dto,
    );
  }

  @Patch(':id/resoumettre')
  @Roles('OUVRIER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Corrige et resoumet un pointage rejeté' })
  resoumettre(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: CorrigerPointageDto,
  ) {
    return this.pointageService.corrigerEtResoumettre(
      id,
      user.id,
      user.companyId,
      dto,
    );
  }

  @Get('types-taches')
  @Roles('OUVRIER')
  @ApiOperation({
    summary: 'Retourne la liste des types de tâches disponibles',
  })
  @ApiResponse({ status: 200, description: 'Liste des types de tâches' })
  getTypesTaches() {
    return this.pointageService.getTypesTaches();
  }

  @Post(':id/taches')
  @Roles('OUVRIER')
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

  @Post(':id/repartition')
  @Roles('OUVRIER')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ventile la durée du pointage par tâche' })
  saveRepartition(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: SaveRepartitionDto,
  ) {
    return this.pointageService.saveRepartition(
      id,
      user.id,
      user.companyId,
      dto,
    );
  }

  @Get('mon-historique')
  @Roles('OUVRIER')
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
  @Roles('OUVRIER')
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

  @Patch(':id/corriger')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Corrige un pointage non validé (patron)' })
  corriger(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: CorrigerPointageDto,
  ) {
    return this.pointageService.corrigerPointage(
      id,
      user.companyId,
      user.id,
      dto,
    );
  }

  @Patch(':id/valider')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valide un pointage terminé (patron)' })
  valider(@Param('id') id: string, @CurrentUser() user: { companyId: string }) {
    return this.pointageService.validerPointage(id, user.companyId);
  }

  @Patch(':id/rejeter')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rejette un pointage soumis avec un motif' })
  rejeter(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
    @Body() dto: RejeterPointageDto,
  ) {
    return this.pointageService.rejeterPointage(id, user.companyId, dto);
  }

  @Post('valider-batch')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Valide plusieurs pointages en une seule opération',
  })
  validerBatch(
    @CurrentUser() user: { companyId: string },
    @Body() dto: ValiderBatchDto,
  ) {
    return this.pointageService.validerBatch(dto, user.companyId);
  }
}
