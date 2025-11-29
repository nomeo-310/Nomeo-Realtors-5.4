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
    const envUsername = process.env.ADMIN_USERNAME;

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
        username: envUsername,
        password: envPassword, // Will be hashed by User schema pre-save hook
        role: 'superAdmin',
        userOnboarded: true,
        userVerified: true,
        profileCreated: true,
        blogCollaborator: true,
      });

      const savedUser = await newUser.save();
      console.log('SuperAdmin User created successfully.');

      // Step 2: Create Admin record with proper history and tracking
      const newAdmin = new Admin({
        userId: savedUser._id,
        role: 'superAdmin',
        adminAccess: 'full_access',
        adminPermissions: [],
        isActivated: true,
        activatedAt: new Date(),
        activatedBy: savedUser._id,
        password: envPassword,
        passwordAdded: true,
        adminOnboarded: true,
        createdBy: savedUser._id,
        updatedAt: new Date(),
        updatedBy: savedUser._id,
        adminHistory: [{
          role: 'superAdmin',
          changedAt: new Date(),
          changedBy: savedUser._id,
          reason: 'Initial superAdmin creation via seeding script'
        }]
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
        // Create Admin record if it doesn't exist with proper history
        const newAdmin = new Admin({
          userId: existingUser._id,
          role: 'superAdmin',
          adminAccess: 'full_access',
          adminPermissions: [],
          isActivated: true,
          activatedAt: new Date(),
          activatedBy: existingUser._id,
          password: envPassword,
          passwordAdded: true,
          adminOnboarded: true,
          createdBy: existingUser._id,
          updatedAt: new Date(),
          updatedBy: existingUser._id,
          adminHistory: [{
            role: 'superAdmin',
            changedAt: new Date(),
            changedBy: existingUser._id,
            reason: 'Admin record created for existing superAdmin user via seeding script'
          }]
        });
        await newAdmin.save();
        console.log('Admin record created for existing SuperAdmin user.');
      } else {
        // Update existing admin record with proper tracking
        const updateData: any = {
          updatedAt: new Date(),
          updatedBy: existingUser._id
        };

        // Check if role needs update and add to history
        if (existingAdmin.role !== 'superAdmin') {
          const historyEntry = {
            role: existingAdmin.role,
            changedAt: new Date(),
            changedBy: existingUser._id,
            reason: 'Role updated to superAdmin via seeding script'
          };

          updateData.role = 'superAdmin';
          updateData.$push = { adminHistory: historyEntry };
        }

        // Update password if changed
        const passwordMatch = existingAdmin.password ? 
          await bcrypt.compare(envPassword, existingAdmin.password) : false;

        if (!passwordMatch) {
          updateData.password = envPassword; // Will be re-hashed by schema hook
          console.log('Admin password updated.');
        }

        if (Object.keys(updateData).length > 2) { // More than just updatedAt and updatedBy
          await Admin.findByIdAndUpdate(existingAdmin._id, updateData);
          console.log('SuperAdmin admin record updated.');
        }
      }

      // Update user data if environment variables changed
      const userUpdateData: any = {};
      let needsUserUpdate = false;

      if (existingUser.surName !== envSurname) {
        userUpdateData.surName = envSurname;
        needsUserUpdate = true;
      }
      if (existingUser.lastName !== envLastname) {
        userUpdateData.lastName = envLastname;
        needsUserUpdate = true;
      }
      if (existingUser.email !== envEmail) {
        userUpdateData.email = envEmail;
        needsUserUpdate = true;
      }

      // Check password without comparing hashes (let schema handle it)
      if (envPassword) {
        userUpdateData.password = envPassword;
        needsUserUpdate = true;
      }

      // Ensure user has superAdmin role
      if (existingUser.role !== 'superAdmin') {
        userUpdateData.role = 'superAdmin';
        userUpdateData.previousRole = existingUser.role;
        userUpdateData.roleChangedAt = new Date();
        userUpdateData.roleChangedBy = existingUser._id;
        needsUserUpdate = true;
      }

      if (needsUserUpdate) {
        await User.findByIdAndUpdate(existingUser._id, userUpdateData);
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