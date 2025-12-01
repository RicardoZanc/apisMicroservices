import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma.service';
import { EventsService } from '../events/events.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let prismaService: PrismaService;
  let eventsService: EventsService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockEventsService = {
    publishReviewCreated: jest.fn(),
    publishReviewUpdated: jest.fn(),
    publishReviewDeleted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    prismaService = module.get<PrismaService>(PrismaService);
    eventsService = module.get<EventsService>(EventsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a review successfully and publish event', async () => {
      const createReviewDto: CreateReviewDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
        comment: 'Excelente produto!',
      };

      const mockUser = {
        id: createReviewDto.userId,
        name: 'João Silva',
        email: 'joao@example.com',
      };

      const expectedReview = {
        id: '223e4567-e89b-12d3-a456-426614174001',
        ...createReviewDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: mockUser,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.review.create.mockResolvedValue(expectedReview);
      mockEventsService.publishReviewCreated.mockResolvedValue(undefined);

      const result = await service.create(createReviewDto);

      expect(result).toEqual(expectedReview);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: createReviewDto.userId },
      });
      expect(mockPrismaService.review.create).toHaveBeenCalledWith({
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
      expect(mockEventsService.publishReviewCreated).toHaveBeenCalledWith(
        createReviewDto.userId,
        createReviewDto.score,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const createReviewDto: CreateReviewDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.create(createReviewDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createReviewDto)).rejects.toThrow(
        `Usuário com ID ${createReviewDto.userId} não encontrado`,
      );
      expect(mockPrismaService.review.create).not.toHaveBeenCalled();
      expect(mockEventsService.publishReviewCreated).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user is invalid (Prisma error)', async () => {
      const createReviewDto: CreateReviewDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
      };

      const mockUser = {
        id: createReviewDto.userId,
        name: 'João Silva',
        email: 'joao@example.com',
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.review.create.mockRejectedValue(prismaError);

      await expect(service.create(createReviewDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createReviewDto)).rejects.toThrow(
        'Usuário inválido',
      );
      expect(mockEventsService.publishReviewCreated).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of reviews with users', async () => {
      const expectedReviews = [
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          userId: '123e4567-e89b-12d3-a456-426614174000',
          score: 5,
          comment: 'Excelente!',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'João Silva',
            email: 'joao@example.com',
          },
        },
      ];

      mockPrismaService.review.findMany.mockResolvedValue(expectedReviews);

      const result = await service.findAll();

      expect(result).toEqual(expectedReviews);
      expect(mockPrismaService.review.findMany).toHaveBeenCalledWith({
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
    });
  });

  describe('findOne', () => {
    it('should return a review with user', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';

      const expectedReview = {
        id: reviewId,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
        comment: 'Excelente!',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'João Silva',
          email: 'joao@example.com',
        },
      };

      mockPrismaService.review.findUnique.mockResolvedValue(expectedReview);

      const result = await service.findOne(reviewId);

      expect(result).toEqual(expectedReview);
      expect(mockPrismaService.review.findUnique).toHaveBeenCalledWith({
        where: { id: reviewId },
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
    });

    it('should throw NotFoundException when review does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';

      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.findOne(reviewId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(reviewId)).rejects.toThrow(
        `Review com ID ${reviewId} não encontrado`,
      );
    });
  });

  describe('update', () => {
    it('should update a review successfully and publish event', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const updateReviewDto: UpdateReviewDto = {
        score: 4,
        comment: 'Muito bom!',
      };

      const currentReview = {
        id: reviewId,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
        comment: 'Excelente!',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedReview = {
        ...currentReview,
        ...updateReviewDto,
        updatedAt: new Date(),
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'João Silva',
          email: 'joao@example.com',
        },
      };

      mockPrismaService.review.findUnique
        .mockResolvedValueOnce(currentReview)
        .mockResolvedValueOnce(currentReview);
      mockPrismaService.review.update.mockResolvedValue(updatedReview);
      mockEventsService.publishReviewUpdated.mockResolvedValue(undefined);

      const result = await service.update(reviewId, updateReviewDto);

      expect(result).toEqual(updatedReview);
      expect(mockPrismaService.review.findUnique).toHaveBeenCalledWith({
        where: { id: reviewId },
      });
      expect(mockPrismaService.review.update).toHaveBeenCalledWith({
        where: { id: reviewId },
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
      expect(mockEventsService.publishReviewUpdated).toHaveBeenCalledWith(
        updatedReview.userId,
        updatedReview.score,
        currentReview.userId, // oldUserId quando updateReviewDto.userId é undefined (undefined !== userId é true)
        currentReview.score, // oldScore quando o score muda
      );
    });

    it('should verify new user exists when updating userId', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const newUserId = '999e4567-e89b-12d3-a456-426614174999';
      const updateReviewDto: UpdateReviewDto = {
        userId: newUserId,
      };

      const currentReview = {
        id: reviewId,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewUser = {
        id: newUserId,
        name: 'Maria Santos',
        email: 'maria@example.com',
      };

      const updatedReview = {
        ...currentReview,
        userId: newUserId,
        updatedAt: new Date(),
        user: mockNewUser,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockNewUser);
      mockPrismaService.review.findUnique.mockResolvedValue(currentReview);
      mockPrismaService.review.update.mockResolvedValue(updatedReview);
      mockEventsService.publishReviewUpdated.mockResolvedValue(undefined);

      const result = await service.update(reviewId, updateReviewDto);

      expect(result).toEqual(updatedReview);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: newUserId },
      });
      expect(mockEventsService.publishReviewUpdated).toHaveBeenCalledWith(
        newUserId,
        currentReview.score,
        currentReview.userId,
        currentReview.score, // oldScore quando updateReviewDto.score é undefined (undefined !== 5 é true)
      );
    });

    it('should throw NotFoundException when new user does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const newUserId = '999e4567-e89b-12d3-a456-426614174999';
      const updateReviewDto: UpdateReviewDto = {
        userId: newUserId,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update(reviewId, updateReviewDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(reviewId, updateReviewDto)).rejects.toThrow(
        `Usuário com ID ${newUserId} não encontrado`,
      );
      expect(mockPrismaService.review.update).not.toHaveBeenCalled();
      expect(mockEventsService.publishReviewUpdated).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when review does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const updateReviewDto: UpdateReviewDto = {
        score: 4,
      };

      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.update(reviewId, updateReviewDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(reviewId, updateReviewDto)).rejects.toThrow(
        `Review com ID ${reviewId} não encontrado`,
      );
      expect(mockPrismaService.review.update).not.toHaveBeenCalled();
      expect(mockEventsService.publishReviewUpdated).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when user is invalid (Prisma error)', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const updateReviewDto: UpdateReviewDto = {
        userId: '999e4567-e89b-12d3-a456-426614174999',
      };

      const currentReview = {
        id: reviewId,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockNewUser = {
        id: updateReviewDto.userId,
        name: 'Maria Santos',
        email: 'maria@example.com',
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.user.findUnique.mockResolvedValue(mockNewUser);
      mockPrismaService.review.findUnique.mockResolvedValue(currentReview);
      mockPrismaService.review.update.mockRejectedValue(prismaError);

      await expect(service.update(reviewId, updateReviewDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(reviewId, updateReviewDto)).rejects.toThrow(
        'Usuário inválido',
      );
      expect(mockEventsService.publishReviewUpdated).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a review successfully and publish event', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';

      const reviewToDelete = {
        id: reviewId,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.review.findUnique.mockResolvedValue(reviewToDelete);
      mockPrismaService.review.delete.mockResolvedValue(undefined);
      mockEventsService.publishReviewDeleted.mockResolvedValue(undefined);

      const result = await service.remove(reviewId);

      expect(result).toEqual({ message: 'Review removido com sucesso' });
      expect(mockPrismaService.review.findUnique).toHaveBeenCalledWith({
        where: { id: reviewId },
      });
      expect(mockPrismaService.review.delete).toHaveBeenCalledWith({
        where: { id: reviewId },
      });
      expect(mockEventsService.publishReviewDeleted).toHaveBeenCalledWith(
        reviewToDelete.userId,
        reviewToDelete.score,
      );
    });

    it('should throw NotFoundException when review does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';

      mockPrismaService.review.findUnique.mockResolvedValue(null);

      await expect(service.remove(reviewId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(reviewId)).rejects.toThrow(
        `Review com ID ${reviewId} não encontrado`,
      );
      expect(mockPrismaService.review.delete).not.toHaveBeenCalled();
      expect(mockEventsService.publishReviewDeleted).not.toHaveBeenCalled();
    });

    it('should handle Prisma error when review does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';

      const reviewToDelete = {
        id: reviewId,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record to delete does not exist',
        {
          code: 'P2025',
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.review.findUnique.mockResolvedValue(reviewToDelete);
      mockPrismaService.review.delete.mockRejectedValue(prismaError);

      await expect(service.remove(reviewId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(reviewId)).rejects.toThrow(
        `Review com ID ${reviewId} não encontrado`,
      );
      expect(mockEventsService.publishReviewDeleted).not.toHaveBeenCalled();
    });
  });
});
