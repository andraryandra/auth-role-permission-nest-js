const DEFAULT_PAGE = 1;

export class PaginationService {
  static getPagination(
    page = DEFAULT_PAGE,
    size = 3,
  ): { limit: number; offset: number } {
    const limit = size;
    const offset = (page - 1) * limit;

    return { limit, offset };
  }

  static getPaginationMetadata({
    totalData,
    page,
    limit,
  }: {
    totalData: number;
    page: number;
    limit: number;
  }) {
    const totalPages = Math.ceil(totalData / limit);
    const currentPage = page;

    return {
      currentPage,
      totalPages,
    };
  }

  static getPaginatedItems<T>(
    items: T[],
    pageNumber: number,
    itemsPerPage: number,
  ): T[] {
    const startIndex: number = (pageNumber - 1) * itemsPerPage;
    const result = items.slice(
      startIndex,
      Number(startIndex) + Number(itemsPerPage),
    );
    return result;
  }
}
