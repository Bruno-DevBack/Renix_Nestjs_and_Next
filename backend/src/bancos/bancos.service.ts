import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Banco, BancoDocument, AtualizacaoHistorico } from './schemas/banco.schema';

export interface HistoricoResponse {
  nome_banco: string;
  ultima_atualizacao: Date;
  historico: AtualizacaoHistorico[];
}

@Injectable()
export class BancosService {
  constructor(
    @InjectModel(Banco.name) private bancoModel: Model<BancoDocument>
  ) { }

  async findAll(): Promise<Banco[]> {
    return this.bancoModel.find().exec();
  }

  async getHistorico(id: string): Promise<HistoricoResponse> {
    const banco = await this.bancoModel.findById(id);
    if (!banco) {
      throw new NotFoundException('Banco não encontrado');
    }

    return {
      nome_banco: banco.nome_banco,
      ultima_atualizacao: banco.ultima_atualizacao,
      historico: banco.historico_atualizacoes
    };
  }

  async uploadLogo(id: string, file: Express.Multer.File): Promise<Banco> {
    const banco = await this.bancoModel.findById(id);
    if (!banco) {
      throw new NotFoundException('Banco não encontrado');
    }

    // Converter o buffer da imagem para base64
    const base64Image = file.buffer.toString('base64');
    banco.logoBase64 = `data:${file.mimetype};base64,${base64Image}`;
    return banco.save();
  }

  async deleteLogo(id: string): Promise<Banco> {
    const banco = await this.bancoModel.findById(id);
    if (!banco) {
      throw new NotFoundException('Banco não encontrado');
    }

    banco.logoBase64 = '';
    return banco.save();
  }
} 