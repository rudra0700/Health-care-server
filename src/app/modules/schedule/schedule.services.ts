import { addHours, addMinutes, format } from "date-fns";
import { prisma } from "../../../../lib/prisma";
import { IOptions, paginationHelper } from "../../helper/paginationHelper";
import { Prisma } from "../../../../generated/prisma/browser";
import { IJWTPayload } from "../../types/common";

const insertIntoDB = async (payload: any) => {
  const { startDate, endDate, startTime, endTime } = payload;
  const intervalTime = 30;
  let schedules = [];

  const currentDate = new Date(startDate); // it will give us date and as well as time format. console if necessary to understand
  const lastDate = new Date(endDate);

  while (currentDate <= lastDate) {
    // Here startDateTime means the begining time of particular currentDate like (10:00 - 12:00) for 2026-10-10
    const startDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(startTime.split(":")[0]), // 11:00
        ),
        Number(startTime.split(":")[1]), // 11:00
      ),
    );

    const endDateTime = new Date(
      addMinutes(
        addHours(
          `${format(currentDate, "yyyy-MM-dd")}`,
          Number(endTime.split(":")[0]), // 12:00
        ),
        Number(endTime.split(":")[1]), // 12:00
      ),
    );

    while (startDateTime < endDateTime) {
      const slotStartDateTime = startDateTime;
      const slotEndDateTime = addMinutes(startDateTime, intervalTime);

      const scheduleData = {
        startDateTime: slotStartDateTime,
        endDateTime: slotEndDateTime,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });

        schedules.push(result);
      }

      slotStartDateTime.setMinutes(
        slotStartDateTime.getMinutes() + intervalTime,
      );
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const schedulesForDoctor = async (
  user: IJWTPayload,
  filters: any,
  options: IOptions,
) => {
  const { page, limit, skip, sortBy, sortOrder } = paginationHelper(options);
  const {
    startDateTime: filteredStartDateTime,
    endDateTime: filteredEndDateTime,
  } = filters;

  const andConditions: Prisma.ScheduleWhereInput[] = [];

  if (filteredStartDateTime && filteredEndDateTime) {
    andConditions.push({
      AND: [
        {
          startDateTime: {
            gte: filteredStartDateTime,
          },
        },
        {
          endDateTime: {
            lte: filteredEndDateTime,
          },
        },
      ],
    });
  }

  const whereConditions: Prisma.ScheduleWhereInput =
    andConditions.length > 0
      ? {
          AND: andConditions,
        }
      : {};

  const doctorSchdules = await prisma.doctorSchedules.findMany({
    where: {
      doctor: {
        email: user.email,
      },
    },
    select: {
      scheduleId: true,
    },
  });

  const doctorSchduleIds = doctorSchdules.map(
    (schedules) => schedules.scheduleId,
  );

  const total = await prisma.schedule.count({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorSchduleIds,
      },
    },
  });

  const result = await prisma.schedule.findMany({
    where: {
      ...whereConditions,
      id: {
        notIn: doctorSchduleIds,
      },
    },
    skip,
    take: limit,
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

const deleteScheduleFromDB = async (id: string) => {
  await prisma.schedule.delete({
    where: {
      id: id,
    },
  });
};

export const ScheduleService = {
  insertIntoDB,
  schedulesForDoctor,
  deleteScheduleFromDB,
};
