'use client'

import { agentProps, userProps } from '@/lib/types';
import Image from 'next/image';
import React from 'react'
import { Cropper, ReactCropperElement } from 'react-cropper'
import 'cropperjs/dist/cropper.css'
import { toast } from 'sonner';
import { uploadImage } from '@/utils/upload-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import { Mail01Icon, ImageAdd02Icon, MapsIcon, SquareLock02Icon, SecurityPasswordIcon, TelephoneIcon, Wallet01Icon,  } from '@hugeicons/core-free-icons';
import InputWithIcon from '@/components/ui/input-with-icon';
import { LoadingButton } from '@/components/ui/loading-button';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import SpecialInput from '@/components/ui/special-input';
import { useDeleteAccountModal, useDeletePropertiesModal, useTransferAccountModal } from '@/hooks/general-store';
import { changeAgencyAddress, changeEmail, changeEmailStart, changeInspectionFee, changeOfficeNumber, changePassword, changePhoneNumber, changeProfileImage, toggleBookmarkedApartments, toggleBookmarkedBlogs, toggleCollaborator, toggleLikedApartments, toggleLikedBlogs, toggleListings } from '@/actions/user-actions';
import { HugeiconsIcon } from '@hugeicons/react';


const SettingsClient = ({user, agent}:{user: userProps, agent?:agentProps}) => {

  const pathname = usePathname();

  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imageCropped, setImageCropped] = React.useState<File | null>(null);
  const [imageFile, setImageFile] = React.useState<File>();

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const cropperRef = React.useRef<ReactCropperElement>(null);

  const onImageSelection = (image: File | undefined) => {
    if (!image) {
      return;
    }

    setImageFile(image);
  };

  const onClose = () => {
    setImageFile(undefined);
    if (fileInputRef.current?.value) {
      fileInputRef.current.value = "";
    }
  };

  const crop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      return;
    }

    cropper.getCroppedCanvas().toBlob((blob) => {
      if (blob) {
        const reader = new FileReader();
        reader.onload = () => {
          const arrayBuffer = new Uint8Array(reader.result as ArrayBuffer);
          const file = new File([arrayBuffer], 'cropped_image.jpg', { type: 'image/jpeg' });
          setImageCropped(file);
        };
        reader.readAsArrayBuffer(blob);
      }
    },"image/jpeg");
    onClose();
  };

  const handleUploadImage = async () => {

    if (!imageCropped) {
      return;
    };
    
    const data = {image: imageCropped, uploadPreset: 'profileImages'}
    try {
      setUploadingImage(true);
      const imageData: { public_id: string; secure_url: string } = await uploadImage(data)
      const newImageUrls = { public_id: imageData?.public_id, secure_url: imageData?.secure_url };
      const value = {...newImageUrls, userId: user._id, isNewImage: true, path: pathname}
      await changeProfileImage(value).then((response) => {
        if (response && response.status === 200) {
          toast.success(response.message);
          setUploadingImage(false);
        }
      })
    } catch (error) {
      setUploadingImage(false);
      toast.error('Error while changing profile image, try again later.')
    }
  };

  React.useEffect(() => {
    if (imageCropped) {
      handleUploadImage();
    }
  },[imageCropped]);

  const [setPassword, settingPassword] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [showButton, setShowButton] = React.useState(false)

  React.useEffect(() => {
    if (newPassword.length < 6 || newPassword === "") {
      setShowButton(false);
    } else {
      setShowButton(true)
    }
  }, [newPassword]);

  const handlePasswordChange = async () => {
    const value = {oldPassword: oldPassword, newPassword: newPassword, path: pathname, userId: user._id}

    settingPassword(true);
    await changePassword(value).then((response) => {
      if (response) {
        if (response.success && response.status === 200) {
          toast.success(response.message);
          settingPassword(false);
          setNewPassword('');
          setOldPassword('');
        };

        if (!response.success && response.status !== 200) {
          toast.error(response.message);
          settingPassword(false);
        };
      } else {
        toast.error('Something went wrong!! Try again later')
      }
    }).catch((error) => {
      if (error) {

        toast.error('An error occurred while changing password')
      }
    }).finally(() => settingPassword(false))
  };

  const [newEmail, setNewEmail] = React.useState("");
  const [setEmail, settingNewEmail] = React.useState(false);
  const [displayButton, setDisplayButton] = React.useState(false);
  const [setVerification, settingVerification] = React.useState(false)
  const [otp, setOtp] = React.useState("");

  React.useEffect(() => {
    if (newEmail.length < 6 || newEmail === "") {
      setDisplayButton(false);
    } else {
      setDisplayButton(true)
    }
  }, [newEmail]);

  React.useEffect(() => {
    if (otp.length < 6 || otp === "") {
      setDisplayButton(false);
    } else {
      setDisplayButton(true)
    }
  }, [otp]);

  const handleEmailChange = async () => {
    const value = { newEmail: newEmail, path: pathname, userId: user._id}

    settingNewEmail(true);
    await changeEmailStart(value).then((response) => {
      if (response) {
        if (response.success && response.status === 200) {
          localStorage.setItem('emailChange', JSON.stringify({email: newEmail}))
          toast.success(response.message);
          settingNewEmail(false);
          setNewEmail('');
          settingVerification(true);
        };

        if (!response.success && response.status !== 200) {
          toast.error(response.message);
          settingNewEmail(false);
        };
      } else {
        toast.error('Something went wrong!! Try again later')
      }
    }).catch((error) => {
      if (error) {

        toast.error('An error occurred while changing email')
      }
    }).finally(() => settingNewEmail(false))
  };

  const handleSetNewEmail = async () => {
    const storedDetails = localStorage.getItem('emailChange');
    let email = "";

    if (storedDetails) {
      email = JSON.parse(storedDetails).email;
    };
    const value = {email: email, userId: user._id, otp: otp, path: pathname}
    settingNewEmail(true);
    await changeEmail(value).then((response) => {
      if (response.success && response.status === 200) {
        toast.success(response.message);
        localStorage.removeItem('emailChange');
        setOtp('');
        settingNewEmail(false);
        settingVerification(false)
      };

      if (!response.success && response.status !== 200) {
        toast.error(response.message);
        localStorage.removeItem('emailChange');
        setOtp('');
        settingNewEmail(false);
        settingVerification(false);
      }  else {
        toast.error('Something went wrong!! Try again later')
      }
    }).catch((error) => {
      if (error) {

        toast.error('An error occurred while verifying new email')
      }
    }).finally(() => {settingNewEmail(false); settingVerification(false);})
  }

  const [newPhoneNumber, setNewPhoneNumber] =  React.useState<string>(user.phoneNumber ?? "");
  const [newOfficeNumber, setNewOfficeNumber] =  React.useState<string>(agent?.officeNumber ?? "");
  const [newInspectionFee, setNewInspectionFee] = React.useState<string>(agent?.inspectionFeePerHour !== undefined ? String(agent.inspectionFeePerHour) : "");
  const [newAddress, setNewAddress] = React.useState<string>(agent?.officeAddress ?? "");

  const handlePhoneNumberChange = async () => {

    const values = {
      userId: user._id,
      newNumber: newPhoneNumber,
      path: pathname
    };

    if (!newPhoneNumber || newPhoneNumber === '' ) {
      toast.error('New phone number is required');
      return;
    }

    await changePhoneNumber(values).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success && response.status !== 200) {
        toast.error(response.message)
      }
    }).catch((error) => {

      toast.error('Something went wrong, try again later.')
    })
  };

  const handleOfficeAddressChange = async () => {

    if (!agent?._id) {
      toast.error('Agent ID is missing. Cannot update address.');
      return;
    };

    if (!newAddress || newAddress === '' ) {
      toast.error('New agency address is required');
      return;
    }

    if (!newAddress || newAddress === '' ) {
      toast.error('New iagency address is required');
      return;
    }

    const values = {
      agentId: agent._id,
      newAddress: newAddress,
      path: pathname
    };

    await changeAgencyAddress(values).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success && response.status !== 200) {
        toast.error(response.message)
      }
    }).catch((error) => {

      toast.error('Something went wrong, try again later.')
    })
  };

  const handleInspectionFeeChange = async () => {

    if (!newInspectionFee || newInspectionFee === '' ) {
      toast.error('New inspection fee is required');
      return;
    }

    if (!agent?._id) {
      toast.error('Agent ID is missing. Cannot update address.');
      return;
    };

    const values = {
      agentId: agent._id,
      newFee: Number(newInspectionFee), 
      path: pathname
    };

    await changeInspectionFee(values).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success && response.status !== 200) {
        toast.error(response.message)
      }
    }).catch((error) => {

      toast.error('Something went wrong, try again later.')
    })
  };

  const handleOfficeNumberChange = async () => {

    if (!newOfficeNumber || newOfficeNumber === '' ) {
      toast.error('New office number is required');
      return;
    }

    if (!agent?._id) {
      toast.error('Agent ID is missing. Cannot update address.');
      return;
    };

    const values = {
      agentId: agent._id,
      newNumber: newOfficeNumber, 
      path: pathname
    };

    await changeOfficeNumber(values).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success && response.status !== 200) {
        toast.error(response.message)
      }
    }).catch((error) => {

      toast.error('Something went wrong, try again later.')
    })
  };

  const [getListing, setGetListing] = React.useState(agent ? agent.getListings : false);
  const [collaborator, setCollaborator] = React.useState(user ? user.blogCollaborator : false);
  const [showLikedBlogs, setShowLikedBlogs] = React.useState(user ? user.showLikedBlogs : false);
  const [showBookmarkedBlogs, setShowBookmarkedBlogs] = React.useState(user ? user.showBookmarkedBlogs : false);
  const [showLikedApartment, setShowLikedApartment] = React.useState(user ? user.showLikedApartments : false);
  const [showBookmarkedApartment, setShowBookmarkedApartment] = React.useState(user ? user.showBookmarkedApartments : false);

  const handleCollab = async () => {

    if (!user) {
      return;
    };

    const values = {userId: user._id, path: pathname};

    setCollaborator((prev) => !prev);
    await toggleCollaborator(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success) {
        toast.error(response.message);
      }
    }).catch((error) => {

      toast.error('Something went wrong! Try again later')
    })
  };

  const handleGetListing = async () => {

    if (!agent) {
      return;
    };

    const values = {agentId: agent._id, path: pathname};

    setGetListing((prev) => !prev);
    await toggleListings(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success) {
        toast.error(response.message);
      }
    }).catch((error) => {

      toast.error('Something went wrong! Try again later')
    })
  };

  const handleShowLikedBlogs = async () => {

    if (!user) {
      return;
    };

    const values = {userId: user._id, path: pathname};

    setShowLikedBlogs((prev) => !prev);
    await toggleLikedBlogs(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success) {
        toast.error(response.message);
      }
    }).catch((error) => {

      toast.error('Something went wrong! Try again later')
    })
  };

  const handleShowBookmarkedBlogs = async () => {

    if (!user) {
      return;
    };

    const values = {userId: user._id, path: pathname};

    setShowBookmarkedBlogs((prev) => !prev);
    await toggleBookmarkedBlogs(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success) {
        toast.error(response.message);
      }
    }).catch((error) => {

      toast.error('Something went wrong! Try again later')
    })
  };

  const handleShowlLikedApartments = async () => {

    if (!user) {
      return;
    };

    const values = {userId: user._id, path: pathname};

    setShowLikedApartment((prev) => !prev);
    await toggleLikedApartments(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success) {
        toast.error(response.message);
      }
    }).catch((error) => {

      toast.error('Something went wrong! Try again later')
    })
  };

  const handleShowBookmarkedApartment = async () => {

    if (!user) {
      return;
    };

    const values = {userId: user._id, path: pathname};

    setShowBookmarkedApartment((prev) => !prev);
    await toggleBookmarkedApartments(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      };

      if (response && !response.success) {
        toast.error(response.message);
      }
    }).catch((error) => {

      toast.error('Something went wrong! Try again later')
    })
  };


  const useTransferAccount = useTransferAccountModal();
  const useDeleteProperty = useDeletePropertiesModal();
  const useDeleteAccount = useDeleteAccountModal();

  return (
    <div className='w-full lg:w-[80%] xl:w-[70%] md:w-[80%] h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Settings</h2>
      </div>
      
      <div className="flex flex-col md:gap-6 lg:gap-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className='lg:text-sm text-xs font-semibold tracking-wider'>EDIT PROFILE IMAGE</h2>
          <hr className='flex-1 dark:border-white/70'/>
        </div>
        <React.Fragment>
          { imageFile ?
            <div className=" xl:w-[400px] xl:h-[500px] lg:w-[350] lg:h-[450px] md:w-[400px] md:h-[500px] w-[310px] h-[410px] rounded overflow-hidden mx-auto my-auto">
              <Cropper 
                src={URL.createObjectURL(imageFile)} 
                aspectRatio={1} 
                guides={false} 
                zoomable={false} 
                ref={cropperRef}
                className='mx-auto xl:size-[400px] lg:size-[350px] md:size-[450px]  size-[350px]'
              />
              <div className="flex items-center justify-end gap-3 mt-4">
                <Button variant={'secondary'} onClick={onClose} className='rounded' type="button">Cancel</Button>
                <Button onClick={crop} className='rounded' type="button">Crop</Button>
              </div>
            </div> :
            <div className="cursor-pointer md:size-44 lg:size-48 xl:size-52 size-36 aspect-square bg-gray-200 flex items-center rounded-full relative group" onClick={() => fileInputRef.current?.click()}>
              <Input type="file" ref={fileInputRef} className="hidden sr-only" onChange={(e) => onImageSelection(e.target.files?.[0])}/>
              <Image src={ imageCropped ? URL.createObjectURL(imageCropped) : user.profilePicture ? user.profilePicture : '/images/default_user.png' } alt="avatar" fill priority className='rounded-full object-cover object-center' />
              <div className={cn("cursor-pointer p-3 text-center text-white text-sm absolute top-0 right-0 w-full h-full bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex justify-center items-center", uploadingImage && 'opacity-100')}>
                { imageCropped && uploadingImage ? 
                  <Loader2 className='animate-spin size-[50px] xl:size-[60px]'/> :
                  <HugeiconsIcon icon={ImageAdd02Icon} className='size-[50px] xl:size-[60px]'/>
                }
              </div>
            </div>
          }
        </React.Fragment>
        <div className='flex flex-col gap-2'>
          <div className="flex items-center gap-4">
            <h2 className='lg:text-sm text-xs font-semibold tracking-wider'>CHANGE PASSWORD</h2>
            <hr className='flex-1 dark:border-white/70'/>
          </div>
          <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Change your password. You can do this as many times as you like but it takes effect from the next login.</p>
          <div className="flex flex-col gap-3 mt-4">
            <InputWithIcon
              icon={SquareLock02Icon}
              type='password'
              className='bg-[#d4d4d4] rounded-lg dark:bg-[#424242]'
              placeholder='Enter your old password'
              inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
            <div className="flex gap-3">
              <InputWithIcon
                icon={SquareLock02Icon}
                type='password'
                className='bg-[#d4d4d4] rounded-lg dark:bg-[#424242]'
                placeholder='Enter your new password'
                inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {showButton &&
                <LoadingButton
                  label='Change password' 
                  loadingLabel='Processing ...'
                  isLoading={setPassword}
                  className='lg:h-12 h-10 lg:px-16 md:px-8 px-4 rounded-lg flex-none text-sm lg:text-base bg-black text-white'
                  onClick={() => handlePasswordChange()}
                />
              }
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h2 className='lg:text-sm text-xs font-semibold tracking-wider'>CHANGE EMAIL</h2>
            <hr className='flex-1 dark:border-white/70'/>
          </div>
          <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Change your email address. You can do this as many times as you like but it takes immediate effect as you will be logged out upon your submission.</p>
          <div className="flex flex-col gap-3 mt-4">
            <InputWithIcon
              icon={Mail01Icon}
              type='text'
              disabled
              className='bg-[#d4d4d4] rounded-lg dark:bg-[#424242]'
              placeholder='Enter your old password'
              inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
              value={user.email}
            />
            <div className="flex gap-3">
              <InputWithIcon
                icon={setVerification ? SecurityPasswordIcon : Mail01Icon}
                type={setVerification ? 'text' : 'email'}
                className='bg-[#d4d4d4] rounded-lg dark:bg-[#424242]'
                placeholder={setVerification ? 'Enter verification OTP' : 'Enter your new email'}
                inputClassName='rounded-lg dark:placeholder:text-white/70 placeholder:text-black/70'
                value={setVerification ? otp : newEmail}
                onChange={setVerification ? (e) => setOtp(e.target.value) : (e) => setNewEmail(e.target.value)}
              />
              { displayButton &&
                <LoadingButton
                  label={setVerification ? 'Change email': 'Procced'}
                  loadingLabel='Processing ...'
                  isLoading={setEmail}
                  className='lg:h-12 h-11 lg:px-16 md:px-8 px-4 rounded-lg flex-none text-sm lg:text-base bg-black text-white'
                  onClick={setVerification ? () => handleSetNewEmail() : () => handleEmailChange()}
                />
              }
            </div>
          </div>
        </div>
        { user.role === 'agent' &&
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-4">
              <h2 className='lg:text-sm text-xs font-semibold tracking-wider'>EDIT AGENT DETAILS</h2>
              <hr className='flex-1 dark:border-white/70'/>
            </div>
            <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Change details that pertains to your agency like inspection fee, office address, office number, mobile number and your bio. This will take immediate effect without logging you out.</p>
            <div className="flex flex-col gap-3 mt-4">
              <div className="flex gap-3 flex-col md:flex-row">
                <SpecialInput
                  icon={MapsIcon}
                  onClick={() => handleOfficeAddressChange()}
                  value={newAddress ?? ""}
                  setValue={setNewAddress}
                  placeholder='New address of your agency'
                  label='Agency Address'
                  type='text'
                />
                <SpecialInput
                  icon={Wallet01Icon}
                  onClick={() => handleInspectionFeeChange()}
                  value={newInspectionFee}
                  setValue={setNewInspectionFee}
                  placeholder='New inspection fee per hour'
                  label='Inspection fee (per hour)'
                  type='tel'
                />
              </div>
              <div className="flex gap-3 flex-col md:flex-row">
                <SpecialInput
                  icon={TelephoneIcon}
                  onClick={() => handlePhoneNumberChange()}
                  value={newPhoneNumber ?? ""}
                  setValue={setNewPhoneNumber}
                  placeholder='Enter new phone number'
                  label='Phone number'
                  type='tel'
                />
                <SpecialInput
                  icon={TelephoneIcon}
                  onClick={() => handleOfficeNumberChange()}
                  value={newOfficeNumber ?? ""}
                  setValue={setNewOfficeNumber}
                  placeholder='Enter new office number'
                  label='Office Number'
                  type='tel'
                />
              </div>
            </div>
          </div>
        }
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h2 className='lg:text-sm text-xs font-semibold tracking-wider'>BECOME A CREATIVE PARTNER</h2>
            <hr className='flex-1 dark:border-white/70'/>
          </div>
          <div className='flex flex-col gap-2'>
            <h2 className='lg:text-base text-sm font-medium'>Join Our Contributor Circle <span className='px-2 py-1 rounded-full text-xs bg-red-600 text-white'>New</span></h2>
            <div className="flex gap-3">
              <p className='lg:text-base text-sm text-black/50 dark:text-white/70' >This is your chance to go beyond your day-to-day work and help shape our brand&apos;s voice and vision. By contributing to our blog, sharing your ideas, and lending your expertise, you won&apos;t just be a part of our team—you&apos;ll be a key driver of our growth.</p>
              <Switch
                checked={collaborator}
                onCheckedChange={() => handleCollab()}
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h2 className='lg:text-sm text-xs font-semibold tracking-wider'>DISPLAY BOOKMARKS & LIKES</h2>
            <hr className='flex-1 dark:border-white/70'/>
          </div>
          { user.role === 'agent' &&
            <div className='flex flex-col gap-2'>
              <h2 className='lg:text-base text-sm font-medium'>List Potential Clients <span className='px-2 py-1 rounded-full text-xs bg-red-600 text-white'>New</span></h2>
              <div className="flex gap-3">
                <p className='lg:text-base text-sm text-black/50 dark:text-white/70' >Toggling this will make it possible to get a list of app users who bookmarked and liked any of the apartments you uploaded. This feature is meant to serve as a means to give them more information and make further advertisement to them.</p>
                <Switch
                  checked={getListing}
                  onCheckedChange={() => handleGetListing()}
                />
              </div>
            </div>
          }
          <div className='flex flex-col gap-2'>
            <h2 className='lg:text-base text-sm font-medium'>Show Liked Blogs</h2>
            <div className="flex gap-3">
              <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Toggling this will make it possible to view all the blogs you liked while going through the website&apos;s blogs. You can always switch it off if you do not want it see them any more.</p>
              <Switch
                checked={showLikedBlogs}
                onCheckedChange={() => handleShowLikedBlogs()}
              />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <h2 className='lg:text-base text-sm font-medium'>Show Bookmarked Blogs</h2>
            <div className="flex gap-3">
              <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Toggling this will make it possible to view all the blogs you bookmarked while going through the website blogs. You can always switch it off if you do not want it see them any more.</p>
              <Switch
                checked={showBookmarkedBlogs}
                onCheckedChange={() => handleShowBookmarkedBlogs()}   
              />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <h2 className='lg:text-base text-sm font-medium'>Show Liked Apartments</h2>
            <div className="flex gap-3">
              <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Toggling this will make it possible to view all the apartments you liked while going through the website&apos;s apartments either rentals or sale. You can always switch it off if you do not want it see them any more.</p>
              <Switch
                checked={showLikedApartment}
                onCheckedChange={() => handleShowlLikedApartments()}   
              />
            </div>
          </div>
          <div className='flex flex-col gap-2'>
            <h2 className='lg:text-base text-sm font-medium'>Show Bookmarked Apartments</h2>
            <div className="flex gap-3">
              <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Toggling this will make it possible to view all the apartments you bookmarked while going through the website apartments. For this one, the agent might contact you to give more information and tell you about possible deals.</p>
              <Switch
                checked={showBookmarkedApartment}
                onCheckedChange={() => handleShowBookmarkedApartment()}   
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-4">
            <h2 className='lg:text-sm text-xs font-semibold tracking-wider'>ACCOUNT AND OTHERS</h2>
            <hr className='flex-1 dark:border-white/70'/>
          </div>
          { user.role === 'agent' &&
          <div className='flex flex-col gap-2'>
            <h2 className='lg:text-base text-sm font-medium'>Delete Uploaded Apartments</h2>
            <div className="flex gap-3">
              <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Deleting all your uploaded apartments means clearing all your properties records. This process cannot be reversed.</p>
              <Switch
                checked={useDeleteProperty.isOpen}
                onCheckedChange={() => useDeleteProperty.onOpen()}
              />
            </div>
          </div>
          }
          <div className='flex flex-col gap-2'>
            <h2 className='lg:text-base text-sm font-medium'>Delete Account</h2>
            <div className="flex gap-3">
              <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Deleting your account means you will loose all your contacts and all form of details you have on this app. Be sure you want to make this decision before toggling the switch because it cannot be reversed.</p>
              <Switch
                checked={useDeleteAccount.isOpen}
                onCheckedChange={() =>useDeleteAccount.onOpen()}
              />
            </div>
          </div>
          { user.role === 'agent' &&
            <div className='flex flex-col gap-2'>
              <h2 className='lg:text-base text-sm font-medium'>Transfer Account <span className='px-2 py-1 rounded-full text-xs bg-red-600 text-white'>New</span></h2>
              <div className="flex gap-3">
                <p className='lg:text-base text-sm text-black/50 dark:text-white/70'>Transfering your account means you will loose all your contacts and all form of details you have on this app but will be passed to another agent of your choice. Be sure you want to make this decision before toggling the switch because it cannot be reversed.</p>
                <Switch
                  checked={useTransferAccount.isOpen}
                  onCheckedChange={() =>useTransferAccount.onOpen()}
                />
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default SettingsClient;