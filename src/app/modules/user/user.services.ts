import { Request } from "express";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";
import { fileUploader } from "../../helper/fileUpload";
import { UserRole } from "../../../../generated/prisma/enums";
import { paginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "../../../../generated/prisma/client";
import { userSearchableFields } from "./user.constant";

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

const createAdmin = async (req: Request) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.admin.profilePhoto = uploadToCloudinary?.secure_url;
  }

  const hashedPassword: string = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.admin.email,
    password: hashedPassword,
    role: UserRole.ADMIN,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdAdminData = await transactionClient.admin.create({
      data: req.body.admin,
    });

    return createdAdminData;
  });

  return result;
};

const createDoctor = async (req: Request) => {
  const file = req.file;

  if (file) {
    const uploadToCloudinary = await fileUploader.uploadToCloudinary(file);
    req.body.doctor.profilePhoto = uploadToCloudinary?.secure_url;
  }
  const hashedPassword: string = await bcrypt.hash(req.body.password, 10);

  const userData = {
    email: req.body.doctor.email,
    password: hashedPassword,
    role: UserRole.DOCTOR,
  };

  const result = await prisma.$transaction(async (transactionClient) => {
    await transactionClient.user.create({
      data: userData,
    });

    const createdDoctorData = await transactionClient.doctor.create({
      data: req.body.doctor,
    });

    return createdDoctorData;
  });

  return result;
};

// service function without pick function.
// const getAllUserFromDB = async ({page, limit, searchTerm, sortBy, sortOrder, role, status} : {page: number, limit: number, searchTerm?: any, sortBy?: any, sortOrder?:any, role?: any, status?: any}) => {
//   const pageNumber = page || 1;  // must use default value for page, otherwise wont find data or will face error
//   const limitNumber = limit || 10;  // must use default value for limit, otherwise wont find data or will face error

//   const skip =  (pageNumber - 1) * limitNumber;
//   const result = await prisma.user.findMany({
// pagination
//     skip,
//     take: limitNumber,
//     where: {
//       //search
// if we search like this , this will automatically using AND condition over email and role field for searching.
//       email : {
//         contains : searchTerm,
//         mode: "insensitive"
//       },
//       role : {
//         contains : searchTerm,
//         mode: "insensitive"
//       },
//       // filter
//       role: role,
//       status: status
//     },
//     // sorting
//     orderBy : sortBy && sortOrder ? {
//       [sortBy] : sortOrder
//     } : {
//       createdAt : "asc"
//     }
//   });
//   return result;
// };

const getAllUserFromDB = async (filter: any, options: any) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper(options);
  const { searchTerm, ...filteringFields } = filter;

  const andConditions: Prisma.UserWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: userSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (Object.keys(filteringFields).length > 0) {
    andConditions.push({
      AND: Object.keys(filteringFields).map((key) => ({
        [key]: {
          equals: (filteringFields as any)[key],
        },
      })),
    });
  }

  const whereCondtions: Prisma.UserWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const result = await prisma.user.findMany({
    // pagination
    skip,
    take: limit,
    // searching and filtering
    where: whereCondtions,
    // sorting
    orderBy: {
      [sortBy]: sortOrder,
    },
  });

  const total = await prisma.user.count({
    where: whereCondtions,
  });
  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

export const UserServices = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllUserFromDB,
};
