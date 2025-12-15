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
import { Loader2, User, Mail, Phone, MapPin, Lock, Building, Wallet, Bookmark, Heart, FileText, Users, ShieldAlert, Trash2, Eye, Edit, Save, X, Share, Send, Forward, Sparkles, AlertTriangle, CheckCircle } from 'lucide-react';
import { Mail01Icon, ImageAdd02Icon, MapsIcon, SquareLock02Icon, SecurityPasswordIcon, TelephoneIcon, Wallet01Icon } from '@hugeicons/core-free-icons';
import InputWithIcon from '@/components/ui/input-with-icon';
import { LoadingButton } from '@/components/ui/loading-button';
import { usePathname } from 'next/navigation';
import { cn, formatDate } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import SpecialInput from '@/components/ui/special-input';
import { useDeleteAccountModal, useDeletePropertiesModal, useTransferAccountModal } from '@/hooks/general-store';
import { changeAgencyAddress, changeBio, changeEmail, changeEmailStart, changeInspectionFee, changeOfficeNumber, changePassword, changePhoneNumber, changeProfileImage, toggleBookmarkedApartments, toggleBookmarkedBlogs, toggleCollaborator, toggleLikedApartments, toggleLikedBlogs, toggleListings } from '@/actions/user-actions';
import { HugeiconsIcon } from '@hugeicons/react';
import { Textarea } from '@/components/ui/textarea';

// Bio Analyzer Hook - MOVED OUTSIDE COMPONENT
const useBioAnalyzer = (config: { type: 'agent' | 'user'; minLength: number; targetLength: number }) => {
  const [analysis, setAnalysis] = React.useState<{
    score: number;
    suggestions: string[];
    strengths: string[];
    missingElements: string[];
    improvedBio: string;
  } | null>(null);

  const analyzeBio = React.useCallback((bio: string) => {
    if (!bio.trim()) {
      return {
        score: 0,
        suggestions: ['Please write a bio to get recommendations'],
        strengths: [],
        missingElements: ['Bio content'],
        improvedBio: ''
      };
    }

    const words = bio.toLowerCase().split(/\s+/);
    const sentences = bio.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Calculate basic metrics
    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgSentenceLength = wordCount / sentenceCount;
    
    // Keyword analysis
    const AGENT_KEYWORDS = [
      'experience', 'years', 'real estate', 'property', 'client', 'buy', 'sell',
      'rent', 'lease', 'investment', 'consultation', 'valuation', 'market',
      'professional', 'certified', 'licensed', 'agency', 'service', 'expertise'
    ];

    const USER_KEYWORDS = [
      'looking for', 'prefer', 'interested in', 'budget', 'location', 'family',
      'professional', 'student', 'quiet', 'modern', 'traditional', 'furnished',
      'pet-friendly', 'commute', 'amenities', 'lifestyle', 'needs'
    ];

    const keywords = config.type === 'agent' ? AGENT_KEYWORDS : USER_KEYWORDS;
    const foundKeywords = keywords.filter(keyword => 
      bio.toLowerCase().includes(keyword.toLowerCase())
    );
    
    // Structure analysis
    const hasExperience = config.type === 'agent' ? 
      /\d+\s*years?/.test(bio) || /experience/.test(bio) : false;
    const hasServices = config.type === 'agent' ?
      /(buy|sell|rent|lease|investment)/i.test(bio) : false;
    const hasPreferences = config.type === 'user' ?
      /(prefer|like|want|need|looking)/i.test(bio) : true;
    
    // Calculate score (0-100)
    let score = 0;
    
    // Length score (30%)
    if (wordCount >= config.targetLength) score += 30;
    else if (wordCount >= config.minLength) score += 20;
    else if (wordCount > 0) score += 10;
    
    // Keyword score (30%)
    const keywordScore = Math.min((foundKeywords.length / keywords.length) * 30, 30);
    score += keywordScore;
    
    // Structure score (20%)
    if (config.type === 'agent') {
      if (hasExperience) score += 10;
      if (hasServices) score += 10;
    } else {
      if (hasPreferences) score += 20;
    }
    
    // Readability score (20%)
    if (sentenceCount >= 2 && avgSentenceLength <= 25) score += 20;
    else if (sentenceCount >= 1) score += 10;
    
    score = Math.min(Math.round(score), 100);
    
    // Generate suggestions
    const suggestions: string[] = [];
    const strengths: string[] = [];
    const missingElements: string[] = [];
    
    // Length suggestions
    if (wordCount < config.minLength) {
      suggestions.push(`Try to write at least ${config.minLength} words for a comprehensive bio`);
      missingElements.push('Adequate length');
    } else if (wordCount < config.targetLength) {
      suggestions.push(`Consider expanding to ${config.targetLength} words for better impact`);
    } else {
      strengths.push('Good length');
    }
    
    // Keyword suggestions
    if (foundKeywords.length < 3) {
      const neededKeywords = keywords.slice(0, 5).join(', ');
      suggestions.push(`Include more relevant keywords like: ${neededKeywords}`);
      missingElements.push('Relevant keywords');
    } else {
      strengths.push('Good use of relevant terms');
    }
    
    // Structure suggestions
    if (config.type === 'agent') {
      if (!hasExperience) {
        suggestions.push('Mention your years of experience in real estate');
        missingElements.push('Experience mention');
      }
      if (!hasServices) {
        suggestions.push('Specify the services you offer (buying, selling, renting, etc.)');
        missingElements.push('Services offered');
      }
    } else {
      if (!hasPreferences) {
        suggestions.push('Describe what you\'re looking for in a property');
        missingElements.push('Property preferences');
      }
    }
    
    // Readability suggestions
    if (sentenceCount < 2) {
      suggestions.push('Break your bio into multiple sentences for better readability');
      missingElements.push('Multiple sentences');
    }
    if (avgSentenceLength > 25) {
      suggestions.push('Try using shorter sentences for better readability');
    } else {
      strengths.push('Good readability');
    }
    
    // Generate improved bio suggestion
    let improvedBio = '';
    if (config.type === 'agent') {
      improvedBio = `With ${hasExperience ? '' : 'X years of '}experience in real estate, I specialize in helping clients with ${hasServices ? '' : 'buying, selling, and renting'} properties. ${bio}`;
    } else {
      improvedBio = `I'm looking for ${hasPreferences ? '' : 'a comfortable property that meets my needs. '}${bio}`;
    }
    
    return {
      score,
      suggestions,
      strengths,
      missingElements,
      improvedBio: improvedBio.length > bio.length ? improvedBio : bio
    };
  }, [config]);

  const updateAnalysis = React.useCallback((bio: string) => {
    const newAnalysis = analyzeBio(bio);
    setAnalysis(newAnalysis);
    return newAnalysis;
  }, [analyzeBio]);

  return { analysis, updateAnalysis};
};

