import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './contact.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'dpg-d1cr9nmr433s738704d0-a',
      port: 5432,
      username: 'postgres_qphd_user',
      password: 'P7OodKkofCEepvDthnmVDAS7jvhEAqXn',
      database: 'postgres_qphd',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Contact]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
