import { Controller, Get, Param, Post, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BancosService } from './bancos.service';
import { Banco } from './schemas/banco.schema';
import { HistoricoResponse } from './bancos.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';

@ApiTags('Bancos')
@Controller('bancos')
export class BancosController {
  constructor(private readonly bancosService: BancosService) { }

  @Get()
  @ApiOperation({ summary: 'Listar todos os bancos' })
  async findAll(): Promise<Banco[]> {
    return this.bancosService.findAll();
  }

  @Get(':id/historico')
  @ApiOperation({ summary: 'Buscar histórico de atualizações do banco' })
  async getHistorico(@Param('id') id: string): Promise<HistoricoResponse> {
    return this.bancosService.getHistorico(id);
  }

  @Post(':id/logo')
  @ApiOperation({ summary: 'Fazer upload da logo do banco' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png)$/,
        })
        .addMaxSizeValidator({
          maxSize: 5 * 1024 * 1024 // 5MB
        })
        .build(),
    ) file: Express.Multer.File,
  ): Promise<Banco> {
    return this.bancosService.uploadLogo(id, file);
  }

  @Delete(':id/logo')
  @ApiOperation({ summary: 'Deletar a logo do banco' })
  async deleteLogo(@Param('id') id: string): Promise<Banco> {
    return this.bancosService.deleteLogo(id);
  }
} 