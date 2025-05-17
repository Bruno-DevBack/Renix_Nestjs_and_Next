import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { BancosModule } from './bancos/bancos.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { InvestimentosModule } from './investimentos/investimentos.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { BancoAgentModule } from './banco-agent/banco-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService): Promise<ThrottlerModuleOptions> => ({
        throttlers: [{
          ttl: configService.get<number>('RATE_LIMIT_TTL') || 60,
          limit: configService.get<number>('RATE_LIMIT_LIMIT') || 10,
        }]
      }),
      inject: [ConfigService],
    }),
    BancosModule,
    UsuariosModule,
    InvestimentosModule,
    DashboardModule,
    BancoAgentModule,
  ],
})
export class AppModule { }
