import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './model/user';
import Admin from './model/admin';
dotenv.config();

const mongoUrl = process.env.MONGODB_URL;
if (!mongoUrl) {
  throw new Error('MONGODB_URL is not defined in the environment variables');
};

mongoose.connect(mongoUrl)
.then(() => {
  console.log('MongoDB connection to database was successful');
  createOrUpdateSuperAdmin();
})
.catch((error) => {
  console.log('Error while trying to connect to database', error);
});

const createOrUpdateSuperAdmin = async () => {
  try {
    const envPassword = process.env.ADMIN_PASSWORD;
    const envEmail = process.env.ADMIN_EMAIL;
    const envSurname = process.env.ADMIN_SURNAME;
    const envLastname = process.env.ADMIN_LASTNAME;

    // Validate environment variables
    if (!envPassword || !envEmail || !envSurname || !envLastname) {
      throw new Error('Missing required environment variables for superadmin creation');
    }

    // Check if superadmin already exists in User collection
    const existingUser = await User.findOne({ role: 'superAdmin', email: envEmail });
    
    if (!existingUser) {
      // Step 1: Create the User record
      const newUser = new User({
        surName: envSurname,
        lastName: envLastname,
        email: envEmail,
        password: envPassword,
        role: 'superAdmin',
        userOnboarded: true,
        userVerified: true,
        profileCreated: true,
        blogCollaborator: true,
      });

      const savedUser = await newUser.save();
      console.log('SuperAdmin User created successfully.');

      // Step 2: Create the Admin record linked to the User
      const newAdmin = new Admin({
        userId: savedUser._id,
        role: 'superAdmin',
        adminAccess: 'full_access',
        isActivated: true,
        activatedAt: new Date(),
        activatedBy: savedUser._id, // Self-activated for first superadmin
        password: envPassword, // This will be hashed by the Admin schema pre-save hook
        passwordAdded: true,
        adminOnboarded: true,
        createdBy: savedUser._id, // Self-created for first superadmin
      });

      await newAdmin.save();
      console.log('SuperAdmin Admin record created successfully.');
      console.log('SuperAdmin setup completed!');

    } else {
      // Update existing superadmin if needed
      console.log('SuperAdmin user already exists.');
      
      // Check if Admin record exists for this user
      const existingAdmin = await Admin.findOne({ userId: existingUser._id });
      
      if (!existingAdmin) {
        // Create Admin record if it doesn't exist
        const newAdmin = new Admin({
          userId: existingUser._id,
          role: 'superAdmin',
          adminAccess: 'full_access',
          isActivated: true,
          activatedAt: new Date(),
          activatedBy: existingUser._id,
          password: envPassword,
          passwordAdded: true,
          adminOnboarded: true,
          createdBy: existingUser._id,
        });
        await newAdmin.save();
        console.log('Admin record created for existing SuperAdmin user.');
      }

      // Update user data if environment variables changed
      const passwordMatch = existingUser.password ? 
        await bcrypt.compare(envPassword, existingUser.password) : false;

      if (
          existingUser.email !== envEmail || 
          existingUser.surName !== envSurname ||
          existingUser.lastName !== envLastname ||
          !passwordMatch) {
        
        const updateData: any = {};
        if (existingUser.surName !== envSurname) updateData.surName = envSurname;
        if (existingUser.lastName !== envLastname) updateData.lastName = envLastname;
        if (existingUser.email !== envEmail) updateData.email = envEmail;
        if (!passwordMatch) updateData.password = envPassword;

        await User.findByIdAndUpdate(existingUser._id, updateData);
        console.log('SuperAdmin user updated.');
      } else {
        console.log('SuperAdmin user is up to date.');
      }
    }
  } catch (error) {
    console.error('Error creating/updating superadmin:', error);
  } finally {
    mongoose.disconnect();
  }
};