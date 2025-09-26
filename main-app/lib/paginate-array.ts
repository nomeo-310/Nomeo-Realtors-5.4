
type props = {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export function paginate_array<T>(array: T[], itemsPerPage: number, pageNumber: number):props {
  if (!Array.isArray(array)) {
    return { items: [], currentPage: 0, totalPages: 0, totalItems: 0 };
  }

  const totalItems = array.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (pageNumber < 1) {
    pageNumber = 1;
  } else if (pageNumber > totalPages) {
    pageNumber = totalPages;
  }

  const startIndex = (pageNumber - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const pageItems = array.slice(startIndex, endIndex);

  return {
    items: pageItems,
    currentPage: pageNumber,
    totalPages: totalPages,
    totalItems: totalItems,
  };
}