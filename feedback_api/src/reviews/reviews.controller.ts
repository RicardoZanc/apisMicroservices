import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, createReviewSchema, CreateReviewDtoSwagger } from './dto/create-review.dto';
import { UpdateReviewDto, updateReviewSchema, UpdateReviewDtoSwagger } from './dto/update-review.dto';
import { ParamsDto, paramsSchema, ParamsDtoSwagger } from './dto/params.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ZodParamsPipe } from '../common/pipes/zod-params.pipe';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova avaliação' })
  @ApiBody({ type: CreateReviewDtoSwagger })
  @ApiResponse({ status: 201, description: 'Avaliação criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  @UsePipes(new ZodValidationPipe(createReviewSchema))
  create(@Body() createReviewDto: CreateReviewDto) {
    return this.reviewsService.create(createReviewDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as avaliações' })
  @ApiResponse({ status: 200, description: 'Lista de avaliações retornada com sucesso' })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma avaliação por ID' })
  @ApiParam({ name: 'id', type: String, description: 'UUID da avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação encontrada' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  @UsePipes(new ZodParamsPipe(paramsSchema))
  findOne(@Param() params: ParamsDto) {
    return this.reviewsService.findOne(params.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma avaliação' })
  @ApiParam({ name: 'id', type: String, description: 'UUID da avaliação' })
  @ApiBody({ type: UpdateReviewDtoSwagger })
  @ApiResponse({ status: 200, description: 'Avaliação atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @UsePipes(new ZodParamsPipe(paramsSchema), new ZodValidationPipe(updateReviewSchema))
  update(@Param() params: ParamsDto, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(params.id, updateReviewDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma avaliação' })
  @ApiParam({ name: 'id', type: String, description: 'UUID da avaliação' })
  @ApiResponse({ status: 200, description: 'Avaliação removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Avaliação não encontrada' })
  @UsePipes(new ZodParamsPipe(paramsSchema))
  remove(@Param() params: ParamsDto) {
    return this.reviewsService.remove(params.id);
  }
}
