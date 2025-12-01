import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Verificar saúde da aplicação' })
  @ApiResponse({ status: 200, description: 'Aplicação está saudável' })
  getHealth() {
    return this.appService.getHealth();
  }
}
