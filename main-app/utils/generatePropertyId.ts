import crypto from 'crypto'

const generatePropertyId = () => {
  const random = crypto.randomBytes(3).toString('hex');
  const randomPart = random.substring(0, 7);
  const propertyId = `apartment-${randomPart}`

  return propertyId;
};

export default generatePropertyId;

