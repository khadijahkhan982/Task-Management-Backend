import { Request, Response } from "express";
import { User } from "../entities/User";
import { HttpStatusCode } from "../utils/enum";
import { create_json_response, handleError } from "../helper/helper";
import { APIError } from "../error/api-error";
import { encrypt_password, generateAuthToken, verifyAndDecodeJWT } from "../validation/auth-helpers";
import redisClient from "../config/redis";
import { sendOTPEmail, sendOTPForPasswordReset } from "../helper/email-helper";
import { queryRunnerFunc } from "../utils/queryRunner";
import bcrypt from "bcrypt";
import { UnauthenticatedError } from "../error/unauthenticated-error";
import { UserSessions } from "../entities/UserSessions";

interface AuthRequest extends Request {
  authenticatedUserId?: number;
}


const signup = async (req: any, res: any) => {
  try {
    const { email, password, role } = req.body;
    const existingUser = await User.findOneBy({ email });
    if (existingUser) {
       throw new APIError("Conflict", HttpStatusCode.CONFLICT, true, "Email already exists");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    await redisClient.set(`otp:${email}`, otp, { EX: 600 });
const ping = await redisClient.ping();
console.log(`[REDIS-HEALTH] Ping response: ${ping}`);

await redisClient.set(`otp:${email}`, otp, { EX: 600 });
const verifySet = await redisClient.get(`otp:${email}`);
    console.log(`[DEBUG] Set Redis key otp:${email} to ${otp}`);

    const encrypted_password = await encrypt_password(password);
    
    const newUser = User.create({
      ...req.body,
      password: encrypted_password,
      is_verified: false 
    });
    await newUser.save();

    await sendOTPEmail(email, otp);

    return res.status(HttpStatusCode.CREATED).json(
      create_json_response({ email }, true, "OTP sent.")
    );
  } catch (error: any) {
    return handleError(error, res, "signup");
  }
};

const verifySignup = async (req: any, res: any) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const otp = req.body.otp?.toString().trim();

    if (!email || !otp) {
      throw new APIError("BadRequest", HttpStatusCode.BAD_REQUEST, true, "Email and OTP are required");
    }

    const cachedOtp = await redisClient.get(`otp:${email}`);
    
    if (!cachedOtp) {
      throw new APIError("InvalidToken", HttpStatusCode.BAD_REQUEST, true, "OTP has expired or does not exist");
    }

    if (cachedOtp !== otp) {
      throw new APIError("InvalidToken", HttpStatusCode.BAD_REQUEST, true, "The OTP provided is incorrect.");
    }

    const user = await User.findOneBy({ email });
    if (!user) throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "User not found");

    user.is_verified = true; 
    await user.save();

    await redisClient.del(`otp:${email}`);
     return res.status(HttpStatusCode.OK).json(
      create_json_response(
        { user: { id: user.id, email: user.email } }, 
        true, 
        "Email verified successfully. Please log in."
      )
    );
  } catch (error: any) {
    return handleError(error, res, "verify-signup");
  }
};
const user_login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOneBy({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthenticatedError("Invalid email or password");
    }

    if (!user.is_verified) {
      throw new APIError(
        "Forbidden",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "Please verify your email before logging in.",
                "Please verify your email before logging in."

      );
    }

    const authToken = generateAuthToken({ userId: user.id });
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 24);

    const session = UserSessions.create({
      token: authToken,
      user: user,
      expires_at: expiry,
      is_valid: true,
    });
    await session.save();

    return res.status(HttpStatusCode.OK).json(
      create_json_response(
        {
          user: { id: user.id, name: user.name },
          token: authToken,
        },
        true,
        "Login successful",
      ),
    );
  } catch (error) {
    return handleError(error, res, "login");
  }
};