const SettingsClient = ({user, agent}:{user: userProps, agent?:agentProps}) => {

  const pathname = usePathname();

  console.log("User Data:", user);
  console.log("Agent Data:", agent);

  // Image Upload States
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [imageCropped, setImageCropped] = React.useState<File | null>(null);
  const [imageFile, setImageFile] = React.useState<File>();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cropperRef = React.useRef<ReactCropperElement>(null);

  // Password Change States
  const [setPassword, settingPassword] = React.useState(false);
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [showPasswordButton, setShowPasswordButton] = React.useState(false);

  // Email Change States
  const [newEmail, setNewEmail] = React.useState("");
  const [setEmail, settingNewEmail] = React.useState(false);
  const [displayEmailButton, setDisplayEmailButton] = React.useState(false);
  const [setVerification, settingVerification] = React.useState(false);
  const [otp, setOtp] = React.useState("");

  // Bio State
  const [newBio, setNewBio] = React.useState(user.bio || "");
  const [updatingBio, setUpdatingBio] = React.useState(false);
  const [isEditingBio, setIsEditingBio] = React.useState(false);
  const MAX_BIO_LENGTH = 1500;

  // Bio Analyzer - FIXED: Remove updateAnalysis from dependencies
  const { analysis, updateAnalysis } = useBioAnalyzer({
    type: user.role as 'agent' | 'user',
    minLength: user.role === 'agent' ? 25 : 20,
    targetLength: user.role === 'agent' ? 50 : 40
  });

  // Contact & Agent Details States
  const [newPhoneNumber, setNewPhoneNumber] = React.useState<string>(user.phoneNumber ?? "");
  const [newOfficeNumber, setNewOfficeNumber] = React.useState<string>(agent?.officeNumber ?? "");
  const [newInspectionFee, setNewInspectionFee] = React.useState<string>(agent?.inspectionFeePerHour !== undefined ? String(agent.inspectionFeePerHour) : "");
  const [newAddress, setNewAddress] = React.useState<string>(agent?.officeAddress ?? "");

  // Toggle States - Initialize with actual user data
  const [getListing, setGetListing] = React.useState(agent ? agent.getListings : false);
  const [collaborator, setCollaborator] = React.useState(user ? user.blogCollaborator : false);
  const [showLikedBlogs, setShowLikedBlogs] = React.useState(user ? user.showLikedBlogs : false);
  const [showBookmarkedBlogs, setShowBookmarkedBlogs] = React.useState(user ? user.showBookmarkedBlogs : false);
  const [showLikedApartment, setShowLikedApartment] = React.useState(user ? user.showLikedApartments : false);
  const [showBookmarkedApartment, setShowBookmarkedApartment] = React.useState(user ? user.showBookmarkedApartments : false);

  // Modal Hooks
  const useTransferAccount = useTransferAccountModal();
  const useDeleteProperty = useDeletePropertiesModal();
  const useDeleteAccount = useDeleteAccountModal();

  // Effect for password button visibility
  React.useEffect(() => {
    setShowPasswordButton(newPassword.length >= 6 && newPassword !== "" && oldPassword !== "");
  }, [newPassword, oldPassword]);

  // Effect for email button visibility
  React.useEffect(() => {
    if (setVerification) {
      setDisplayEmailButton(otp.length >= 6 && otp !== "");
    } else {
      setDisplayEmailButton(newEmail.length >= 6 && newEmail !== "");
    }
  }, [newEmail, otp, setVerification]);

  // FIXED: Bio analysis with debounce to prevent infinite loops
  React.useEffect(() => {
    if (isEditingBio && newBio.length > 10) {
      // Use setTimeout to debounce the analysis and prevent immediate re-renders
      const timeoutId = setTimeout(() => {
        updateAnalysis(newBio);
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId); // Cleanup on unmount or re-run
    }
  }, [newBio, isEditingBio, updateAnalysis]);

  // Enhanced bio parsing with fallbacks
  const parseBio = (bio: string) => {
    if (!bio || bio.trim() === '') {
      return {
        mainBio: 'No bio provided by the user.',
        likes: [],
        dislikes: [],
        lifeMotto: '',
        hasBio: false
      }
    }

    let mainBio = bio
    let likes: string[] = []
    let dislikes: string[] = []
    let lifeMotto = ''

    // Try to extract structured data using multiple patterns
    const likesPatterns = [
      /Likes:\s*(.+?)(?=Dislikes:|Life Motto:|$)/i,
      /Interests:\s*(.+?)(?=Dislikes:|$)/i,
      /Hobbies:\s*(.+?)(?=Dislikes:|$)/i
    ]

    const dislikesPatterns = [
      /Dislikes:\s*(.+?)(?=Likes:|Life Motto:|$)/i,
      /Don't Like:\s*(.+?)(?=Likes:|$)/i
    ]

    const mottoPatterns = [
      /Life Motto:\s*"(.+?)"/i,
      /Motto:\s*"(.+?)"/i,
      /Quote:\s*"(.+?)"/i,
      /Philosophy:\s*(.+?)(?=Likes:|Dislikes:|$)/i
    ]

    // Extract likes
    for (const pattern of likesPatterns) {
      const match = bio.match(pattern)
      if (match) {
        likes = match[1].split(',').map(item => item.trim()).filter(item => item)
        mainBio = mainBio.replace(match[0], '').trim()
        break
      }
    }

    // Extract dislikes
    for (const pattern of dislikesPatterns) {
      const match = bio.match(pattern)
      if (match) {
        dislikes = match[1].split(',').map(item => item.trim()).filter(item => item)
        mainBio = mainBio.replace(match[0], '').trim()
        break
      }
    }

    // Extract life motto
    for (const pattern of mottoPatterns) {
      const match = bio.match(pattern)
      if (match) {
        lifeMotto = match[1].trim()
        mainBio = mainBio.replace(match[0], '').trim()
        break
      }
    }

    // Clean up main bio - remove empty lines and excessive whitespace
    mainBio = mainBio.replace(/\n\s*\n/g, '\n').trim()

    // If main bio is empty after extraction, use a fallback
    if (!mainBio && (likes.length > 0 || dislikes.length > 0 || lifeMotto)) {
      mainBio = 'User prefers to express themselves through their interests and preferences.'
    }

    return {
      mainBio: mainBio || 'User has provided some preferences but no main bio.',
      likes,
      dislikes,
      lifeMotto,
      hasBio: true
    }
  }

  const { mainBio, likes, dislikes, lifeMotto, hasBio } = parseBio(user.bio || "");

  // Image Handling Functions
  const onImageSelection = (image: File | undefined) => {
    if (!image) return;
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
    if (!cropper) return;

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
    }, "image/jpeg");
    onClose();
  };


