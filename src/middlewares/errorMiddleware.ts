import { Request, Response, NextFunction } from 'express';

function errorMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    let statusCode = err.statusCode || 500; // Default to 500 if statusCode is not provided
    let errorMessage = err.message || 'Internal Server Error';

    res.status(statusCode).json({
        success: false,
        message: errorMessage
    });
}

export default errorMiddleware;
