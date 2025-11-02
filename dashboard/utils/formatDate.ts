export const formatDate = (date: string): string | null => {
  if (!date) return null;
  
  const newDate = new Date(date);
  
  if (isNaN(newDate.getTime())) {
    return null;
  }
  
  const year = newDate.getFullYear();
  const day = newDate.getDate();
  const month = newDate.getMonth();
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${day} ${months[month]}, ${year}`;
  
  return formattedDate;
};