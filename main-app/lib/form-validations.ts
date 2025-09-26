import { z } from "zod";
import { validatePhoneNumber } from "./utils";

const required_string = z.string();
const password_string = z.string({required_error: 'Password is required'}).min(8, {message: 'Password must be atleast 8 characters!!'});

const auth = z.object({
  username: required_string.min(1, {message: 'Username is required!!'}),
  name: required_string.min(1,{message: 'Name is required!!'}),
  fullName: required_string.min(1, {message: 'Full name is required'}),
  email: required_string.min(1, {message: 'Email is required!!'}).email({message: 'Invalid email address!!'}),
  password: password_string,
  confirm_password: z.string({required_error: 'Confirm your password please!!'}),
  role: z.string().optional(),
  message: required_string.min(1, {message: 'Message is required!!'}),
  otp: z.string().min(1, {message: 'OTP is required!!'}),
  phoneNumber: z.string({required_error: 'Phone number is required'}).refine(validatePhoneNumber, {message: 'Phone number should be 11 digits and must be a valid one'}),
  amount: required_string.min(1, {message: 'Amount is required'}).regex(/^\d+$/, {message: "Must contain only numbers"}),
});


const profile = z.object({
  surName: required_string.min(1, {message: 'First name is required'}),
  lastName: required_string.min(1, {message: 'Last name is required'}),
  city: required_string.min(1, {message: 'City of residence is required'}),
  state: required_string.min(1, {message: 'State of residence is required'}),
  phoneNumber: required_string.refine(validatePhoneNumber, {message: 'Phone number should be 11 digits and must be a valid one'}),
  additionalPhoneNumber: z.string().refine(validatePhoneNumber, {message: 'Phone number should be 11 digits and must be a valid one'}).optional(),
  agentBio: required_string.min(1, {message: 'Your bio is required'}),
  address: required_string.min(1, {message: 'Your current residence address is required'}),
  userBio: z.string().optional(),
  agencyName: required_string.min(1, {message: 'Name of your agency is required'}),
  agencyAddress: required_string.min(1, {message: 'City of residence is required'}),
  inspectionFeePerHour: z.coerce.number({ invalid_type_error: 'Your inpection fee per hour must be a valid number' }),
  officeNumber: required_string.refine(validatePhoneNumber, {message: 'Phone number should be 11 digits and must be a valid one'}),
});

export const loginSchema = auth.pick({email: true, password: true, role: true});
export type loginValues = z.infer<typeof loginSchema>;

export const otpSchema = auth.pick({email: true});
export type otpValues = z.infer<typeof otpSchema>;

export const signupSchema = auth.pick({email: true, password: true, username: true, confirm_password: true, role: true})
.refine(data => data.password === data.confirm_password, {message: 'Password does not match', path: ['confirm_password']});
export type signupValues = z.infer<typeof signupSchema>;

export const restoreSchema = auth.pick({email: true, password: true, username: true});
export type restoreValues = z.infer<typeof restoreSchema>;

export const verifyEmailSchema = auth.pick({otp: true});
export type verifyEmailValues = z.infer<typeof verifyEmailSchema>;

export const sendOtpSchema = auth.pick({otp: true, password: true, confirm_password: true}).refine(data => data.password === data.confirm_password, {message: 'Password does not match', path: ['confirm_password']});
export type sendOtpValues = z.infer<typeof sendOtpSchema>;

export const resetPasswordSchema = auth.pick({email: true, password: true, confirm_password: true})
.refine(data => data.password === data.confirm_password, {message: 'Password does not match', path: ['confirm_password']});
export type resetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const faqMessageSchema = auth.pick({message: true, email: true, name: true})
export type faqMessageValues = z.infer<typeof faqMessageSchema>;

export const agentProfileSchema = profile.pick({surName: true, lastName:true, city: true, state: true, phoneNumber: true, additionalPhoneNumber: true, agentBio: true, inspectionFeePerHour: true, officeNumber: true,agencyAddress: true, agencyName: true}).refine(data => data.phoneNumber !== data.officeNumber, {message: 'Your office and personal number should not be the same', path: ['officeNumber']});
export type agentProfileValues = z.infer<typeof agentProfileSchema>; 

export const userProfileSchema = profile.pick({surName: true, lastName:true, city: true, state: true, phoneNumber: true, additionalPhoneNumber: true, userBio: true}).refine(data => data.phoneNumber !== data.additionalPhoneNumber, {message: 'Your office and personal number should not be the same', path: ['officeNumber']});
export type userProfileValues = z.infer<typeof userProfileSchema>; 

export const transactionSchema = auth.pick({email: true, phoneNumber: true, amount: true});
export type transactionValues = z.infer<typeof transactionSchema>;

export const contactSchema = auth.pick({fullName: true, phoneNumber: true, email: true, message: true});
export type contactValues = z.infer<typeof contactSchema>;

export const subscriptionSchema = auth.pick({email: true});
export type subscriptionValues = z.infer<typeof subscriptionSchema>;

export const addApartmentSchema = z.object({
  propertyTag: required_string.min(1, {message: 'Property tag is important!!'}),
  title: required_string.min(1, {message: 'Title is required!!'}),
  description: required_string.min(1, {message: 'Description is required!!'}),
  address: required_string.min(1, {message: 'Address is required!!'}),
  city: required_string.min(1, {message: 'City of location is required!!'}),
  state: required_string.min(1, {message: 'State of location is required!!'}),
  facilityStatus: required_string.min(1, {message: 'Facility status is required!!'}),
  monthlyRent: z.coerce.number({ invalid_type_error: 'Monthly rent must be a valid number' }).optional(),
  propertyPrice: z.coerce.number({ invalid_type_error: 'Property price must be a valid number' }).optional(),
  annualRent: z.coerce.number({ invalid_type_error: 'Annual rent must be a valid number' }).optional(),
  bedrooms: required_string.min(1, {message: 'Number of bedrooms is required'}).regex(/^\d+$/, {message: "Must contain only numbers"}),
  bathrooms: required_string.min(1, {message: 'Number of bathrooms is required'}).regex(/^\d+$/, {message: "Must contain only numbers"}),
  toilets: required_string.min(1, {message: 'Number of toilet is required'}).regex(/^\d+$/, { message: "Must contain only numbers"}),
  squareFootage: required_string.min(1, {message: 'The size of is required'}).regex(/^\d+$/, { message: "Must contain only numbers"}),
});
export type addApartmentValues = z.infer<typeof addApartmentSchema>;

export const scheduleInspectionSchema = z.object({
  date: z.date({required_error: 'Please select a schedule date!!', invalid_type_error: 'This is not a date!'}),
  time: required_string.min(1, {message: 'Inspection time is required!!'}),
  additionalPhoneNumber: z.string().optional(),
  agreement: z.boolean({required_error: 'To continue, agree to our terms of inspections'}).default(false)
});

export type scheduleInspectionValues = z.infer<typeof scheduleInspectionSchema>;

export const createBlogSchema = z.object({
  title: required_string.min(1, {message: 'Title is required!!'}),
  bannerImageUrl: required_string.min(1, {message: 'Banner image is required!!'}),
  bannerImagePublicId: z.string().optional(),
  description: required_string.min(1, {message: 'Description is required!!'}),
  content: required_string.min(1, {message: 'Content is required!!'}),
});

export type createBlogValues = z.infer<typeof createBlogSchema>;


