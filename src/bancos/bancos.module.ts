import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BancosController } from './bancos.controller';
import { BancosService } from './bancos.service';
import { Banco, BancoSchema } from './schemas/banco.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Banco.name, schema: BancoSchema }])
  ],
  controllers: [BancosController],
  providers: [BancosService]
})
export class BancosModule { } 