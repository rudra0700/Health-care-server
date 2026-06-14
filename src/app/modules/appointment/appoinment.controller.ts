import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AppointmentServices } from "./appointment.services";
import { IJWTPayload } from "../../types/common";

const createAppointment = catchAsync(
  async (req: Request & { user?: IJWTPayload }, res: Response) => {
    const user = req.user;
    const result = await AppointmentServices.createAppointment(
      user as IJWTPayload,
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Appoinment created Successfully",
      data: result,
    });
  },
);

export const AppointmentController = {
  createAppointment,
};
