import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ParamsDto } from './dto/params.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
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

      mockUsersService.create.mockResolvedValue(expectedUser);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      const createUserDto: CreateUserDto = {
        name: 'João Silva',
        email: 'joao@example.com',
      };

      mockUsersService.create.mockRejectedValue(
        new ConflictException('Email já está em uso'),
      );

      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
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

      mockUsersService.findAll.mockResolvedValue(expectedUsers);

      const result = await controller.findAll();

      expect(result).toEqual(expectedUsers);
      expect(mockUsersService.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const params: ParamsDto = { id: userId };

      const expectedUser = {
        id: userId,
        name: 'João Silva',
        email: 'joao@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
        reviews: [],
      };

      mockUsersService.findOne.mockResolvedValue(expectedUser);

      const result = await controller.findOne(params);

      expect(result).toEqual(expectedUser);
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const params: ParamsDto = { id: userId };

      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException(`Usuário com ID ${userId} não encontrado`),
      );

      await expect(controller.findOne(params)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const params: ParamsDto = { id: userId };
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

      mockUsersService.update.mockResolvedValue(expectedUser);

      const result = await controller.update(params, updateUserDto);

      expect(result).toEqual(expectedUser);
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const params: ParamsDto = { id: userId };
      const updateUserDto: UpdateUserDto = {
        name: 'João Silva Atualizado',
      };

      mockUsersService.update.mockRejectedValue(
        new NotFoundException(`Usuário com ID ${userId} não encontrado`),
      );

      await expect(controller.update(params, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUsersService.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it('should throw ConflictException when email already exists', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const params: ParamsDto = { id: userId };
      const updateUserDto: UpdateUserDto = {
        email: 'existing@example.com',
      };

      mockUsersService.update.mockRejectedValue(
        new ConflictException('Email já está em uso'),
      );

      await expect(controller.update(params, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const params: ParamsDto = { id: userId };

      const expectedResponse = { message: 'Usuário removido com sucesso' };

      mockUsersService.remove.mockResolvedValue(expectedResponse);

      const result = await controller.remove(params);

      expect(result).toEqual(expectedResponse);
      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const params: ParamsDto = { id: userId };

      mockUsersService.remove.mockRejectedValue(
        new NotFoundException(`Usuário com ID ${userId} não encontrado`),
      );

      await expect(controller.remove(params)).rejects.toThrow(NotFoundException);
      expect(mockUsersService.remove).toHaveBeenCalledWith(userId);
    });
  });
});
