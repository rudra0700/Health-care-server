import express from "express";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../../generated/prisma/enums";
import { DoctorScheduleController } from "./doctorSchedule.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createDoctorScheduleValidationSchema } from "./doctorSchedule.validation";

const router = express.Router();

router.post(
  "/",
  validateRequest(createDoctorScheduleValidationSchema),
  auth(UserRole.DOCTOR),
  DoctorScheduleController.insertIntoDB,
);

export const doctorScheduleRoutes = router;
