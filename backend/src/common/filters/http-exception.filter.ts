import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = isHttpException ? exception.getResponse() : null;
    const message =
      isHttpException && typeof exceptionResponse === 'object' && exceptionResponse !== null
        ? ((exceptionResponse as { message?: string | string[] }).message ?? exception.message)
        : isHttpException
          ? exception.message
          : 'Something went wrong. Please try again.';

    if (!isHttpException) {
      // Never leak raw internal error details (e.g. stack traces, DB errors) to clients.
      this.logger.error(exception instanceof Error ? exception.stack : exception);
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: isHttpException ? exception.name : 'InternalServerError',
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
