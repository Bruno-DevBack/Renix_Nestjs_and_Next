import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Dashboard, DashboardSchema } from './schemas/dashboard.schema';
import { PdfService } from './pdf.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Dashboard.name, schema: DashboardSchema }])
  ],
  controllers: [DashboardController],
  providers: [DashboardService, PdfService]
})
export class DashboardModule {} 