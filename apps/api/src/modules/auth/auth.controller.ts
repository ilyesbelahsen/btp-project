import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Connexion ouvrier / patron avec email et mot de passe',
  })
  @ApiResponse({
    status: 200,
    description: 'accessToken + refreshToken retournés',
  })
  @ApiResponse({ status: 401, description: 'Identifiants invalides' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renouvellement du JWT via le refresh token' })
  @ApiResponse({ status: 200, description: 'Nouveaux tokens retournés' })
  @ApiResponse({ status: 401, description: 'Refresh token invalide ou expiré' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Déconnexion — invalide le refresh token côté serveur',
  })
  @ApiResponse({ status: 204, description: 'Déconnexion réussie' })
  async logout(@Body() dto: LogoutDto) {
    await this.authService.logout(dto);
  }
}
