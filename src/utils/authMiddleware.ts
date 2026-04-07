 
import { verifyAndDecodeJWT } from "./auth-helpers";
import { UnauthenticatedError } from "./unauthenticated-error";
import { UserSessions } from "../entities/UserSessions";

export const protect = async (req: any, res: any, next: any) => {
 try {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    throw new UnauthenticatedError("No token provided");
  }

  const decoded = verifyAndDecodeJWT(token);
const userId = decoded.userId || decoded.id;
  const session = await UserSessions.findOne({
    where: { 
      token: token, 
   
      is_valid: true 
    },
    relations: ["user"] 
  });

if (!session || !session.user || session.user.id !== userId) {
      throw new UnauthenticatedError("Invalid or expired session");
  }

  if (new Date() > session.expires_at) {
    session.is_valid = false;
    await session.save();
    throw new UnauthenticatedError("Session expired");
  }
  req.authenticatedUserId = session.user.id;
  
  next();
} catch (error) {
  console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Session expired." });
  }
};