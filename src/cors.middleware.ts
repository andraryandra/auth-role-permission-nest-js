import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Anda bisa mengganti '*' dengan domain frontend Anda
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization',
    );

    // Jika permintaan adalah OPTIONS, kirimkan respons 204 (No Content)
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  }
}
