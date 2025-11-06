export const formatMoney = (amount?:number) => {
  if (amount) {
    const stringAmount = String(amount);

    if (stringAmount.length > 9) {
      const value = (amount / 1000000000);
      return value + 'B'
    };

    if (stringAmount.length > 6) {
      const value = (amount / 1000000);
      return value + 'M'
    };

    if (stringAmount.length > 4) {
      const value = (amount / 1000);
      return value + 'K'
    };
  }

  return;
};