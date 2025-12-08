import { connectToMongoDB } from "@/lib/connectToMongoDB"
import { getUserByEmail } from "./user-actions";
import Newsletter from "@/models/newsletter";
import { revalidatePath } from "next/cache";

type NewsletterInput = {
  email: string;
  path: string;
};

export const subscribeNewsletter = async ({ email, path }: NewsletterInput) => {
  await connectToMongoDB();

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const user = await getUserByEmail(normalizedEmail);

    await Newsletter.findOneAndUpdate(
      { email: normalizedEmail },
      { 
        $setOnInsert: { userId: user?._id } 
      },
      { upsert: true }
    );

    revalidatePath(path);
    return { success: true, message: "Subscribed successfully!", status: 200 };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: true, message: "Already subscribed!", status: 200 };
    }
    return { success: false, message: "Subscription failed", status: 500 };
  }
};