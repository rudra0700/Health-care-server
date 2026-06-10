import { Doctor, Prisma } from "../../../../generated/prisma/client";
import { prisma } from "../../../../lib/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { doctorSearchableFields } from "./doctors.constant";
import { IDoctorUpdateInput } from "./doctors.interface";

const getAllFromDB = async (filters: any, options: IOptions) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper(options);
  const { searchTerm, specialties, ...filterData } = filters;

  const andConditions: Prisma.DoctorWhereInput[] = [];

  if (searchTerm) {
    andConditions.push({
      OR: doctorSearchableFields.map((field) => ({
        [field]: {
          contains: searchTerm,
          mode: "insensitive",
        },
      })),
    });
  }

  if (specialties && specialties.length > 0) {
    andConditions.push({
      doctorSpecialties: {
        some: {
          specialities: {
            title: {
              contains: specialties,
              mode: "insensitive",
            },
          },
        },
      },
    });
  }

  if (Object.keys(filterData).length > 0) {
    const filterConditions = Object.keys(filterData).map((key) => ({
      [key]: {
        equals: (filterData as any)[key],
      },
    }));

    andConditions.push(...filterConditions);
  }

  const whereConditions: Prisma.DoctorWhereInput =
    andConditions.length > 0 ? { AND: andConditions } : {};

  const result = await prisma.doctor.findMany({
    where: whereConditions,
    skip,
    take: limit,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      doctorSpecialties: {
        include: {
          specialities: true,
        },
      },
    },
  });

  const total = await prisma.doctor.count({
    where: whereConditions,
  });

  return {
    meta: {
      total,
      page,
      limit,
    },
    data: result,
  };
};

const updateIntoDB = async (
  id: string,
  payload: Partial<IDoctorUpdateInput>,
) => {
  const doctorInfo = await prisma.doctor.findUniqueOrThrow({
    where: {
      id,
    },
  });

  const { specialities, ...doctorData } = payload;

  return await prisma.$transaction(async (tnx) => {
    if (specialities && specialities.length > 0) {
      const deletedSpecialityIds = specialities.filter(
        (speciality) => speciality.isDeleted,
      );

      for (const speciality of deletedSpecialityIds) {
        await tnx.doctorSpecialties.deleteMany({
          where: {
            doctorId: id,
            specialitiesId: speciality.specialityIds,
          },
        });
      }

      const createSpecialityIds = specialities.filter(
        (speciality) => !speciality.isDeleted,
      );

      for (const speciality of createSpecialityIds) {
        await tnx.doctorSpecialties.create({
          data: {
            doctorId: id,
            specialitiesId: speciality.specialityIds,
          },
        });
      }
    }

    const updateData = await tnx.doctor.update({
      where: {
        id: doctorInfo.id,
      },
      data: doctorData,
      include: {
        doctorSpecialties: {
          include: {
            specialities: true,
          },
        },
      },
    });

    return updateData;
  });
};

export const DoctorService = {
  getAllFromDB,
  updateIntoDB,
};
