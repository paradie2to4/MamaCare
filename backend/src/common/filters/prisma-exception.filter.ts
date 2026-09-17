import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong. Please try again.';

    switch (exception.code) {
      case 'P2002':
        status = HttpStatus.CONFLICT;
        message = 'A record with this value already exists.';
        break;
      case 'P2025':
        status = HttpStatus.NOT_FOUND;
        message = 'The requested record was not found.';
        break;
      case 'P2021':
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Database tables have not been created yet. Please run `npx prisma migrate deploy` on your database.';
        break;
      case 'P1001':
        status = HttpStatus.SERVICE_UNAVAILABLE;
        message = 'Cannot connect to database server. Please verify your DATABASE_URL environment variable.';
        break;
      default:
        break;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: 'PrismaError',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
