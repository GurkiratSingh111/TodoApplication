import jwt from "jsonwebtoken";
export const SECRET = "SECr3t"; // This should be in an environment variable in a real application
import { Request, Response, NextFunction } from "express";

export const authenticateJwt = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      if (!user) {
        return res.sendStatus(403);
      }
      if (typeof user === "string") {
        return res.sendStatus(403);
      }
      //req.userId = user.id; // Important
      req.headers["userId"] = user.id; //user is either a string or jet.JWTpayload
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

// module.exports = {
//   authenticateJwt,
//   SECRET,
// };
