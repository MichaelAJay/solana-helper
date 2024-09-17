import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';

type NodeConnectionException = {
  cause?: {
    errno: number;
    code: string;
    syscall: string;
    address: string;
    port: number;
  }
}

@Catch()
export class NodeConnectionRefusedFilter implements ExceptionFilter {
  catch(exception: NodeConnectionException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception.cause) {
      const { cause } = exception;
      switch (cause.errno) {
        case -61:
          response.status(503).json({
            message: 'The server was unable to connect to a required service'
          })
          break;
        default:
          response.status(500).json({
            message: 'Unknown server error'
          });
      }
    } else {
      response.status(500).json({
        message: 'Unknown server error'
      });
    }
  }
}
