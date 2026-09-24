import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env.js";
import userModel, { type IUser } from "../model/user.model.js";
import { sendEmail } from "../service/mail.service.js";
import type { GoogleUser, JwtUser } from "../utils/types.js";

async function sendTokenResponse(
  user: IUser,
  res: Response,
  message: string,
): Promise<void> {
  const token = jwt.sign({ id: user._id, role: user.role }, env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    user: {
      _id: user._id,
      email: user.email,
      fullname: user.fullname,
      contact: user.contact,
      role: user.role,
    },
    success: true,
    message,
  });
}

export const register = async (req: Request, res: Response) => {
  const { email, password, fullname, contact, isSeller } = req.body;
  try {
    const existingUser = await userModel.findOne({
      $or: [{ email }, { contact }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email or contact already exists",
      });
    }

    const user = await userModel.create({
      email,
      password,
      fullname,
      emailVerified: false,
      contact,
      role: isSeller ? "seller" : "buyer",
    });

    const emailVerificationToken = jwt.sign(
      { email: user.email },
      env.EMAIL_VERIFICATION_TOKEN,
      { expiresIn: "15m" },
    );

    console.log({ emailVerificationToken });

    await sendEmail({
      to: user.email,
      subject: "Email Verification",
      html: `<p>Hi ${user.fullname},</p>
             <p>Thank you for registering at <strong>Vastra</strong>.</p>
             <p>Please verify your email address by clicking below:</p>

             <a href="${env.FRONTEND_URL}/verify-email?token=${emailVerificationToken}">
                Verify Email
             </a>
             <p>If you did not create an account, please ignore this email.</p>
             <p>Best regards,<br>The Vastra Team</p>`,
    });

    res.status(200).json({
      success: true,
      message:
        "User registered successfully. Please check your email for verification.",
      user: {
        _id: user._id,
        email: user.email,
        fullname: user.fullname,
        contact: user.contact,
        role: user.role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    if (!user.emailVerified) {
      return res.status(400).json({
        message: "Please verify your email before logging in",
      });
    }
    await sendTokenResponse(user, res, "User logged in successfully");
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const googleAuthCallback = async (req: Request, res: Response) => {
  try {
    const userData = req.user as GoogleUser;

    const { id, displayName, emails } = userData;

    const email = emails?.[0]?.value;

    if (!email) {
      return res.status(400).json({
        message: "Google account email not found",
      });
    }

    let user = await userModel.findOne({ email });

    if (!user) {
      user = await userModel.create({
        email,
        googleId: id,
        fullname: displayName,
        emailVerified: true,
      });
    }

    const token = jwt.sign(
      { id: user?._id, role: user?.role },
      env.JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.redirect(env.FRONTEND_URL);
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Verification token is required.",
      });
    }

    const decoded = jwt.verify(token, env.EMAIL_VERIFICATION_TOKEN) as {
      email: string;
    };

    if (!decoded) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token.",
      });
    }

    const user = await userModel.findOne({ email: decoded.email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        message: "Email already verified.",
      });
    }

    user.emailVerified = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If this email is registered, a password reset link has been sent.",
      });
    }
    const forgotPassToken = jwt.sign(
      { email: user.email },
      env.FORGOT_PASSWORD_TOKEN,
      { expiresIn: "15m" },
    );

    await sendEmail({
      to: user.email,
      subject: "Password Reset",
      html: ` <p>Hi ${user.fullname},</p>
                <p>Click the link below to reset your password:</p>
                <a href="${env.FRONTEND_URL}/reset-password?token=${forgotPassToken}">
                      Reset Password
                </a>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Best regards,<br>The Resume Analyzer Team</p>`,
    });

    return res.status(200).json({
      message: "Password reset email sent successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    const { password } = req.body;

    if (!token || typeof token !== "string") {
      return res.status(400).json({
        success: false,
        message: "Reset token is required",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required",
      });
    }

    const decoded = jwt.verify(token, env.FORGOT_PASSWORD_TOKEN) as {
      email: string;
    };

    const user = await userModel.findOne({
      email: decoded.email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    user.password = password;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(400).json({
      success: false,
      message: "Invalid or expired reset token",
    });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user as JwtUser;

    if (!currentUser) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await userModel.findById(currentUser.id).select("-password");

    return res.status(200).json({
      message: "User fetched successfully",
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};
