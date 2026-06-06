import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserServices } from "./user.services";
import sendResponse from "../../shared/sendResponse";

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createPatient(req);
  
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient Created Successfully",
    data: result,
  });
});

export const UserController = {
  createPatient,
};