const handleUploadImage = React.useCallback(async () => {
  if (!imageCropped) return;
  
  const data = {image: imageCropped, uploadPreset: 'profileImages'};
  try {
    setUploadingImage(true);
    const imageData: { public_id: string; secure_url: string } = await uploadImage(data);
    const newImageUrls = { 
      public_id: imageData?.public_id, 
      secure_url: imageData?.secure_url 
    };
    const value = {
      ...newImageUrls, 
      userId: user._id, 
      isNewImage: true, 
      path: pathname
    };
    
    const response = await changeProfileImage(value);
    
    if (response && response.status === 200) {
      toast.success(response.message);
      setUploadingImage(false);
    }
  } catch (error) {
    setUploadingImage(false);
    toast.error('Error while changing profile image, try again later.');
  }
}, [
  imageCropped,                   
  user._id,              
  pathname,              
]);

  React.useEffect(() => {
    if (imageCropped) {
      handleUploadImage();
    }
  },[imageCropped, handleUploadImage]);

  // Password Change Handler
  const handlePasswordChange = async () => {
    const value = {oldPassword: oldPassword, newPassword: newPassword, path: pathname, userId: user._id}

    settingPassword(true);
    await changePassword(value).then((response) => {
      if (response) {
        if (response.success && response.status === 200) {
          toast.success(response.message);
          setNewPassword('');
          setOldPassword('');
        } else {
          toast.error(response.message);
        }
      } else {
        toast.error('Something went wrong!! Try again later')
      }
    }).catch(() => {
      toast.error('An error occurred while changing password')
    }).finally(() => settingPassword(false))
  };

  // Email Change Handlers
  const handleEmailChange = async () => {
    const value = { newEmail: newEmail, path: pathname, userId: user._id}

    settingNewEmail(true);
    await changeEmailStart(value).then((response) => {
      if (response) {
        if (response.success && response.status === 200) {
          localStorage.setItem('emailChange', JSON.stringify({email: newEmail}))
          toast.success(response.message);
          setNewEmail('');
          settingVerification(true);
        } else {
          toast.error(response.message);
        }
      } else {
        toast.error('Something went wrong!! Try again later')
      }
    }).catch(() => {
      toast.error('An error occurred while changing email')
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
        settingVerification(false)
      } else {
        toast.error(response.message);
        localStorage.removeItem('emailChange');
        setOtp('');
      }
    }).catch(() => {
      toast.error('An error occurred while verifying new email')
    }).finally(() => {settingNewEmail(false); settingVerification(false);})
  }

  // Bio Edit Handlers
  const handleEditBio = () => {
    setIsEditingBio(true);
    setNewBio(user.bio || "");
    // Trigger initial analysis only if there's existing bio content
    if (user.bio && user.bio.length > 10) {
      updateAnalysis(user.bio);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingBio(false);
    setNewBio(user.bio || "");
  };

  const handleSaveBio = async () => {
    if (!newBio.trim()) {
      toast.error('Bio cannot be empty');
      return;
    }

    setUpdatingBio(true);
    const value = { userId: user._id, newBio: newBio, path: pathname };
    
    await changeBio(value).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message);
        setIsEditingBio(false);
      } else {
        toast.error(response?.message || 'Failed to update bio');
      }
    }).catch(() => {
      toast.error('An error occurred while updating bio');
    }).finally(() => setUpdatingBio(false));
  };

  // Handle bio change with manual analysis trigger
  const handleBioChange = (value: string) => {
    setNewBio(value);
  };

  // Contact & Agent Detail Handlers
  const handlePhoneNumberChange = async () => {
    const values = { userId: user._id, newNumber: newPhoneNumber, path: pathname };
    if (!newPhoneNumber) {
      toast.error('New phone number is required');
      return;
    }
    await changePhoneNumber(values).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update phone number')
      }
    }).catch(() => {
      toast.error('Something went wrong, try again later.')
    })
  };

  const handleOfficeAddressChange = async () => {
    if (!agent?._id) {
      toast.error('Agent ID is missing. Cannot update address.');
      return;
    };
    if (!newAddress) {
      toast.error('New agency address is required');
      return;
    }
    const values = { agentId: agent._id, newAddress: newAddress, path: pathname };
    await changeAgencyAddress(values).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update address')
      }
    }).catch(() => {
      toast.error('Something went wrong, try again later.')
    })
  };

  const handleInspectionFeeChange = async () => {
    if (!newInspectionFee) {
      toast.error('New inspection fee is required');
      return;
    }
    if (!agent?._id) {
      toast.error('Agent ID is missing. Cannot update fee.');
      return;
    };
    const values = { agentId: agent._id, newFee: Number(newInspectionFee), path: pathname };
    await changeInspectionFee(values).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update inspection fee')
      }
    }).catch(() => {
      toast.error('Something went wrong, try again later.')
    })
  };

  const handleOfficeNumberChange = async () => {
    if (!newOfficeNumber) {
      toast.error('New office number is required');
      return;
    }
    if (!agent?._id) {
      toast.error('Agent ID is missing. Cannot update office number.');
      return;
    };
    const values = { agentId: agent._id, newNumber: newOfficeNumber, path: pathname };
    await changeOfficeNumber(values).then((response) => {
      if (response && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update office number')
      }
    }).catch(() => {
      toast.error('Something went wrong, try again later.')
    })
  };

  // ALL TOGGLE HANDLERS - COMPLETE SET
  const handleCollab = async () => {
    if (!user) return;
    const values = {userId: user._id, path: pathname};
    const newValue = !collaborator;
    setCollaborator(newValue);
    await toggleCollaborator(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update collaborator status');
        setCollaborator(!newValue);
      }
    }).catch(() => {
      toast.error('Something went wrong! Try again later');
      setCollaborator(!newValue);
    })
  };

  const handleGetListing = async () => {
    if (!agent) return;
    const values = {agentId: agent._id, path: pathname};
    const newValue = !getListing;
    setGetListing(newValue);
    await toggleListings(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update listings setting');
        setGetListing(!newValue);
      }
    }).catch(() => {
      toast.error('Something went wrong! Try again later');
      setGetListing(!newValue);
    })
  };

  const handleShowLikedBlogs = async () => {
    if (!user) return;
    const values = {userId: user._id, path: pathname};
    const newValue = !showLikedBlogs;
    setShowLikedBlogs(newValue);
    await toggleLikedBlogs(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update liked blogs visibility');
        setShowLikedBlogs(!newValue);
      }
    }).catch(() => {
      toast.error('Something went wrong! Try again later');
      setShowLikedBlogs(!newValue);
    })
  };

  const handleShowBookmarkedBlogs = async () => {
    if (!user) return;
    const values = {userId: user._id, path: pathname};
    const newValue = !showBookmarkedBlogs;
    setShowBookmarkedBlogs(newValue);
    await toggleBookmarkedBlogs(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update bookmarked blogs visibility');
        setShowBookmarkedBlogs(!newValue);
      }
    }).catch(() => {
      toast.error('Something went wrong! Try again later');
      setShowBookmarkedBlogs(!newValue);
    })
  };

  const handleShowLikedApartments = async () => {
    if (!user) return;
    const values = {userId: user._id, path: pathname};
    const newValue = !showLikedApartment;
    setShowLikedApartment(newValue);
    await toggleLikedApartments(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update liked apartments visibility');
        setShowLikedApartment(!newValue);
      }
    }).catch(() => {
      toast.error('Something went wrong! Try again later');
      setShowLikedApartment(!newValue);
    })
  };

  const handleShowBookmarkedApartments = async () => {
    if (!user) return;
    const values = {userId: user._id, path: pathname};
    const newValue = !showBookmarkedApartment;
    setShowBookmarkedApartment(newValue);
    await toggleBookmarkedApartments(values).then((response) => {
      if (response && response.success && response.status === 200) {
        toast.success(response.message)
      } else {
        toast.error(response?.message || 'Failed to update bookmarked apartments visibility');
        setShowBookmarkedApartment(!newValue);
      }
    }).catch(() => {
      toast.error('Something went wrong! Try again later');
      setShowBookmarkedApartment(!newValue);
    })
  };

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Settings</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/80">
          <User className="w-4 h-4" />
          <span className="capitalize">{user.role}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile & Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Image Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile Image
            </h4>
            
            <React.Fragment>
              {imageFile ? (
                <div className="xl:w-[400px] xl:h-[500px] lg:w-[350px] lg:h-[450px] md:w-[400px] md:h-[500px] w-[310px] h-[410px] rounded overflow-hidden mx-auto my-auto">
                  <Cropper 
                    src={URL.createObjectURL(imageFile)} 
                    aspectRatio={1} 
                    guides={false} 
                    zoomable={false} 
                    ref={cropperRef}
                    className='mx-auto xl:size-[400px] lg:size-[350px] md:size-[450px] size-[350px]'
                  />
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <Button variant={'secondary'} onClick={onClose} className='rounded' type="button">Cancel</Button>
                    <Button onClick={crop} className='rounded' type="button">Crop</Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div 
                    className="cursor-pointer md:size-44 lg:size-48 xl:size-52 size-36 aspect-square bg-gray-200 flex items-center rounded-full relative group" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Input type="file" ref={fileInputRef} className="hidden sr-only" onChange={(e) => onImageSelection(e.target.files?.[0])}/>
                    <Image 
                      src={imageCropped ? URL.createObjectURL(imageCropped) : user.profilePicture ? user.profilePicture : '/images/default_user.png'} 
                      alt="avatar" 
                      fill 
                      priority 
                      className='rounded-full object-cover object-center' 
                    />
                    <div className={cn(
                      "cursor-pointer p-3 text-center text-white text-sm absolute top-0 right-0 w-full h-full bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex justify-center items-center transition-opacity",
                      uploadingImage && 'opacity-100'
                    )}>
                      {imageCropped && uploadingImage ? (
                        <Loader2 className='animate-spin size-8'/>
                      ) : (
                        <HugeiconsIcon icon={ImageAdd02Icon} className='size-8'/>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 text-center dark:text-white">
                    Click on the image to upload a new profile picture
                  </p>
                </div>
              )}
            </React.Fragment>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4">Account Overview</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-white">Member Since</span>
                <span className="text-sm font-medium">{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-white">Email Verified</span>
                <span className={`text-sm font-medium ${user.userVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {user.userVerified ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-white">Profile Completed</span>
                <span className={`text-sm font-medium ${user.profileCreated ? 'text-green-600' : 'text-red-600'}`}>
                  {user.profileCreated ? 'Yes' : 'No'}
                </span>
              </div>
              {user.role === 'agent' && agent && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white">Agency</span>
                    <span className="text-sm font-medium">{agent.agencyName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white">Listings Active</span>
                    <span className="text-sm font-medium">{getListing ? 'Yes' : 'No'}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Settings Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold font-quicksand flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Personal Bio
              </h4>
              {!isEditingBio ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEditBio}
                  className="flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit Bio
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </Button>
                  <LoadingButton
                    label='Save'
                    loadingLabel='Saving...'
                    isLoading={updatingBio}
                    onClick={handleSaveBio}
                    className="flex items-center gap-2 text-sm border px-2 py-1 rounded-md"
                    disabled={!newBio.trim() || newBio === user.bio}
                  >
                    <Save className="w-4 h-4" />
                  </LoadingButton>
                </div>
              )}
            </div>

            {!isEditingBio ? (
              // Display Mode
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {!hasBio && (
                    <span className="text-xs bg-gray-100 text-gray-600 dark:text-white px-2 py-1 rounded-full">
                      No Bio Provided
                    </span>
                  )}
                  <span className="text-xs text-gray-500 dark:text-white/80">{user.bio?.length || 0}/{MAX_BIO_LENGTH} characters</span>
                </div>
                
                <p className="text-gray-700 dark:text-white leading-relaxed whitespace-pre-line text-sm lg:text-base">{mainBio}</p>
                
                {lifeMotto && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 lg:p-4 rounded-r-lg">
                    <p className="text-xs lg:text-sm italic text-yellow-800">&quot;{lifeMotto}&quot;</p>
                  </div>
                )}

                {(likes.length > 0 || dislikes.length > 0) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Likes */}
                    {likes.length > 0 && (
                      <div>
                        <h5 className="font-medium text-green-700 mb-2 flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          Likes & Interests
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {likes.map((like, index) => (
                            <span
                              key={index}
                              className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                            >
                              {like}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dislikes */}
                    {dislikes.length > 0 && (
                      <div>
                        <h5 className="font-medium text-red-700 mb-2 flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          Dislikes
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {dislikes.map((dislike, index) => (
                            <span
                              key={index}
                              className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full"
                            >
                              {dislike}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!hasBio && (
                  <div className="text-center py-4 text-gray-500 dark:text-white text-sm border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p>You haven&apos;t added a bio yet.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditBio}
                      className="mt-2"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Add Your Bio
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode with Bio Analysis
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-white">
                  {user.role === 'agent' 
                    ? "Tell clients about your experience and services. A good bio helps attract more business."
                    : "Share your preferences to help us find the perfect properties for you."}
                </p>
                
                <Textarea
                  value={newBio}
                  onChange={(e) => handleBioChange(e.target.value)}
                  placeholder={
                    user.role === 'agent'
                      ? "Example: With 5 years of experience in real estate, I specialize in helping clients buy and sell properties in Lagos. I offer professional consultation, property valuation, and investment advice. My goal is to make your real estate journey smooth and successful."
                      : "Example: I'm looking for a 2-bedroom apartment in a quiet neighborhood with good security. Prefer modern furnishings and proximity to schools. My budget is flexible for the right property that meets my family's needs."
                  }
                  className="min-h-[120px] resize-none text-sm p-3"
                  maxLength={MAX_BIO_LENGTH}
                />
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-white/80">
                    {newBio.length}/{MAX_BIO_LENGTH} characters
                  </span>
                  <span className="text-xs text-gray-500 dark:text-white/80">
                    {newBio.trim() === user.bio?.trim() ? 'No changes made' : 'Unsaved changes'}
                  </span>
                </div>

                {/* Bio Analysis Panel */}
                {analysis && newBio.length > 10 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-semibold text-blue-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Bio Analysis
                      </h5>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-blue-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${analysis.score}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-blue-900">
                          {analysis.score}/100
                        </span>
                      </div>
                    </div>

                    {analysis.score >= 70 ? (
                      <div className="flex items-center gap-2 text-green-600 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {user.role === 'agent' 
                            ? 'Great bio! This looks professional and will attract clients.'
                            : 'Perfect! This will help us find the right properties for you.'}
                        </span>
                      </div>
                    ) : analysis.score >= 40 ? (
                      <div className="flex items-center gap-2 text-yellow-600 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">Good start! Consider these improvements:</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {user.role === 'agent'
                            ? 'Your bio needs more detail to attract clients:'
                            : 'Your bio needs more detail to help us match you with properties:'}
                        </span>
                      </div>
                    )}

                    {analysis.strengths.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-green-700 mb-1">Strengths:</p>
                        <div className="flex flex-wrap gap-1">
                          {analysis.strengths.map((strength, index) => (
                            <span
                              key={index}
                              className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full"
                            >
                              {strength}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysis.suggestions.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-blue-700 mb-1">Suggestions:</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          {analysis.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-0.5">•</span>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysis.improvedBio && analysis.score < 70 && (
                      <div className="mt-3 p-3 bg-white rounded border border-blue-100">
                        <p className="text-xs font-medium text-blue-700 mb-1">Example improved bio:</p>
                        <p className="text-xs text-gray-600 italic">{analysis.improvedBio}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Security Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security & Login
            </h4>
            
            {/* Password Change */}
            <div className="mb-6">
              <h5 className="font-medium mb-3">Change Password</h5>
              <div className="space-y-3">
                <InputWithIcon
                  icon={SquareLock02Icon}
                  type='password'
                  className='bg-gray-50 rounded-lg dark:bg-neutral-600 flex-1'
                  placeholder='Current password'
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <div className="flex gap-3">
                  <InputWithIcon
                    icon={SquareLock02Icon}
                    type='password'
                    className='bg-gray-50 rounded-lg flex-1 dark:bg-neutral-600'
                    placeholder='New password'
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  {showPasswordButton && (
                    <LoadingButton
                      label='Update'
                      loadingLabel='Updating...'
                      isLoading={setPassword}
                      onClick={handlePasswordChange}
                      className="flex-none px-6"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Email Change */}
            <div>
              <h5 className="font-medium mb-3">Change Email</h5>
              <div className="space-y-3">
                <InputWithIcon
                  icon={Mail01Icon}
                  type='email'
                  disabled
                  className='bg-gray-50 rounded-lg dark:bg-neutral-600'
                  placeholder='Current email'
                  value={user.email}
                />
                <div className="flex gap-3">
                  <InputWithIcon
                    icon={setVerification ? SecurityPasswordIcon : Mail01Icon}
                    type={setVerification ? 'text' : 'email'}
                    className='bg-gray-50 rounded-lg flex-1 dark:bg-neutral-600'
                    placeholder={setVerification ? 'Enter verification code' : 'New email address'}
                    value={setVerification ? otp : newEmail}
                    onChange={setVerification ? (e) => setOtp(e.target.value) : (e) => setNewEmail(e.target.value)}
                  />
                  {displayEmailButton && (
                    <LoadingButton
                      label={setVerification ? 'Verify' : 'Send Code'}
                      loadingLabel='Processing...'
                      isLoading={setEmail}
                      onClick={setVerification ? handleSetNewEmail : handleEmailChange}
                      className="flex-none px-6"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Contact Information
            </h4>
            
            <div className={cn("grid gap-4", user.role === 'user' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2')}>
              <SpecialInput
                icon={TelephoneIcon}
                onClick={handlePhoneNumberChange}
                value={newPhoneNumber}
                setValue={setNewPhoneNumber}
                placeholder='Your phone number'
                label='Phone Number'
                type='tel'
              />
              
              {user.role === 'agent' && (
                <>
                  <SpecialInput
                    icon={TelephoneIcon}
                    onClick={handleOfficeNumberChange}
                    value={newOfficeNumber}
                    setValue={setNewOfficeNumber}
                    placeholder='Office phone number'
                    label='Office Number'
                    type='tel'
                  />
                  <SpecialInput
                    icon={MapsIcon}
                    onClick={handleOfficeAddressChange}
                    value={newAddress}
                    setValue={setNewAddress}
                    placeholder='Office address'
                    label='Office Address'
                    type='text'
                  />
                  <SpecialInput
                    icon={Wallet01Icon}
                    onClick={handleInspectionFeeChange}
                    value={newInspectionFee}
                    setValue={setNewInspectionFee}
                    placeholder='Inspection fee per hour'
                    label='Inspection Fee (₦/hr)'
                    type='number'
                  />
                </>
              )}
            </div>
          </div>

          {/* Privacy & Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Privacy & Preferences
            </h4>
            
            <div className="space-y-4">
              {/* Blog Collaborator */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-neutral-600">
                <div className="flex-1">
                  <h5 className="font-medium">Blog Contributor</h5>
                  <p className="text-sm text-gray-600 dark:text-white">Join our creative team and contribute to our blog</p>
                </div>
                <Switch 
                  checked={collaborator} 
                  onCheckedChange={handleCollab} 
                />
              </div>

              {/* Agent-specific Lead Generation */}
              {user.role === 'agent' && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex-1">
                    <h5 className="font-medium text-blue-800">Lead Generation</h5>
                    <p className="text-sm text-blue-600">Get lists of users who interacted with your properties</p>
                  </div>
                  <Switch 
                    checked={getListing} 
                    onCheckedChange={handleGetListing} 
                  />
                </div>
              )}

              {/* Blog Visibility Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-neutral-600">
                  <div className="flex-1">
                    <h5 className="font-medium">Show Liked Blogs</h5>
                    <p className="text-sm text-gray-600">Display blogs you&apos;ve liked in your profile</p>
                  </div>
                  <Switch 
                    checked={showLikedBlogs} 
                    onCheckedChange={handleShowLikedBlogs} 
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-neutral-600">
                  <div className="flex-1">
                    <h5 className="font-medium">Show Bookmarked Blogs</h5>
                    <p className="text-sm text-gray-600 dark:text-white">Display blogs you&apos;ve saved in your profile</p>
                  </div>
                  <Switch 
                    checked={showBookmarkedBlogs} 
                    onCheckedChange={handleShowBookmarkedBlogs} 
                  />
                </div>
              </div>

              {/* Property Visibility Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-neutral-600">
                  <div className="flex-1">
                    <h5 className="font-medium">Show Liked Apartments</h5>
                    <p className="text-sm text-gray-600">Display properties you&apos;ve liked in your profile</p>
                  </div>
                  <Switch 
                    checked={showLikedApartment} 
                    onCheckedChange={handleShowLikedApartments} 
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg dark:bg-neutral-600">
                  <div className="flex-1">
                    <h5 className="font-medium">Show Bookmarked Apartments</h5>
                    <p className="text-sm text-gray-600 dark:text-white">Display properties you&apos;ve saved in your profile</p>
                  </div>
                  <Switch 
                    checked={showBookmarkedApartment} 
                    onCheckedChange={handleShowBookmarkedApartments} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              Account Management
            </h4>
            
            <div className="space-y-4">
              {/* Delete Properties (Agent only) */}
              {user.role === 'agent' && (
                <div className="flex gap-1 sm:gap-0 sm:items-center justify-between p-3 flex-col sm:flex-row bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h5 className="font-medium text-red-800">Delete All Properties</h5>
                    <p className="text-sm text-red-600">Permanently remove all your uploaded properties</p>
                  </div>
                  <div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => useDeleteProperty.onOpen()}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              {/* Transfer Account (Agent only) */}
              {user.role === 'agent' && (
                <div className="flex gap-1 sm:gap-0 sm:items-center justify-between p-3 flex-col sm:flex-row bg-red-50 rounded-lg border border-red-200">
                  <div className="flex-1">
                    <h5 className="font-medium text-amber-800">Transfer Account</h5>
                    <p className="text-sm text-amber-600">Transfer your account to another agent</p>
                  </div>
                  <div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-secondary-blue text-white hover:bg-secondary-blue/90 bg-secondary-blue"
                      onClick={() => useTransferAccount.onOpen()}
                    >
                      <Forward className="w-5 h-5 mr-2"/>
                      Transfer
                    </Button>
                  </div>
                </div>
              )}

              {/* Delete Account */}
              <div className="flex gap-1 sm:gap-0 sm:items-center justify-between p-3 flex-col sm:flex-row bg-red-50 rounded-lg border border-red-200">
                <div className="flex-1">
                  <h5 className="font-medium text-red-800">Delete Account</h5>
                  <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                </div>
                <div>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => useDeleteAccount.onOpen()}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsClient;