export const capitalizeName = (name: string): string  => {
  if (!name) {
    return "";
  }

  const firstLetter = name.charAt(0).toUpperCase();
  const restOfName = name.slice(1);
  
  return firstLetter + restOfName;
};