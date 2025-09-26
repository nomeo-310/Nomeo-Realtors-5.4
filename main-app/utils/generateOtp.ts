const generateOtp = () => {
  const randomValue = Math.floor(100000 + Math.random() * 900000);
  return randomValue.toString();
};

export default generateOtp;