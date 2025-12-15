export type PaginatedResult<T> = {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
};

export function paginate_array<T>(array: T[],  itemsPerPage: number,  pageNumber: number): PaginatedResult<T> {
  if (!Array.isArray(array)) {
    return { 
      items: [] as T[], 
      currentPage: 0, 
      totalPages: 0, 
      totalItems: 0 
    };
  }

  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  let safePageNumber = pageNumber;
  if (safePageNumber < 1) {
    safePageNumber = 1;
  } else if (safePageNumber > totalPages) {
    safePageNumber = totalPages;
  }

  const startIndex = (safePageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = array.slice(startIndex, endIndex);

  return {
    items: pageItems,
    currentPage: safePageNumber,
    totalPages,
    totalItems,
  };
}