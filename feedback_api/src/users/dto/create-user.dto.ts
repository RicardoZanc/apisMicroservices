import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(255, 'Nome deve ter no máximo 255 caracteres'),
  email: z.email('Email inválido').max(255, 'Email deve ter no máximo 255 caracteres'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;

export class CreateUserDtoSwagger {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'João Silva',
    minLength: 1,
    maxLength: 255,
  })
  name!: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao.silva@example.com',
    maxLength: 255,
  })
  email!: string;
}

