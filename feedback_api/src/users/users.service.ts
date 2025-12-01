import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class UsersService {

  constructor(private prisma: PrismaService) {}


  create(user: any) {
    return this.prisma.user.create({
      data: user
    });
  }

  // findAll() {
  //   return PrismaClient.user.findMany();
  // }

  // findOne(id: string) {
  //   return PrismaClient.user.findUnique({
  //     where: { id }
  //   });
  // }

  //   update(id: string, user: any) {
  //   return PrismaClient.user.update({
  //     where: { id },
  //     data: user
  //   });
  // }

  // remove(id: string) {
  //   return PrismaClient.user.delete({
  //     where: { id }
  //   });
  // }
}
