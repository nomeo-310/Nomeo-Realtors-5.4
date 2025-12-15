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
import { deleteArrayOfImages } from "./delete-cloudinary-image";
import Inspection from "@/models/inspection";
import Notification from "@/models/notification";
import Rented from "@/models/rentout";
import type { Document } from 'mongoose';

type imageProps = {
  public_id: string;
  secure_url: string;
};

type singleAttachment = {
  _id: string;
  attachments: imageProps[];
};

// Database connection optimization
let isConnected = false;

const ensureConnection = async () => {
  if (!isConnected) {
    await connectToMongoDB();
    isConnected = true;
  }
};

// Common validation functions
interface AuthValidationResult {
  success: boolean;
  message?: string;
  status?: number;
  currentUser?: any;
}

const validateUserAuth = async (): Promise<AuthValidationResult> => {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    return { success: false, message: "You are not logged in", status: 403 };
  }

  return { success: true, currentUser };
};

const validateAgentAccess = async (currentUser: any) => {
  if (currentUser.role !== "agent") {
    return { 
      success: false, 
      message: "You are not authorized to perform this action", 
      status: 403 
    };
  }
  return { success: true };
};

// Helper functions
const compareIds = (id1: any, id2: any): boolean => {
  return id1?.toString() === id2?.toString();
};

// Type-safe document ID extraction
const getDocumentId = (doc: Document<any> | null | undefined): string => {
  if (!doc || !doc._id) {
    throw new Error('Document or document ID is null/undefined');
  }
  return doc._id.toString();
};

// Property Actions
export const createProperty = async ({ values }: { values: IAddApartmentClient }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const agentAccessResult = await validateAgentAccess(authResult.currentUser!);
  if (!agentAccessResult.success) return agentAccessResult;

  if (!values) {
    return { success: false, message: "No values provided", status: 400 };
  }

  const {
    propertyTag, title, description, address, city, state, monthlyRent, 
    propertyPrice, annualRent, bedrooms, bathrooms, toilets, squareFootage, 
    uploadedImages, mainAmenities, optionalAmenities, mainFees, optionalFees, 
    closestLandmarks, facilityStatus
  } = values;

  try {
    // Create attachment and property in sequence (attachment is needed for property creation)
    const attachmentData = {
      agent: authResult.currentUser!.agentId,
      images: uploadedImages.map((image) => image.secure_url),
      attachments: uploadedImages,
    };

    const newAttachment = await Attachment.create(attachmentData);
    const attachmentId = getDocumentId(newAttachment);

    const propertyTagData = generatePropertyTag();
    const propertyData = {
      propertyTag: propertyTag,
      propertyTypeTag: propertyTag === 'for-rent' ? propertyTagData.rentId : propertyTagData.saleId,
      propertyIdTag: generatePropertyId(),
      title,
      description,
      address,
      city,
      state,
      monthlyRent,
      propertyPrice,
      annualRent,
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      toilets: parseInt(toilets),
      squareFootage: parseInt(squareFootage),
      facilityStatus: facilityStatus === 'serviced' ? 'service' : 'non service',
      mainAmenities,
      optionalAmenities,
      mainFees,
      optionalFees,
      closestLandmarks,
      agent: authResult.currentUser!.agentId,
      apartmentImages: attachmentId,
      propertyApproval: "pending",
      furnitureStatus: facilityStatus === 'serviced' ? 'furnished' : 'non furnished',
      availabilityStatus: "available",
    };

    const newProperty = await Apartment.create(propertyData);
    const propertyId = getDocumentId(newProperty);

    // Update agent and attachment in parallel
    await Promise.all([
      Agent.findByIdAndUpdate(authResult.currentUser!.agentId, {
        $push: { apartments: propertyId }
      }),
      Attachment.findByIdAndUpdate(attachmentId, {
        property: propertyId
      })
    ]);

    return { 
      success: true, 
      message: "Property created successfully", 
      status: 200 
    };
  } catch (error) {
    console.error('Create property error:', error);
    return { 
      success: false, 
      message: "Error creating property", 
      status: 500 
    };
  }
};

