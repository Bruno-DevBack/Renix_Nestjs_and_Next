import { Controller, Get } from '@nestjs/common';
import { BancosService } from './bancos.service';

@Controller('bancos')
export class BancosController {
  constructor(private readonly bancosService: BancosService) {}

  @Get()
  findAll() {
    return this.bancosService.findAll();
  }
} 