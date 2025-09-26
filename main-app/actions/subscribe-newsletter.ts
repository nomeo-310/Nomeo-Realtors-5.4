import { connectToMongoDB } from "@/lib/connectToMongoDB"
import { getUserByEmail } from "./user-actions";
import Newsletter from "@/models/newsletter";
import { revalidatePath } from "next/cache";

type newsletter = {
  email: string;
  path: string;
}

export const subscribeNewsletter = async ({email, path}:newsletter) => {
  await connectToMongoDB();

  if (!email) {
    return { success: false, message: 'Email is required!!', status: 400 }
  };

  const alreadySubscribed = await Newsletter.find({email:email});

  if (alreadySubscribed) {
    return { success: false, message: 'You have already subscribed to our newsletter!!', status: 400 }
  }

  const user = await getUserByEmail(email);

  if (user) {
    const newSubscriber = await Newsletter.create({email: email, userId: user._id});
    newSubscriber.save();

    revalidatePath(path);
    return { success: 'Subscription was successful!!' }
  } else {
    const newSubscriber = await Newsletter.create({ email: email });
    newSubscriber.save();

    revalidatePath(path);
    return { success: true, message: 'Subscription was successful!!', status: 200 }
  }

}