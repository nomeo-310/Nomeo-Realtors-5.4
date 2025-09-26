import crypto from 'crypto'

const generatePropertyTag = () => {
  const random = crypto.randomBytes(3).toString('hex');
  const randomPart = random.substring(0, 7);
  const rentId = `rent-${randomPart}`;
  const saleId = `sale-${randomPart}`;

  return { rentId, saleId }
};

export default generatePropertyTag;