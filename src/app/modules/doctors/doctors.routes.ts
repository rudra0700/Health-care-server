import express from "express";
import { DoctorController } from "./doctors.controller";
const router = express.Router();

router.get(
    "/",
    DoctorController.getAllFromDB
)

router.patch(
    "/:id",
    DoctorController.updateIntoDB
)
export const DoctorRoutes = router;