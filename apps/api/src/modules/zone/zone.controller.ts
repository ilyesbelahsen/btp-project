import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpsertZoneMajorationDto } from './dto/upsert-zone-majoration.dto';
import { ZoneService } from './zone.service';

@ApiTags('zones-majorations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('zones-majorations')
export class ZoneController {
  constructor(private readonly zoneService: ZoneService) {}

  @Get()
  @Roles('ADMIN', 'PATRON', 'COMPTABLE')
  @ApiOperation({ summary: 'Liste les majorations de zone de la société' })
  findAll(@CurrentUser() user: { companyId: string }) {
    return this.zoneService.findAll(user.companyId);
  }

  @Put(':zoneCategorie')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Versionne le taux de majoration d une zone' })
  upsert(
    @Param('zoneCategorie', ParseIntPipe) zoneCategorie: number,
    @CurrentUser() user: { companyId: string },
    @Body() dto: UpsertZoneMajorationDto,
  ) {
    return this.zoneService.upsert(user.companyId, zoneCategorie, dto);
  }
}
