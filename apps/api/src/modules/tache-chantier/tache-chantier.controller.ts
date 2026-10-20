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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { TacheChantierService } from './tache-chantier.service';
import { SaveTachesDevisDto } from './dto/save-taches-devis.dto';
import { TacheDto } from './dto/tache.dto';
import { UpdateTacheDto } from './dto/update-tache.dto';

@ApiTags('tache-chantier')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('chantiers/:chantierId/taches')
export class TacheChantierController {
  constructor(private readonly tacheService: TacheChantierService) {}

  @Get()
  @Roles('ADMIN', 'PATRON', 'COMPTABLE', 'CONDUCTEUR', 'OUVRIER')
  @ApiOperation({ summary: 'Liste les tâches d un chantier' })
  findAll(
    @Param('chantierId') chantierId: string,
    @CurrentUser() user: { id: string; companyId: string; role: string },
  ) {
    return this.tacheService.findByChantier(
      chantierId,
      user.companyId,
      user.id,
      user.role,
    );
  }

  @Post()
  @Roles('ADMIN', 'PATRON', 'CONDUCTEUR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ajoute une tâche au chantier' })
  create(
    @Param('chantierId') chantierId: string,
    @CurrentUser() user: { id: string; companyId: string; role: string },
    @Body() dto: TacheDto,
  ) {
    return this.tacheService.create(
      chantierId,
      user.companyId,
      dto,
      user.id,
      user.role,
    );
  }

  @Patch(':tacheId')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Modifie une tâche' })
  update(
    @Param('chantierId') chantierId: string,
    @Param('tacheId') tacheId: string,
    @CurrentUser() user: { companyId: string },
    @Body() dto: UpdateTacheDto,
  ) {
    return this.tacheService.update(tacheId, chantierId, user.companyId, dto);
  }

  @Delete(':tacheId')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Supprime une tâche' })
  remove(
    @Param('chantierId') chantierId: string,
    @Param('tacheId') tacheId: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.tacheService.remove(tacheId, chantierId, user.companyId);
  }

  @Post('batch')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Sauvegarde un lot de tâches (depuis OCR ou manuel)',
  })
  @ApiResponse({ status: 200, description: 'Tâches enregistrées' })
  saveBatch(
    @Param('chantierId') chantierId: string,
    @CurrentUser() user: { companyId: string },
    @Body() dto: SaveTachesDevisDto,
  ) {
    return this.tacheService.saveBatch(chantierId, user.companyId, dto);
  }
}
