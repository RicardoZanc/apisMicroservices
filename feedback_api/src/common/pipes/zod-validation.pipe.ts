import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      const parsedValue = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((err) => ({
          path: err.path.join('.'),
          message: err.message,
        }));
        throw new BadRequestException({
          message: 'Validação falhou',
          errors: errorMessages,
        });
      }
      throw new BadRequestException('Validação falhou');
    }
  }
}