export const getSingleProperty = async (id: string) => {
  await ensureConnection();

  try {
    const property = await Apartment.findOne({ propertyIdTag: id })
      .select('-propertyApproval')
      .populate({
        path: 'agent',
        select: 'agencyName inspectionFeePerHour userId officeAddress officeNumber _id',
        populate: {
          path: 'userId',
          select: '_id surName lastName city state profilePicture'
        }
      })
      .populate({
        path: 'apartmentImages',
        select: '_id images'
      })
      .lean({ virtuals: true });

    if (!property) {
      return { success: false, message: 'Property not found', status: 404 };
    }


    return JSON.parse(JSON.stringify(property));
  } catch (error) {
    console.error('Get single property error:', error);
    return { success: false, message: 'Server error', status: 500 };
  }
};

const togglePropertyInteraction = async (
  values: { path: string; propertyId: string }, 
  interactionType: 'like' | 'bookmark'
) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const { path, propertyId } = values;

  try {
    const current_property = await Apartment.findById(propertyId)
    .select('likes bookmarks agent getListings')
    .lean({virtuals: true});

    if (!current_property) {
      return { 
        success: false, 
        message: 'This apartment does not exist in database', 
        status: 404 
      };
    }

    const field = interactionType === 'like' ? 'likes' : 'bookmarks';
    const userField = interactionType === 'like' ? 'likedApartments' : 'bookmarkedApartments';
    
    const interactions = JSON.parse(JSON.stringify(current_property[field])) as string[];
    const alreadyInteracted = interactions.includes(authResult.currentUser!._id);

    const propertyUpdate = alreadyInteracted ?
      { $pull: { [field]: authResult.currentUser!._id } } :
      { $push: { [field]: authResult.currentUser!._id } };

    const userUpdate = alreadyInteracted ?
      { $pull: { [userField]: current_property._id } } :
      { $push: { [userField]: current_property._id } };

    // Execute updates in parallel
    const updatePromises: Promise<any>[] = [
      Apartment.findByIdAndUpdate(propertyId, propertyUpdate).exec(),
      User.findByIdAndUpdate(authResult.currentUser!._id, userUpdate).exec()
    ];

    // Add potential client logic if it's a new interaction
    if (!alreadyInteracted) {
      const agent = await Agent.findById(current_property.agent);
      if (agent?.getListings && !agent.potentialClients.some((id: any) => 
        compareIds(id, authResult.currentUser!._id))) {
        updatePromises.push(
          Agent.findByIdAndUpdate(current_property.agent, {
            $push: { potentialClients: authResult.currentUser!._id }
          }).exec()
        );
      }
    }

    await Promise.all(updatePromises);

    revalidatePath(path);
    return {
      success: true,
      message: alreadyInteracted ? 
        `You no longer ${interactionType} this apartment` : 
        `You ${interactionType}d this apartment`,
      status: 200
    };
  } catch (error) {
    console.error(`Toggle ${interactionType} error:`, error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

export const likeProperty = async (values: { path: string; propertyId: string }) => {
  return togglePropertyInteraction(values, 'like');
};

export const bookmarkProperty = async (values: { path: string; propertyId: string }) => {
  return togglePropertyInteraction(values, 'bookmark');
};

export const deleteAllApartments = async (values: { email: string; path: string }) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const { email, path } = values;

  if (authResult.currentUser!.email !== email) {
    return { 
      success: false, 
      message: 'The email address does not match!', 
      status: 400 
    };
  }

  if (!authResult.currentUser!.userIsAnAgent) {
    return { 
      success: false, 
      message: 'You do not have access to this feature', 
      status: 403 
    };
  }

  try {
    const agent = await Agent.findById(authResult.currentUser!.agentId);
    if (!agent) {
      return { 
        success: false, 
        message: 'Agent profile not found', 
        status: 404 
      };
    }

    const [agentProperties, attachments] = await Promise.all([
      Apartment.find({ agent: agent._id }).select('apartmentImages'),
      Attachment.find({ agent: agent._id }).select('attachments')
    ]);

    if (agentProperties.length === 0) {
      return { 
        success: false, 
        message: 'You do not have any apartments to delete', 
        status: 404 
      };
    }

    // Extract all image public_ids for deletion
    const allImagesData = attachments.flatMap(attachment => 
      attachment.attachments.map(img => img.public_id)
    );

    // Delete images and all related data in parallel
    const deletionPromises: Promise<any>[] = [
      Apartment.deleteMany({ agent: authResult.currentUser!.agentId }),
      Agent.findByIdAndUpdate(authResult.currentUser!.agentId, { apartments: [] }).exec(),
      Attachment.deleteMany({ agent: authResult.currentUser!.agentId }),
      Rented.deleteMany({ agent: authResult.currentUser!.agentId }),
      Inspection.deleteMany({ agent: authResult.currentUser!.agentId }),
      Notification.deleteMany({ agentId: authResult.currentUser!.agentId })
    ];

    // Only add image deletion if there are images
    if (allImagesData.length > 0) {
      deletionPromises.unshift(deleteArrayOfImages(allImagesData));
    }

    await Promise.all(deletionPromises);

    revalidatePath(path);
    return { 
      success: true, 
      message: 'Properties successfully deleted', 
      status: 200 
    };
  } catch (error) {
    console.error('Delete all apartments error:', error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

export const getDeletedProperty = async (id: string) => {
  await ensureConnection();

  try {
    const propertyData = await Apartment.findOne({ _id: id })
      .select('-bookmarks -reviews -likes')
      .populate({
        path: 'apartmentImages',
        model: Attachment,
        select: 'images'
      })
      .populate({
        path: 'agent',
        model: Agent, // Changed from string to actual model
        select: 'licenseNumber coverPicture officeNumber officeAddress agencyName agentRatings agentVerified verificationStatus inspectionFeePerHour apartments clients createdAt userId',
        populate: {
          path: 'userId',
          model: User,
          select: 'username email firstName lastName profilePicture bio address city state phoneNumber additionalPhoneNumber role'
        }
      }).lean({virtuals: true});

    if (!propertyData) {
      return { 
        success: false, 
        message: 'Property not found', 
        status: 404 
      };
    }

    const property = JSON.parse(JSON.stringify(propertyData));
    return property;
  } catch (error) {
    console.error('Get deleted property error:', error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

export const deleteApartment = async (id: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const agentAccessResult = await validateAgentAccess(authResult.currentUser!);
  if (!agentAccessResult.success) return agentAccessResult;

  try {
    const [propertyData, attachment] = await Promise.all([
      Apartment.findOne({ _id: id, agent: authResult.currentUser!.agentId }),
      Attachment.findOne({ property: id }).select('attachments')
    ]);

    if (!propertyData) {
      return { 
        success: false, 
        message: 'Property not found or you are not authorized to delete it', 
        status: 404 
      };
    }

    const imagesArray = attachment?.attachments?.map((image: imageProps) => image.public_id) || [];

    // Execute all deletion operations in parallel
    const deletionPromises: Promise<any>[] = [
      Agent.findByIdAndUpdate(authResult.currentUser!.agentId, {
        $pull: { apartments: propertyData._id }
      }).exec(),
      Inspection.deleteMany({ apartment: propertyData._id }),
      Notification.deleteMany({ propertyId: propertyData.propertyIdTag }),
      Attachment.deleteOne({ property: propertyData._id }),
      Apartment.deleteOne({ _id: id, agent: authResult.currentUser!.agentId }),
      Rented.deleteOne({ apartment: propertyData.propertyIdTag })
    ];

    // Only add image deletion if there are images
    if (imagesArray.length > 0) {
      deletionPromises.unshift(deleteArrayOfImages(imagesArray));
    }

    await Promise.all(deletionPromises);

    return { 
      success: true, 
      message: 'Property successfully deleted', 
      status: 200 
    };
  } catch (error) {
    console.error('Delete apartment error:', error);
    return { 
      success: false, 
      message: 'Internal server error', 
      status: 500 
    };
  }
};

export const hideProperty = async (id: string) => {
  await ensureConnection();

  const authResult = await validateUserAuth();
  if (!authResult.success) return authResult;

  const agentAccessResult = await validateAgentAccess(authResult.currentUser!);
  if (!agentAccessResult.success) return agentAccessResult;

  try {
    const property = await Apartment.findOneAndUpdate(
      { _id: id, agent: authResult.currentUser!.agentId },
      [{ $set: { hideProperty: { $not: '$hideProperty' } } }], // Toggle in one query
      { new: true }
    ).lean({ virtuals: true });

    if (!property) {
      return { success: false, message: 'Not found or unauthorized', status: 404 };
    }

    return JSON.parse(JSON.stringify(property));
  } catch (error) {
    console.error(error);
    return { success: false, message: 'Server error', status: 500 };
  }
};