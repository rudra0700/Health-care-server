import { UserStatus } from "../../../../generated/prisma/enums";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import config from "../../../config";
import { jwtHelper } from "../../helper/jwtHelper";
import ApiErrors from "../../errors/apiErrors";
import httpStatus from "http-status"

const login = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
  });

  const isCorrctPassword = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isCorrctPassword) {
    throw new ApiErrors(httpStatus.BAD_REQUEST, "Password is incorrect");
  }

  const accessToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.jwt_access_secret as string,
    "1h",
  );

  const refreshToken = jwtHelper.generateToken(
    { email: user.email, role: user.role },
    config.jwt.jwt_refresh_secret as string,
    "90d",
  );

  return {
    accessToken,
    refreshToken,
    needChangePassword: user.needChangePassword
  };
};

export const AuthServices = {
  login,
};
