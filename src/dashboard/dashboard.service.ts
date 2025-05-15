import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Dashboard, DashboardDocument } from './schemas/dashboard.schema';

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Dashboard.name) private dashboardModel: Model<DashboardDocument>
  ) {}

  async findAll(): Promise<Dashboard[]> {
    return this.dashboardModel.find().exec();
  }
} 