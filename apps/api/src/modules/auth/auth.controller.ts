import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
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
}
