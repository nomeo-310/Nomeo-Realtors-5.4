'use server'

import { IAddApartmentClient } from "@/components/pages/dashboard/add-apartment-client";
import { connectToMongoDB } from "@/lib/connectToMongoDB";
import { getCurrentUser } from "./user-actions";
import Attachment from "@/models/attachment";
import Apartment from "@/models/apartment";
import generatePropertyTag from "@/utils/generatePropertyTag";
import generatePropertyId from "@/utils/generatePropertyId";
import Agent from "@/models/agent";
import User from "@/models/user";
import { revalidatePath } from "next/cache";
import { propertyProps } from "@/lib/types";
import { deleteArrayOfImages } from "./delete-cloudinary-image";
import Inspection from "@/models/inspection";
import Notification from "@/models/notification";
import Rented from "@/models/rented";
import { ObjectId } from "mongodb";

type imageProps = {
  public_id: string;
  secure_url: string;
};

type singleAttachment = {
  _id: string;
  attachments: imageProps[];
};


export const createProperty = async ({values}:{values:IAddApartmentClient}) => {
  await connectToMongoDB();

  const {propertyTag, title, description, address, city, state, monthlyRent, propertyPrice, annualRent, bedrooms, bathrooms, toilets, squareFootage, uploadedImages, mainAmenities, optionalAmenities, mainFees, optionalFees, closestLandmarks} = values;
  
  
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return {success: false, message: "You are not logged in", status: 403};
  };
  
  if (currentUser.role !== "agent") {
    return {success: false, message: "You are not authorized to create a property", status: 403};
  };
  
  if (!values) {
    return {success: false, message: "No values provided", status: 400};
  };
  
  await connectToMongoDB();

  try {

    const attachmentData = {
      agent: currentUser.agentId,
      images: uploadedImages.map((image) => image.secure_url),
      attachments: uploadedImages,
    };
  
    const newAttachment = await Attachment.create(attachmentData);
    newAttachment.save();

    const propertyData = {
      propertyTag: propertyTag,
      propertyTypeTag: values.propertyTag === 'for-rent' ? generatePropertyTag().rentId : generatePropertyTag().saleId,
      propertyIdTag: generatePropertyId(),
      title: title,
      description: description,
      address: address,
      city: city,
      state: state,
      monthlyRent: monthlyRent,
      propertyPrice: propertyPrice,
      annualRent: annualRent,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      toilets: parseInt(toilets),
      squareFootage: parseInt(squareFootage),
      facilityStatus: values.facilityStatus === 'serviced' ? 'service' : 'non service',
      mainAmenities: mainAmenities,
      optionalAmenities: optionalAmenities,
      mainFees: mainFees,
      optionalFees: optionalFees,
      closestLandmarks: closestLandmarks,
      agent: currentUser.agentId,
      apartmentImages: JSON.parse(JSON.stringify(newAttachment._id)),
      propertyApproval: "pending",
      furnitureStatus: values.facilityStatus === 'serviced' ? 'furnished' : 'non furnished',
      availabilityStatus: "available",
    };
   
    const newProperty = await Apartment.create(propertyData);
    newProperty.save();

    await Agent.findByIdAndUpdate(currentUser.agentId, {$push: {apartments: newProperty._id}});
    await Attachment.findByIdAndUpdate(newAttachment._id, {property: newProperty._id})

    return {success: true, message: "Property created successfully", status: 200};
  } catch (error) {
    console.log(error);
    return {success: false, message: "Error creating property", status: 500};
  }
};

export const getSingleProperty = async (id:string) => {
  await connectToMongoDB();

  try {
    const property = await Apartment.findOne({propertyIdTag: id})
    .select('-propertyApproval')
    .populate({
      path: 'agent',
      model: Agent,
      select: ('agencyName inspectionFeePerHour userId officeAddress officeNumber _id'),
      populate: {
        path: 'userId',
        model: User,
        select: ('_id firstName lastName city state profilePicture')
      }
    })
    .populate({
      path: 'apartmentImages',
      model: Attachment,
      select: ('_id images')
    })
  
    const singleProperty = JSON.parse(JSON.stringify(property));
  
    return singleProperty as propertyProps
  } catch (error) {
    console.error(error)
    return;
  }

};

