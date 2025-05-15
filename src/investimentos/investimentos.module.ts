import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InvestimentosController } from './investimentos.controller';
import { InvestimentosService } from './investimentos.service';
import { Investimento, InvestimentoSchema } from './schemas/investimento.schema';
import { Dashboard, DashboardSchema } from '../dashboard/schemas/dashboard.schema';
import { Banco, BancoSchema } from '../bancos/schemas/banco.schema';
import { Usuario, UsuarioSchema } from '../usuarios/schemas/usuario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Investimento.name, schema: InvestimentoSchema },
      { name: Dashboard.name, schema: DashboardSchema },
      { name: Banco.name, schema: BancoSchema },
      { name: Usuario.name, schema: UsuarioSchema },
    ]),
  ],
  controllers: [InvestimentosController],
  providers: [InvestimentosService],
})
export class InvestimentosModule {} 