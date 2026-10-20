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
import { ChantierService } from './chantier.service';
import { CreateChantierDto } from './dto/create-chantier.dto';
import { UpdateChantierDto } from './dto/update-chantier.dto';

@ApiTags('chantier')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chantiers')
export class ChantierController {
  constructor(private readonly chantierService: ChantierService) {}

  @Post()
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crée un nouveau chantier (PATRON)' })
  @ApiResponse({ status: 201, description: 'Chantier créé' })
  create(
    @CurrentUser() user: { id: string; companyId: string; role: string },
    @Body() dto: CreateChantierDto,
  ) {
    return this.chantierService.create(user.companyId, dto);
  }

  @Get()
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Liste tous les chantiers de l entreprise' })
  findAll(@CurrentUser() user: { companyId: string }) {
    return this.chantierService.findAll(user.companyId);
  }

  @Get('mes-chantiers')
  @Roles('OUVRIER', 'CONDUCTEUR')
  @ApiOperation({
    summary: 'Retourne les chantiers actifs affectés à l ouvrier courant',
  })
  @ApiResponse({ status: 200, description: 'Liste des chantiers affectés' })
  findMine(
    @CurrentUser() user: { id: string; companyId: string; role: string },
  ) {
    return this.chantierService.findAssignedByUser(
      user.id,
      user.companyId,
      user.role,
    );
  }

  @Patch(':id/terminer')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Clôture un chantier (statut → TERMINÉ)' })
  terminer(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.chantierService.terminer(id, user.companyId);
  }

  @Patch(':id')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Modifie un chantier (EN_COURS uniquement)' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
    @Body() dto: UpdateChantierDto,
  ) {
    return this.chantierService.update(id, user.companyId, dto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprime un chantier (bloqué si pointages validés)',
  })
  remove(@Param('id') id: string, @CurrentUser() user: { companyId: string }) {
    return this.chantierService.remove(id, user.companyId);
  }

  @Get(':id/ouvriers')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Liste les ouvriers affectés au chantier' })
  getOuvriers(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.chantierService.getOuvriersAffectes(id, user.companyId);
  }

  @Get(':id/conducteurs')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Liste les conducteurs affectés au chantier' })
  getConducteurs(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.chantierService.getConducteursAffectes(id, user.companyId);
  }

  @Post(':id/conducteurs/:userId')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Affecte un conducteur au chantier' })
  assignConducteur(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.chantierService.assignConducteur(id, userId, user.companyId);
  }

  @Delete(':id/conducteurs/:userId')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retire un conducteur du chantier' })
  removeConducteur(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.chantierService.removeConducteur(id, userId, user.companyId);
  }

  @Post(':id/ouvriers/:userId')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Affecte un ouvrier au chantier' })
  assignOuvrier(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.chantierService.assignOuvrier(id, userId, user.companyId);
  }

  @Delete(':id/ouvriers/:userId')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Retire un ouvrier du chantier' })
  removeOuvrier(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.chantierService.removeOuvrier(id, userId, user.companyId);
  }
}
