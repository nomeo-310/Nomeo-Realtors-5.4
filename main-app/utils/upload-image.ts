export const uploadImage = async ({image, uploadPreset}:{image: File | null, uploadPreset:string}) => {
  if (!image) return;

  const formData = new FormData();
  formData.append('file', image as File);
  formData.append('upload_preset', `${uploadPreset}`);
  const data = await fetch('https://api.cloudinary.com/v1_1/dqj9nko02/image/upload', {
    method: 'POST',
    body: formData
  })
  .then((response) => response.json());

  return data;
};