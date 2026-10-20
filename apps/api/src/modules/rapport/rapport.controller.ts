import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RapportService } from './rapport.service';
import { RapportPeriodeQueryDto } from './dto/rapport-periode-query.dto';
import { UpdateTresorerieDto } from './dto/update-tresorerie.dto';

@ApiTags('rapport')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('rapport')
export class RapportController {
  constructor(private readonly rapportService: RapportService) {}

  @Get('dashboard')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'KPIs globaux du dashboard patron' })
  getDashboardStats(@CurrentUser() user: { companyId: string }) {
    return this.rapportService.getDashboardStats(user.companyId);
  }

  @Get('global')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Reporting financier global sur une période' })
  getReportingGlobal(
    @Query() query: RapportPeriodeQueryDto,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.rapportService.getReportingGlobal(user.companyId, query);
  }

  @Patch('tresorerie')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Met à jour le capital initial de trésorerie' })
  updateTresorerie(
    @Body() dto: UpdateTresorerieDto,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.rapportService.updateTresorerie(user.companyId, dto);
  }

  @Get('chantiers-synthese')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Synthèse financière par chantier actif' })
  getChantiersSynthese(@CurrentUser() user: { companyId: string }) {
    return this.rapportService.getChantiersSynthese(user.companyId);
  }

  @Get('chantier/:id')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Indicateurs financiers détaillés d un chantier' })
  getIndicateursChantier(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.rapportService.getIndicateursChantier(id, user.companyId);
  }

  @Get('chantier/:id/taches')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Suivi budgétaire par tâche du chantier' })
  getSuiviTachesChantier(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.rapportService.getSuiviTachesChantier(id, user.companyId);
  }
}
