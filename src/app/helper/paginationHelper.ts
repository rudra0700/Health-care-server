type IOptions = {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: string;
};

type IOptionsResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

export const paginationHelper = (options: IOptions): IOptionsResult => {
  const page: number = Number(options.page) || 1;  // must use default value for page, otherwise wont find data or will face error
  const limit: number = Number(options.limit) || 10;  // must use default value for limit, otherwise wont find data or will face error
  const skip: number = Number(page - 1) * limit;
  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: string = options.sortOrder || "desc";

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};
