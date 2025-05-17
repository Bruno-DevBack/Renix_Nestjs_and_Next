import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { BancoAgentService } from './banco-agent.service';
import { BancoAgentController } from './banco-agent.controller';
import { Banco, BancoSchema } from '../bancos/schemas/banco.schema';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        MongooseModule.forFeature([{ name: Banco.name, schema: BancoSchema }])
    ],
    controllers: [BancoAgentController],
    providers: [BancoAgentService],
    exports: [BancoAgentService]
})
export class BancoAgentModule { } 