const user_logout = async (req: AuthRequest, res: Response) => {
  const authUserId = req.authenticatedUserId;
  const authHeader = req.headers.authorization;
  const currentToken = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;
  try {
    
    if (currentToken) {
      await UserSessions.update(
        { token: currentToken, user: { id: authUserId } },
        { is_valid: false },
      );
    }
   
    return res
      ?.status(HttpStatusCode.OK)
      ?.json(create_json_response({}, true, "Logout successful"));
  } catch (error) {
    return handleError(error, res, "logout");
  }
};
const get_user = async (req: AuthRequest, res: any) => {
  const authUserId= req.authenticatedUserId;
  try {
   const user = await User.getRepository()
  .createQueryBuilder("user")
  .leftJoinAndSelect("user.taskAssignments", "task_assignments")
  .leftJoinAndSelect("user.projectUsers", "project_users")
  .leftJoinAndSelect("user.activities", "activity")
  .leftJoinAndSelect("user.comments", "comment")
  .leftJoinAndSelect("user.attachments", "attachment")
  .leftJoinAndSelect("user.status", "status")
  .leftJoinAndSelect("user.assignedTasks", "assignedBy")

  .where("user.id = :id", { id: Number(authUserId) })
  .getOne();

    if (!user) {
      throw new APIError(
        "NotFoundError",
        HttpStatusCode.NOT_FOUND,
        true,
        "User not found.",
        "User not found.",
      );
    }

    return res
      ?.status(HttpStatusCode.OK)
      ?.json(
        create_json_response(
          { user },
          true,
          "User data retrieved successfully",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "get-user");
  }
};

const update_user = async (req: AuthRequest, res: any) => {
  const authUserId = req.authenticatedUserId;
  const { password, email, role, name } = req.body; 

  try {
    const result = await queryRunnerFunc(async (manager) => {
      const user = await manager.findOneBy(User, { id: authUserId });

      if (!user) {
        throw new APIError("NotFound", HttpStatusCode.NOT_FOUND, true, "User not found.");
      }

      if (name) user.name = name;
      if (email) user.email = email.toLowerCase().trim();
      if (role) user.role = role; 

      if (password) {
        user.password = await encrypt_password(password);
      }
    
      return await manager.save(user);
    });

    return res.status(HttpStatusCode.OK).json(
      create_json_response({ user: result }, true, "Profile updated.")
    );
  } catch (error: any) {
    return handleError(error, res, "update-user");
  }
};


const forgot_password = async (req: Request, res: Response) => {
  const { email } = req.body;

  if (!email) {
    throw new APIError(
      "EmailNeeded",
      HttpStatusCode.BAD_REQUEST,
      true,
      "Email required.",
      "Email required",
    );
  }

  try {
    const user = await User.findOneBy({ email });
    if (!user) {
      return res
        .status(HttpStatusCode.OK)
        .json(
          create_json_response(
            {},
            true,
            "If that email exists, an OTP has been sent.",
          ),
        );
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redisClient.set(`reset_otp:${email}`, otp, { EX: 300 });
    console.log(`[REDIS] OTP for ${email}: ${otp}`);

    try {
      await sendOTPForPasswordReset(email, otp);
    } catch (mailError) {
      console.error("Mail Delivery Failed:", mailError);
      throw new APIError(
        "MailError",
        HttpStatusCode.INTERNAL_SERVER,
        true,
        "Failed to send reset email",
        "Failed to send reset email",
      );
    }

    return res
      ?.status(HttpStatusCode.CREATED)
      ?.json(
        create_json_response(
          { email },
          true,
          "OTP sent successfully to your email.",
        ),
      );
  } catch (error: any) {
    return handleError(error, res, "forgot-password");
  }
};
const verify_otp = async (req: Request, res: Response) => {
  const { email, otp } = req.body;

  try {
    const storedOtp = await redisClient.get(`reset_otp:${email}`);

    if (!storedOtp || storedOtp !== otp) {
      throw new APIError(
        "Invalid Token",
        HttpStatusCode.BAD_REQUEST,
        true,
        "Invalid or expired OTP",
        "Invalid or expired OTP",
      );
    }

    const user = await User.findOneBy({ email });
    if (!user) {
      throw new APIError(
        "NotFoundError",
        HttpStatusCode.NOT_FOUND,
        true,
        "User not found.",
        "User not found.",
      );
    }

    await redisClient.del(`reset_otp:${email}`);
    const activeSession = await UserSessions.findOne({
      where: { 
        user: { id: user.id },
        is_valid: true 
      }
    });
    if (!activeSession) {
      throw new APIError(
        "UnauthorizedError",
        HttpStatusCode.UNAUTHORIZED,
        true,
        "No active session found. Please login first.",
        "No active session found. Please login first.",
      );
    }

    return res
      ?.status(HttpStatusCode.OK)
      ?.json(create_json_response({ email }, true, "OTP verified."));
  } catch (error: any) {
    return handleError(error, res, "verify-otp");
  }
};
const reset_password = async (req: Request, res: Response) => {
  const { newPassword } = req.body;
  const authHeader = req.headers.authorization;
  const tokenFromHeader = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!tokenFromHeader) throw new UnauthenticatedError("Token is required");

  try {
    const decoded = verifyAndDecodeJWT(tokenFromHeader);
    const userIdFromToken = Number(decoded.userId);

    const session = await UserSessions.findOne({
      where: { 
        token: tokenFromHeader, 
        user: { id: userIdFromToken },
        is_valid: true 
      }
    });

    if (!session || new Date() > session.expires_at) {
      throw new UnauthenticatedError("Invalid or expired session");
    }

    const user = await User.findOneBy({ id: userIdFromToken });
    if (!user) throw new APIError("NotFoundError", HttpStatusCode.NOT_FOUND, true, "User not found");

    user.password = await encrypt_password(newPassword);
    await user.save();
    await UserSessions.update({ user: { id: user.id } }, { is_valid: false });

    return res.status(HttpStatusCode.CREATED).json(
      create_json_response({}, true, "Password reset successful.")
    );
  } catch (error: any) {
    return handleError(error, res, "reset-password");
  }
};


const delete_user = async (req: any, res: any) => {
  const authUserId = req.authenticatedUserId;

  try {
    await queryRunnerFunc(async (manager) => {
      const user = await manager.findOne(User, {
        where: { id: authUserId }
    
      });

      if (!user) {
        throw new APIError(
          "NotFoundError",
          HttpStatusCode.NOT_FOUND,
          true,
          "User not found.",
          "User not found.",
        );
      }


      await manager.delete("Activity", { user: { id: authUserId } });
      await manager.delete("Attachment", { user: { id: authUserId } });
      await manager.delete("UserSessions", { user: { id: authUserId } });
      await manager.delete("Status", { user: { id: authUserId } });
      await manager.delete("Comment", { user: { id: authUserId } });
      await manager.delete("Project_Users", { user: { id: authUserId } });
      await manager.delete("Task_Assignments", { user: { id: authUserId } });


      await manager.delete(User, { id: authUserId });

  
    });

    return res?.status(HttpStatusCode.OK)?.json(
      // { message: "Deleted successfully." }
      create_json_response({}, true, "Deleted successfully"),
    );
  } catch (error: any) {
    return handleError(error, res, "delete-user");
  }
};

export{
    signup, verifySignup, 
    user_login, user_logout, get_user, update_user,reset_password, delete_user,forgot_password, verify_otp
}