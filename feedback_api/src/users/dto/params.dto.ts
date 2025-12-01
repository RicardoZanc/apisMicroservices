import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const paramsSchema = z.object({
  id: z.uuid('ID deve ser um UUID válido'),
});

export type ParamsDto = z.infer<typeof paramsSchema>;

export class ParamsDtoSwagger {
  @ApiProperty({
    description: 'ID único do recurso (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  id!: string;
}

