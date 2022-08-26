import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from '../dtos/create-report.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';
import { User } from '../../users/entities/user.entity';
import { GetEstimateDto } from '../dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);
    report.user = user;
    return this.repo.save(report);
  }

  async approve(id: number, approved: boolean) {
    const report = await this.repo.findOneBy({ id });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    report.approved = approved;
    return this.repo.save(report);
  }

  createEstimate({ make, model, year, mileage, lng, lat }: GetEstimateDto) {
    return this.repo
      .createQueryBuilder('report')
      .select('AVG(price)', 'avg_price')
      .where('make = :make', { make })
      .andWhere('model = :model', { model })
      .andWhere('year - :year BETWEEN -3 AND 3', { year })
      .andWhere('lng - :lng BETWEEN -5 AND 5', { lng })
      .andWhere('lat - :lat BETWEEN -5 AND 5', { lat })
      .andWhere('approved = true')
      .orderBy('ABS(mileage - : mileage)', 'ASC')
      .setParameters({ mileage })
      .limit(3)
      .getRawOne();
  }
}
