import { Response } from "express";

export const sendCookie = (
  res: Response,
  tokenType: string,
  token: string,
  maxAge: number,
) => {
  res.cookie(tokenType, token, {
    secure: true,
    httpOnly: true,
    sameSite: "none",
    maxAge: maxAge,
  });
};
