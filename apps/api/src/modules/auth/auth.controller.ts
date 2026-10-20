import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

type RequestWithCookies = Request & {
  cookies?: Record<string, string | undefined>;
};

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('web/login')
  @HttpCode(HttpStatus.OK)
  async webLogin(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(loginDto);
    this.setWebSession(response, session);
    return { user: session.user };
  }

  @Post('web/refresh')
  @HttpCode(HttpStatus.OK)
  async webRefresh(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.btp_refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException('Session expirée');
    }

    const session = await this.authService.refresh({ refreshToken });
    this.setWebSession(response, session);
    return { user: session.user };
  }

  @Post('web/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async webLogout(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies?.btp_refresh_token;
    if (refreshToken) {
      await this.authService.logout({ refreshToken });
    }
    this.clearWebSession(response);
  }

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

  private setWebSession(
    response: Response,
    session: {
      accessToken: string;
      refreshToken: string;
      accessTokenExpiresAt: number;
      refreshTokenExpiresAt: number;
    },
  ): void {
    const cookieOptions = {
      httpOnly: true,
      sameSite: 'strict' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };
    const now = Math.floor(Date.now() / 1000);

    response.cookie('btp_access_token', session.accessToken, {
      ...cookieOptions,
      maxAge: Math.max(0, session.accessTokenExpiresAt - now) * 1000,
    });
    response.cookie('btp_refresh_token', session.refreshToken, {
      ...cookieOptions,
      maxAge: Math.max(0, session.refreshTokenExpiresAt - now) * 1000,
    });
  }

  private clearWebSession(response: Response): void {
    response.clearCookie('btp_access_token', { path: '/' });
    response.clearCookie('btp_refresh_token', { path: '/' });
  }
}
