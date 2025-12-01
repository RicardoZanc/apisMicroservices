import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { ZodType, ZodError } from 'zod';

@Injectable()
export class ZodParamsPipe implements PipeTransform {
  constructor(private schema: ZodType) {}

  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'param') {
      return value;
    }

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
          message: 'Validação de parâmetros falhou',
          errors: errorMessages,
        });
      }
      throw new BadRequestException('Validação de parâmetros falhou');
    }
  }
}

