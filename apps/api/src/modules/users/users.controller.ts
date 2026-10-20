import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateOuvrierDto } from './dto/create-ouvrier.dto';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('ouvriers')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Liste les ouvriers de l entreprise' })
  findOuvriers(@CurrentUser() user: { companyId: string }) {
    return this.usersService.findAllOuvriers(user.companyId);
  }

  @Post('ouvriers')
  @Roles('ADMIN', 'PATRON')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crée la fiche d un ouvrier' })
  createOuvrier(
    @CurrentUser() user: { companyId: string },
    @Body() dto: CreateOuvrierDto,
  ) {
    return this.usersService.createOuvrier(user.companyId, dto);
  }

  @Get('ouvriers/:id')
  @Roles('ADMIN', 'PATRON')
  @ApiOperation({ summary: 'Retourne la fiche détaillée d un ouvrier' })
  findOuvrierDetail(
    @Param('id') id: string,
    @CurrentUser() user: { companyId: string },
  ) {
    return this.usersService.findOuvrierDetail(id, user.companyId);
  }
}
