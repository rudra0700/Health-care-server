import { Request, Response } from "express";
import catchAsync from "../../shared/catchAsync";
import { UserServices } from "./user.services";
import sendResponse from "../../shared/sendResponse";
import { pick } from "../../helper/pick";

const createPatient = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createPatient(req);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Patient Created Successfully",
    data: result,
  });
});

const createAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createAdmin(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Admin Created successfuly!",
    data: result,
  });
});

const createDoctor = catchAsync(async (req: Request, res: Response) => {
  const result = await UserServices.createDoctor(req);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Doctor Created successfuly!",
    data: result,
  });
});


// Controller for normal searching, filtering, pagination and sorting
// const getAllUserFromDB = catchAsync(async (req: Request, res: Response) => {
//   const { page, limit, searchTerm, sortBy, sortOrder, role, status } =
//     req.query;
//   const result = await UserServices.getAllUserFromDB({
//     page: Number(page),
//     limit: Number(limit),
//     searchTerm,
//     sortBy,
//     sortOrder,
//   });

//   sendResponse(res, {
//     statusCode: 200,
//     success: true,
//     message: "All Users Retrieved successfully!",
//     data: result,
//   });
// });

// Controller using pick function
const getAllUserFromDB = catchAsync(async (req: Request, res: Response) => {
  // page, limit, sortBy, sortOrder --> pagination and sorting
  // fields, searchTerm --> filtering and searching
  const filter = pick(req.query, ["role", "status", "email", "searchTerm"]);
  const options = pick(req.query, ["page", "limit", "sortBy", "sortOrder"]);
  console.log("from controller", filter);

  const result = await UserServices.getAllUserFromDB(filter, options);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "All Users Retrieved successfuly!",
    meta: result.meta,
    data: result.data,
  });
});

export const UserController = {
  createPatient,
  createAdmin,
  createDoctor,
  getAllUserFromDB,
};
