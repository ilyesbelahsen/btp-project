import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { CompanyModule } from './modules/company/company.module';
import { UsersModule } from './modules/users/users.module';
import { ChantierModule } from './modules/chantier/chantier.module';
import { PointageModule } from './modules/pointage/pointage.module';
import { DepenseModule } from './modules/depense/depense.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    CompanyModule,
    UsersModule,
    ChantierModule,
    PointageModule,
    DepenseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