export const likeProperty = async (values:{path:string; propertyId: string;}) => {
  await connectToMongoDB();
  const { path, propertyId } = values;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return {success: false, message: 'You are not logged in. Log in to access features', status: 403}
  };

  const current_property = await Apartment.findOne({_id: propertyId});

  if (!current_property) {
    return {success: false, message: 'This apartment does not exist in database', status: 403}
  };

  const currentPropertyAgentId = current_property.agent;

  const currentPropertyAgent = await Agent.findOne({_id: currentPropertyAgentId});

  const likes = JSON.parse(JSON.stringify(current_property.likes)) as string[];
  const alreadyLiked = likes.includes(current_user._id);

  try {
    if (alreadyLiked) {
      await Apartment.findOneAndUpdate({_id: propertyId}, {$pull: {likes: current_user._id}});
      await User.findByIdAndUpdate({_id: current_user._id}, {$pull: {likedApartments: current_property._id}});

      revalidatePath(path);
      return {success: true, message: 'You no longer like this apartment', status: 200}
    } else {
      await Apartment.findOneAndUpdate({_id: propertyId}, {$push: {likes: current_user._id}});
      await User.findByIdAndUpdate({_id: current_user._id}, {$push: {likedApartments: current_property._id}});

      if (currentPropertyAgent) {
        if (currentPropertyAgent.getListings && !currentPropertyAgent.potentialClients.includes(new ObjectId(current_user._id))) {
          await Agent.findOneAndUpdate({_id: currentPropertyAgentId}, {potentialClients: {$push: current_user._id}})
        }
      };

      revalidatePath(path);
      return {success: true, message: 'You liked this apartment', status: 200}
    }
  } catch (error) {
    console.log(error);
    return {success: false, message: 'Internal server error', status: 500}
  }
};

export const bookmarkProperty = async (values:{path:string; propertyId: string;}) => {
  await connectToMongoDB();
  const { path, propertyId } = values;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return {success: false, message: 'You are not logged in. Log in to access features', status: 403}
  };

  const current_property = await Apartment.findOne({_id: propertyId});

  if (!current_property) {
    return {success: false, message: 'This apartment does not exist in database', status: 403}
  };

  const currentPropertyAgentId = current_property.agent;

  const currentPropertyAgent = await Agent.findOne({_id: currentPropertyAgentId});

  const bookmarks = JSON.parse(JSON.stringify(current_property.bookmarks)) as string[];
  const alreadyBookmarked = bookmarks.includes(current_user._id);

  try {
    if (alreadyBookmarked) {
      await Apartment.findOneAndUpdate({_id: propertyId}, {$pull: {bookmarks: current_user._id}});
      await User.findByIdAndUpdate({_id: current_user._id}, {$pull: {bookmarkedApartments: current_property._id}});

      revalidatePath(path);
      return {success: true, message: 'You no longer bookmark this apartment', status: 200}
    } else {
      await Apartment.findOneAndUpdate({_id: propertyId}, {$push: {bookmarks: current_user._id}});
      await User.findByIdAndUpdate({_id: current_user._id}, {$push: {bookmarkedApartments: current_property._id}});

      if (currentPropertyAgent) {
        if (currentPropertyAgent.getListings && !currentPropertyAgent.potentialClients.includes(new ObjectId(current_user._id))) {
          await Agent.findOneAndUpdate({_id: currentPropertyAgentId}, {potentialClients: {$push: current_user._id}})
        }
      };

      revalidatePath(path);
      return {success: true, message: 'You bookmarked this apartment', status: 200}
    }
  } catch (error) {
    console.log(error);
    return {success: false, message: 'Internal server error', status: 500}
  }
};

export const deleteAllApartments = async (values:{email:string; path:string}) => {
  await connectToMongoDB();

  const { email, path } = values;

  const current_user = await getCurrentUser();

  if (!current_user) {
    return {success: false, message: 'You are not logged in, login to access this feature', status: 403}
  };

  if (current_user.email !== email) {
    return {success: false, message: 'The email address does not match!', status: 404}
  };

  const userIsAnAgent = current_user.userIsAnAgent

  if (current_user && userIsAnAgent) {
    const agent = await Agent.findOne({_id: current_user.agentId});

    if (agent) {
      const agentProperties = await Apartment.find({agent: agent._id}).select('apartmentImages')
      const properties = JSON.parse(JSON.stringify(agentProperties)) as {_id: string, apartmentImages: string}[]

      if (agentProperties && properties.length > 0) {
        const propertyImages = properties.map((property) => property.apartmentImages);
        const images = await Attachment.find({_id: {$in: propertyImages}}).select('attachments');
        const allImages = JSON.parse(JSON.stringify(images)) as singleAttachment[];
        const allImagesData = allImages.map((item) => item.attachments);
        const imagesData = allImagesData.flatMap((arr: imageProps[]) => arr).map((property) => property.public_id);

        try {
          deleteArrayOfImages(imagesData);
          await Apartment.deleteMany({agent: current_user.agentId})
          await Agent.updateOne({_id: current_user.agentId}, {apartments: []})
          await Attachment.deleteMany({agent: current_user.agentId});
          await Rented.deleteMany({agent: current_user.agentId});

          revalidatePath(path);
          return {success: true, message: 'Properties successfully deleted', status: 200}
        } catch (error) {

          console.log(error);
          return {success: false, message: 'Internal server error', status: 500}
        }
      } else {
        return {success: false, message: 'You do not have any apartments to delete', status: 404}
      }
    }
  } else {
    return {success: false, message: 'You do not have access to this feature', status: 404}
  }
};

