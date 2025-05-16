import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banco, BancoDocument } from './schemas/banco.schema';

@Injectable()
export class BancosService {
  constructor(
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>
  ) {}

  async findAll(): Promise<Banco[]> {
    return this.bancoModel.find().exec();
  }
} 