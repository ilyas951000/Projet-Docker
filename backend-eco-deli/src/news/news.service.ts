import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { News } from './entities/news.entity';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
  ) {}

  create(data: Partial<News>) {
    return this.newsRepository.save(data);
  }

  findAll() {
    return this.newsRepository.find({ order: { createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.newsRepository.findOneBy({ id });
  }

  async update(id: number, data: Partial<News>) {
    const news = await this.newsRepository.findOneBy({ id });
    if (!news) throw new NotFoundException();
    Object.assign(news, data);
    return this.newsRepository.save(news);
  }

  async remove(id: number) {
    const news = await this.newsRepository.findOneBy({ id });
    if (!news) throw new NotFoundException();
    return this.newsRepository.remove(news);
  }
}
