import express from "express";
import { AppointmentController } from "./appoinment.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../../generated/prisma/enums";

const router = express.Router();

router.post("/", auth(UserRole.PATIENT), AppointmentController.createAppointment);

export const AppointmentRoutes = router;
