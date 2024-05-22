import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: any; // Define the user property on the Request object
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET as string,
    (err: jwt.VerifyErrors | null, decodedToken: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = decodedToken;
      next();
    }
  );
};

export const generateToken = (user: any) => {
  const plainUser = user.toObject ? user.toObject() : user;
  return jwt.sign(plainUser, process.env.JWT_SECRET as string, {
    expiresIn: "2d",
  });
};
