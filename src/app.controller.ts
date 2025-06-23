import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { IdentifyDto } from './identify.dto';

@Controller("identify")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  @HttpCode(200)
  identify(@Body() identifyDto:IdentifyDto){
    return this.appService.identify(identifyDto);
  }

}
