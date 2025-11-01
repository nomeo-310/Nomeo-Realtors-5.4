const generateAdminId = (): string => {
  const prefix = 'ADMIN';
  const numbers = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let randomNumbers = '';
  for (let i = 0; i < 6; i++) {
    randomNumbers += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  let randomLetters = '';
  for (let i = 0; i < 2; i++) {
    randomLetters += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  return `${prefix}_${randomNumbers}${randomLetters}`;
};

export default generateAdminId;