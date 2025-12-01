import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ParamsDto } from './dto/params.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ReviewsController', () => {
  let controller: ReviewsController;
  let service: ReviewsService;

  const mockReviewsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReviewsController],
      providers: [
        {
          provide: ReviewsService,
          useValue: mockReviewsService,
        },
      ],
    }).compile();

    controller = module.get<ReviewsController>(ReviewsController);
    service = module.get<ReviewsService>(ReviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a review', async () => {
      const createReviewDto: CreateReviewDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
        comment: 'Excelente produto!',
      };

      const expectedReview = {
        id: '223e4567-e89b-12d3-a456-426614174001',
        ...createReviewDto,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: createReviewDto.userId,
          name: 'João Silva',
          email: 'joao@example.com',
        },
      };

      mockReviewsService.create.mockResolvedValue(expectedReview);

      const result = await controller.create(createReviewDto);

      expect(result).toEqual(expectedReview);
      expect(mockReviewsService.create).toHaveBeenCalledWith(createReviewDto);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const createReviewDto: CreateReviewDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
      };

      mockReviewsService.create.mockRejectedValue(
        new NotFoundException(
          `Usuário com ID ${createReviewDto.userId} não encontrado`,
        ),
      );

      await expect(controller.create(createReviewDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockReviewsService.create).toHaveBeenCalledWith(createReviewDto);
    });

    it('should throw BadRequestException when user is invalid', async () => {
      const createReviewDto: CreateReviewDto = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 5,
      };

      mockReviewsService.create.mockRejectedValue(
        new BadRequestException('Usuário inválido'),
      );

      await expect(controller.create(createReviewDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of reviews', async () => {
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

      mockReviewsService.findAll.mockResolvedValue(expectedReviews);

      const result = await controller.findAll();

      expect(result).toEqual(expectedReviews);
      expect(mockReviewsService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a review by id', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const params: ParamsDto = { id: reviewId };

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

      mockReviewsService.findOne.mockResolvedValue(expectedReview);

      const result = await controller.findOne(params);

      expect(result).toEqual(expectedReview);
      expect(mockReviewsService.findOne).toHaveBeenCalledWith(reviewId);
    });

    it('should throw NotFoundException when review does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const params: ParamsDto = { id: reviewId };

      mockReviewsService.findOne.mockRejectedValue(
        new NotFoundException(`Review com ID ${reviewId} não encontrado`),
      );

      await expect(controller.findOne(params)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockReviewsService.findOne).toHaveBeenCalledWith(reviewId);
    });
  });

  describe('update', () => {
    it('should update a review', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const params: ParamsDto = { id: reviewId };
      const updateReviewDto: UpdateReviewDto = {
        score: 4,
        comment: 'Muito bom!',
      };

      const expectedReview = {
        id: reviewId,
        userId: '123e4567-e89b-12d3-a456-426614174000',
        score: 4,
        comment: 'Muito bom!',
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'João Silva',
          email: 'joao@example.com',
        },
      };

      mockReviewsService.update.mockResolvedValue(expectedReview);

      const result = await controller.update(params, updateReviewDto);

      expect(result).toEqual(expectedReview);
      expect(mockReviewsService.update).toHaveBeenCalledWith(
        reviewId,
        updateReviewDto,
      );
    });

    it('should throw NotFoundException when review does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const params: ParamsDto = { id: reviewId };
      const updateReviewDto: UpdateReviewDto = {
        score: 4,
      };

      mockReviewsService.update.mockRejectedValue(
        new NotFoundException(`Review com ID ${reviewId} não encontrado`),
      );

      await expect(controller.update(params, updateReviewDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockReviewsService.update).toHaveBeenCalledWith(
        reviewId,
        updateReviewDto,
      );
    });

    it('should throw NotFoundException when new user does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const params: ParamsDto = { id: reviewId };
      const updateReviewDto: UpdateReviewDto = {
        userId: '999e4567-e89b-12d3-a456-426614174999',
      };

      mockReviewsService.update.mockRejectedValue(
        new NotFoundException(
          `Usuário com ID ${updateReviewDto.userId} não encontrado`,
        ),
      );

      await expect(controller.update(params, updateReviewDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a review', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const params: ParamsDto = { id: reviewId };

      const expectedResponse = { message: 'Review removido com sucesso' };

      mockReviewsService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(params);

      expect(result).toEqual(expectedResponse);
      expect(mockReviewsService.remove).toHaveBeenCalledWith(reviewId);
    });

    it('should throw NotFoundException when review does not exist', async () => {
      const reviewId = '223e4567-e89b-12d3-a456-426614174001';
      const params: ParamsDto = { id: reviewId };

      mockReviewsService.remove.mockRejectedValue(
        new NotFoundException(`Review com ID ${reviewId} não encontrado`),
      );

      await expect(controller.remove(params)).rejects.toThrow(NotFoundException);
      expect(mockReviewsService.remove).toHaveBeenCalledWith(reviewId);
    });
  });
});
