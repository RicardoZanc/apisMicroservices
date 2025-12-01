import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Prisma } from '../generated/prisma/client';
import { EventsService } from 'src/events/events.service';

@Injectable()
export class ReviewsService {
  constructor(
    private prisma: PrismaService,
    private eventsService: EventsService,
  ) {}

  async create(createReviewDto: CreateReviewDto) {
    try {
      // Verifica se o usuário existe
      const user = await this.prisma.user.findUnique({
        where: { id: createReviewDto.userId },
      });

      if (!user) {
        throw new NotFoundException(`Usuário com ID ${createReviewDto.userId} não encontrado`);
      }

      const review = await this.prisma.review.create({
        data: createReviewDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Dispara evento de criação de review
      await this.eventsService.publishReviewCreated(
        createReviewDto.userId,
        createReviewDto.score,
      );

      return review;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2003') {
          throw new BadRequestException('Usuário inválido');
        }
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Review com ID ${id} não encontrado`);
    }

    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    try {
      // Se estiver atualizando o userId, verifica se o novo usuário existe
      if (updateReviewDto.userId) {
        const user = await this.prisma.user.findUnique({
          where: { id: updateReviewDto.userId },
        });

        if (!user) {
          throw new NotFoundException(`Usuário com ID ${updateReviewDto.userId} não encontrado`);
        }
      }

      // Busca a review atual para atualizar estatísticas do usuário antigo se necessário
      const currentReview = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!currentReview) {
        throw new NotFoundException(`Review com ID ${id} não encontrado`);
      }

      const review = await this.prisma.review.update({
        where: { id },
        data: updateReviewDto,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Dispara evento de atualização com dados novos e antigos
      await this.eventsService.publishReviewUpdated(
        review.userId,
        review.score,
        updateReviewDto.userId !== currentReview.userId ? currentReview.userId : undefined,
        updateReviewDto.score !== currentReview.score ? currentReview.score : undefined,
      );

      return review;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Review com ID ${id} não encontrado`);
        }
        if (error.code === 'P2003') {
          throw new BadRequestException('Usuário inválido');
        }
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const review = await this.prisma.review.findUnique({
        where: { id },
      });

      if (!review) {
        throw new NotFoundException(`Review com ID ${id} não encontrado`);
      }

      await this.prisma.review.delete({
        where: { id },
      });

      // Dispara evento de deleção de review
      await this.eventsService.publishReviewDeleted(review.userId, review.score);

      return { message: 'Review removido com sucesso' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Review com ID ${id} não encontrado`);
        }
      }
      throw error;
    }
  }

}
