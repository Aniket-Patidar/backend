import { Request, Response, NextFunction } from "express";

const catchAsyncError =
  (fun: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fun(req, res, next)).catch(next);

export default catchAsyncError;
