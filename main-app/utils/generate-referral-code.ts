const generatedCodes = new Set<string>();

export const generateReferralCode = () => {
  let code: string;

  do {
    const randomDigits = Math.floor(100000 + Math.random() * 900000).toString();
    code = `ref${randomDigits}`;
  } while (generatedCodes.has(code));

  generatedCodes.add(code);
  return code;
}