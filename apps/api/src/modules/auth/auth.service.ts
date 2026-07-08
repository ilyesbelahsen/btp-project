import { createHash } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RedisService } from '../redis/redis.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { LogoutDto } from './dto/logout.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    return this.generateTokens(user);
  }

  async refresh(dto: RefreshTokenDto) {
    const blacklistKey = this.blacklistKey(dto.refreshToken);
    const isRevoked = await this.redisService.exists(blacklistKey);
    if (isRevoked) {
      throw new UnauthorizedException('Refresh token révoqué');
    }

    let payload: { sub: string };
    try {
      payload = this.jwtService.verify(dto.refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Refresh token invalide ou expiré');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    return this.generateTokens(user);
  }

  async logout(dto: LogoutDto): Promise<void> {
    let payload: { sub: string; exp?: number };
    try {
      payload = this.jwtService.decode(dto.refreshToken) as {
        sub: string;
        exp?: number;
      };
    } catch {
      return; // Token malformé, rien à invalider
    }

    if (!payload?.exp) return;

    const ttl = payload.exp - Math.floor(Date.now() / 1000);
    if (ttl <= 0) return; // Déjà expiré

    await this.redisService.set(this.blacklistKey(dto.refreshToken), '1', ttl);
  }

  private generateTokens(user: User) {
    const accessPayload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };

    const accessToken = this.jwtService.sign(accessPayload);

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
      },
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
      },
    };
  }

  private blacklistKey(token: string): string {
    const hash = createHash('sha256').update(token).digest('hex');
    return `blacklist:${hash}`;
  }
}
