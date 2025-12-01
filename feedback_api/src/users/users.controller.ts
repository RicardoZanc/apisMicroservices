import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, createUserSchema, CreateUserDtoSwagger } from './dto/create-user.dto';
import { UpdateUserDto, updateUserSchema, UpdateUserDtoSwagger } from './dto/update-user.dto';
import { ParamsDto, paramsSchema, ParamsDtoSwagger } from './dto/params.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ZodParamsPipe } from '../common/pipes/zod-params.pipe';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo usuário' })
  @ApiBody({ type: CreateUserDtoSwagger })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os usuários' })
  @ApiResponse({ status: 200, description: 'Lista de usuários retornada com sucesso' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um usuário por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @UsePipes(new ZodParamsPipe(paramsSchema))
  findOne(@Param() params: ParamsDto) {
    return this.usersService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar um usuário' })
  @ApiParam({ name: 'id', type: String, description: 'UUID do usuário' })
  @ApiBody({ type: UpdateUserDtoSwagger })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @UsePipes(new ZodParamsPipe(paramsSchema), new ZodValidationPipe(updateUserSchema))
  update(@Param() params: ParamsDto, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(params.id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um usuário' })
  @ApiParam({ name: 'id', type: String, description: 'UUID do usuário' })
  @ApiResponse({ status: 200, description: 'Usuário removido com sucesso' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @UsePipes(new ZodParamsPipe(paramsSchema))
  remove(@Param() params: ParamsDto) {
    return this.usersService.remove(params.id);
  }
}