export const getDeletedProperty = async (id:string) => {
  await connectToMongoDB();

  const propertyData = await Apartment.findOne({_id: id})
  .select('-bookmarks -reviews -likes')
  .populate({
    path: 'apartmentImages',
    model: Attachment,
    select: 'images'
  })
  .populate({
    path: 'agent',
    model: 'Agent',
    select: 'licenseNumber coverPicture officeNumber officeAddress agencyName agentRatings agentVerified verificationStatus inspectionFeePerHour apartments clients createdAt userId',
    populate: {
      path: 'userId',
      model: User,
      select: 'username email firstName lastName profilePicture bio address city state phoneNumber additionalPhoneNumber role'
    }
  })

  const property = JSON.parse(JSON.stringify(propertyData))

  return property
};

export const deleteApartment = async (id:string) => {
  await connectToMongoDB();

  const current_user = await getCurrentUser();
  const propertyData = await Apartment.findOne({_id: id}).select('apartmentImages');
  const property = JSON.parse(JSON.stringify(propertyData)) as {_id: string; apartmentImages: string;}
  const images = await Attachment.findOne({_id: property.apartmentImages}).select('attachments')
  const imagesData  = JSON.parse(JSON.stringify(images)) as {_id:string; attachments: {public_id: string; secure_url: string;}[];}
  const imagesArray = imagesData.attachments.map((image) => image.public_id)

  if (!current_user) {
    return {success: false, message: 'User does not exist', status: 404}
  };

  if (current_user.role === 'user') {
    return {success: false, message: 'You do not have access to this feature', status: 404}
  };

  if (!propertyData) {
    return {success: false, message: 'Property does not exist', status: 404}
  };

  try {
   
    await deleteArrayOfImages(imagesArray);
    await Agent.findOneAndUpdate({_id: current_user.agentId}, {$pull: {apartments: propertyData._id}})
    await Inspection.deleteMany({apartment: propertyData._id})
    await Notification.deleteMany({propertyId: propertyData._id})
    await Attachment.deleteOne({property: propertyData._id})
    await Apartment.deleteOne({_id: property._id, agent: current_user.agentId});
    await Rented.deleteOne({apartment: propertyData.propertyIdTag})

    return {success: true, message: 'Property successfully deleted', status: 200}
  } catch (error) {
    console.error(error);
    
    return {success: false, message: 'Internal server error', status: 500}
  }
};

export const hideProperty = async (id:string) => {
  await connectToMongoDB();

   const current_user = await getCurrentUser();

  if (!current_user) {
    return {success: false, message: 'User does not exist', status: 404}
  };

  if (current_user.role === 'user') {
    return {success: false, message: 'You do not have access to this feature', status: 403}
  };

  const property = await Apartment.findOne({_id: id});
  const propertyData = JSON.parse(JSON.stringify(property)) as propertyProps

  if (!property) {
    return {success: false, message: 'Property does not exist', status: 404}
  };

  const alreadyHidden = propertyData.hideProperty;

    if (alreadyHidden) {
      try {
      const update = await Apartment.findOneAndUpdate({_id: id}, {hideProperty: false})

      const updatedProperty = JSON.parse(JSON.stringify(update))

      return updatedProperty
    } catch (error) {
      console.log(error);

      return {success: false, message: 'Internal server error', status: 200}
    }
  } else {
    try {
      const update = await Apartment.findOneAndUpdate({_id: id}, {hideProperty: true})

      const updatedProperty = JSON.parse(JSON.stringify(update))

      return updatedProperty
    } catch (error) {
      console.log(error);

      return {success: false, message: 'Internal server error', status: 200}
    }
  }
};