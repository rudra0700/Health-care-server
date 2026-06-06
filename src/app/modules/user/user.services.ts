import { Request } from "express";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helper/fileUpload";

const createPatient = async (req: Request) => {
  if (req.file) {
    const uploadedResult = await fileUploader.uploadToCloudinary(req.file);
    req.body.patient.profilePhoto = uploadedResult?.secure_url;
  }
  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  const result = await prisma.$transaction(async (tx) => {
    await tx.user.create({
      data: {
        email: req.body.patient.email,
        password: hashedPassword,
      },
    });

    return await tx.patient.create({
      data: req.body.patient,
    });
  });

  return result;
};

export const UserServices = {
  createPatient,
};
