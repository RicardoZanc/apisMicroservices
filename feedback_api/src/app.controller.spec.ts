import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return "Ok!"', () => {
      const result = appController.getHealth();
      expect(result).toBe('Ok!');
    });

    it('should call appService.getHealth', () => {
      const getHealthSpy = jest.spyOn(appService, 'getHealth');
      appController.getHealth();
      expect(getHealthSpy).toHaveBeenCalled();
    });
  });
});
