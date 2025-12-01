import { z } from 'zod';
import { createReviewSchema } from './create-review.dto';
import { PartialType } from '@nestjs/swagger';
import { CreateReviewDtoSwagger } from './create-review.dto';

export const updateReviewSchema = createReviewSchema.partial();

export type UpdateReviewDto = z.infer<typeof updateReviewSchema>;

export class UpdateReviewDtoSwagger extends PartialType(CreateReviewDtoSwagger) {}
