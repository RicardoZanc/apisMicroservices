import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@example.com',
      };

      const expectedUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.create.mockResolvedValue(expectedUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@example.com',
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Email já está em uso',
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users ordered by name', async () => {
      const expectedUsers = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'João Silva',
          email: 'joao@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '223e4567-e89b-12d3-a456-426614174001',
          name: 'Maria Santos',
          email: 'maria@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(expectedUsers);

      const result = await service.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: {
          name: 'asc',
        },
      });
    });
  });

  describe('findOne', () => {
    it('should return a user with reviews', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      const expectedUser = {
        id: userId,
        name: 'João Silva',
        email: 'joao@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        reviews: [],
      };

      mockPrismaService.user.findUnique.mockResolvedValue(expectedUser);

      const result = await service.findOne(userId);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        include: {
          reviews: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(userId)).rejects.toThrow(
        `Usuário com ID ${userId} não encontrado`,
      );
    });
  });

  describe('update', () => {
    it('should update a user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        name: 'João Silva Atualizado',
      };

      const expectedUser = {
        id: userId,
        name: 'João Silva Atualizado',
        email: 'joao@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.update.mockResolvedValue(expectedUser);

      const result = await service.update(userId, updateUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateUserDto,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        name: 'João Silva Atualizado',
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record to update not found',
        {
          code: 'P2025',
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.user.update.mockRejectedValue(prismaError);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        `Usuário com ID ${userId} não encontrado`,
      );
    });

    it('should throw ConflictException when email already exists', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.user.update.mockRejectedValue(prismaError);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        'Email já está em uso',
      );
    });
  });

  describe('remove', () => {
    it('should remove a user successfully', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      mockPrismaService.user.delete.mockResolvedValue(undefined);

      const result = await service.remove(userId);

      expect(result).toEqual({ message: 'Usuário removido com sucesso' });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Record to delete does not exist',
        {
          code: 'P2025',
          clientVersion: '1.0.0',
        },
      );

      mockPrismaService.user.delete.mockRejectedValue(prismaError);

      await expect(service.remove(userId)).rejects.toThrow(NotFoundException);
      await expect(service.remove(userId)).rejects.toThrow(
        `Usuário com ID ${userId} não encontrado`,
      );
    });
  });
});
