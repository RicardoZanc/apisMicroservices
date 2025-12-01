import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const createReviewSchema = z.object({
  userId: z.uuid('userId deve ser um UUID válido'),
  score: z
    .number()
    .int('Score deve ser um número inteiro')
    .min(1, 'Score deve ser no mínimo 1')
    .max(5, 'Score deve ser no máximo 5'),
  comment: z
    .string()
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .optional(),
});

export type CreateReviewDto = z.infer<typeof createReviewSchema>;

export class CreateReviewDtoSwagger {
  @ApiProperty({
    description: 'ID do usuário que está fazendo a avaliação',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  userId!: string;

  @ApiProperty({
    description: 'Nota da avaliação (1 a 5)',
    example: 5,
    minimum: 1,
    maximum: 5,
    type: Number,
  })
  score!: number;

  @ApiProperty({
    description: 'Comentário opcional da avaliação',
    example: 'Excelente produto!',
    maxLength: 1000,
    required: false,
  })
  comment?: string;
}
