import express from "express";
import { scheduleController } from "./schedule.controller";
import { auth } from "../../middlewares/auth";
import { UserRole } from "../../../../generated/prisma/enums";

const router = express.Router();

router.get("/", auth(UserRole.ADMIN, UserRole.DOCTOR), scheduleController.schedulesForDoctor);
router.post("/", auth(UserRole.ADMIN), scheduleController.insertIntoDB);
router.delete("/:id", auth(UserRole.ADMIN),scheduleController.deleteScheduleFromDB);

export const ScheduleRoutes = router;
