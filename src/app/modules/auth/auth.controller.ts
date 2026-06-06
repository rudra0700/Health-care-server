import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthServices } from "./auth.services";
import { sendCookie } from "../../helper/sendCookie";

const login = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);
  const { accessToken, refreshToken, needChangePassword } = result;

  sendCookie(res, "accessToken", accessToken, 1000 * 60 * 60);
  sendCookie(res, "refreshToken", refreshToken, 1000 * 60 * 60 * 24 * 90);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User logged in Successfully",
    data: {
      needChangePassword,
    },
  });
});

export const AuthController = {
  login,
};
