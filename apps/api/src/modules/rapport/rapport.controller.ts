import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RapportService } from './rapport.service';

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
