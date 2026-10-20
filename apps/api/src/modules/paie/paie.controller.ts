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
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaieService } from './paie.service';
import { PaiePreviewQueryDto } from './dto/paie-preview-query.dto';
import { CreatePaieCorrectionDto } from './dto/create-paie-correction.dto';
import { CreateIndemniteDto } from './dto/create-indemnite.dto';
import { UpdateIndemniteDto } from './dto/update-indemnite.dto';
import { CreateIndemniteAffectationDto } from './dto/create-indemnite-affectation.dto';
import { UpdateIndemniteAffectationDto } from './dto/update-indemnite-affectation.dto';

@ApiTags('paie')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('paie')
export class PaieController {
  constructor(private readonly paieService: PaieService) {}

  @Get('preview')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Prévisualisation des données de paie par période' })
  getPreview(
    @CurrentUser() user: { companyId: string },
    @Query() query: PaiePreviewQueryDto,
  ) {
    return this.paieService.getPreview(user.companyId, query);
  }

  @Get('export')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Données de paie exportables après validation' })
  getExport(
    @CurrentUser() user: { companyId: string },
    @Query() query: PaiePreviewQueryDto,
  ) {
    return this.paieService.getExport(user.companyId, query);
  }

  @Post('corrections')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enregistre une correction de paie à valider' })
  createCorrection(
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: CreatePaieCorrectionDto,
  ) {
    return this.paieService.createCorrection(user.companyId, user.id, dto);
  }

  @Patch('corrections/:id/valider')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Valide une correction de paie' })
  validateCorrection(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
  ) {
    return this.paieService.validerCorrection(id, user.companyId, user.id);
  }

  @Get('corrections/:id/historique')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Consulte l historique d une correction de paie' })
  getCorrectionHistory(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.paieService.getCorrectionHistory(id, user.companyId);
  }

  @Get('indemnites')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Liste le catalogue des indemnités de la société' })
  findIndemnites(@CurrentUser() user: { companyId: string }) {
    return this.paieService.findIndemnites(user.companyId);
  }

  @Post('indemnites')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crée une indemnité dans le catalogue' })
  createIndemnite(
    @CurrentUser() user: { companyId: string },
    @Body() dto: CreateIndemniteDto,
  ) {
    return this.paieService.createIndemnite(user.companyId, dto);
  }

  @Patch('indemnites/:id')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Modifie ou désactive une indemnité' })
  updateIndemnite(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
    @Body() dto: UpdateIndemniteDto,
  ) {
    return this.paieService.updateIndemnite(id, user.companyId, dto);
  }

  @Get('indemnites/affectations')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Liste les indemnités affectées aux ouvriers' })
  findIndemniteAffectations(
    @CurrentUser() user: { companyId: string },
    @Query('userId') userId?: string,
  ) {
    return this.paieService.findIndemniteAffectations(user.companyId, userId);
  }

  @Post('indemnites/affectations')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Affecte une indemnité à un ouvrier' })
  createIndemniteAffectation(
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: CreateIndemniteAffectationDto,
  ) {
    return this.paieService.createIndemniteAffectation(
      user.companyId,
      user.id,
      dto,
    );
  }

  @Patch('indemnites/affectations/:id/supprimer')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Retire une affectation d indemnité' })
  deleteIndemniteAffectation(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.paieService.deleteIndemniteAffectation(id, user.companyId);
  }

  @Patch('indemnites/affectations/:id')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Modifie une affectation d indemnité' })
  updateIndemniteAffectation(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
    @Body() dto: UpdateIndemniteAffectationDto,
  ) {
    return this.paieService.updateIndemniteAffectation(id, user.companyId, dto);
  }
}
