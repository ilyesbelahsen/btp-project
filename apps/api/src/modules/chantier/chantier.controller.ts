import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChantierService } from './chantier.service';

@ApiTags('chantier')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chantiers')
export class ChantierController {
  constructor(private readonly chantierService: ChantierService) {}

  @Get('mes-chantiers')
  @ApiOperation({
    summary: 'Retourne les chantiers actifs affectés à l ouvrier courant',
  })
  @ApiResponse({ status: 200, description: 'Liste des chantiers affectés' })
  findMine(@CurrentUser() user: { id: string; companyId: string }) {
    return this.chantierService.findAssignedByUser(user.id, user.companyId);
  }
}
