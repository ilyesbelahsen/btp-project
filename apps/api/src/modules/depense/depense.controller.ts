import {
  Body,
  Controller,
  Get,
  Headers,
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
import { DepenseService } from './depense.service';
import { CreateDepenseDto } from './dto/create-depense.dto';
import { ControleDepenseDto } from './dto/controle-depense.dto';

@ApiTags('depenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('depenses')
export class DepenseController {
  constructor(private readonly depenseService: DepenseService) {}

  @Post()
  @Roles('ADMIN', 'PATRON', 'CONDUCTEUR')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crée une dépense sur un chantier' })
  create(
    @CurrentUser() user: { id: string; companyId: string; role: string },
    @Body() dto: CreateDepenseDto,
    @Headers('idempotency-key') idempotencyKey?: string,
  ) {
    return this.depenseService.create(
      user.companyId,
      dto,
      idempotencyKey,
      user.id,
      user.role,
    );
  }

  @Get()
  @Roles('ADMIN', 'PATRON', 'COMPTABLE', 'CONDUCTEUR')
  @ApiOperation({ summary: 'Liste les dépenses d un chantier' })
  findByChantier(
    @CurrentUser() user: { id: string; companyId: string; role: string },
    @Query('chantierId') chantierId: string,
  ) {
    return this.depenseService.findByChantier(
      chantierId,
      user.companyId,
      user.id,
      user.role,
    );
  }

  @Patch(':id/controle')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Accepte ou rejette une dépense contrôlée' })
  controler(
    @Param('id') id: string,
    @CurrentUser() user: { id: string; companyId: string },
    @Body() dto: ControleDepenseDto,
  ) {
    return this.depenseService.controler(id, user.companyId, user.id, dto);
  }

  @Get(':id/historique')
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Consulte l historique de contrôle d une dépense' })
  historique(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.depenseService.historique(id, user.companyId);
  }
}
