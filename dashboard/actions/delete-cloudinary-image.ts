'use server'

import cloudinary from "@/utils/cloudinary";


export const deleteCloudinaryImages = (publicId:string) => {
  cloudinary.uploader.destroy(publicId, function(error: any,result: any) {
  }).then((response: any) => {
    return {response}; 
  })
    .catch((_err: any) => console.log("Something went wrong, please try again later.")
  );
};

export const deleteArrayOfImages = async (images:string[]) => {
  try {
    const response = await cloudinary.api.delete_resources(images);
    console.log('Images deleted successfully:', response);
  } catch (error) {
    console.error('Error deleting images:', error);
  }
};