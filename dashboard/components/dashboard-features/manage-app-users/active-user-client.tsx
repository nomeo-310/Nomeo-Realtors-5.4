'use client'

import React from 'react'
import { Mail, Phone, MapPin, User, Bookmark, Heart, Stethoscope, FileText, Users, ThumbsUp, Clock, Building } from 'lucide-react'

// TypeScript Interface
interface ExtendedUserProps {
  _id: string
  username: string
  email: string
  role: string
  userOnboarded: boolean
  profileCreated: boolean
  userVerified: boolean
  blogCollaborator: boolean
  collaborations: any[]
  createdBlogs: any[]
  likedApartments: string[]
  bookmarkedApartments: string[]
  likedBlogs: any[]
  bookmarkedABlogs: any[]
  propertiesRented: any[]
  additionalPhoneNumber: string
  bio: string
  city: string
  lastName: string
  phoneNumber: string
  profilePicture: string
  state: string
  surName: string
}

interface ActiveUserClientProps {
  userDetails: ExtendedUserProps
}

const ActiveUserClient: React.FC<ActiveUserClientProps> = ({ userDetails }) => {

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

    // Try to extract structured data using multiple patterns (without 's' flag)
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

  const { mainBio, likes, dislikes, lifeMotto, hasBio } = parseBio(userDetails.bio)

  // Calculate total engagement - conditionally include blog engagement
  const totalEngagement = 
    userDetails.likedApartments.length + 
    userDetails.bookmarkedApartments.length + 
    (userDetails.blogCollaborator ? userDetails.likedBlogs.length : 0) + 
    (userDetails.blogCollaborator ? userDetails.bookmarkedABlogs.length : 0) +
    userDetails.propertiesRented.length

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Active User Details</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/80">
          <Clock className="w-4 h-4" />
          <span>User ID: {userDetails._id}</span>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#424242] dark:border-[#424242]/40 rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center text-center">
              <img
                src={userDetails.profilePicture}
                alt={`${userDetails.surName} ${userDetails.lastName}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 mb-4"
              />
              <h3 className="text-lg font-semibold font-quicksand">
                {userDetails.surName} {userDetails.lastName}
              </h3>
              <p className="text-gray-600 text-sm mb-2 dark:text-white">@{userDetails.username}</p>
              
              {/* Role Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 mb-4">
                <User className="w-3 h-3 mr-1" />
                {userDetails.role.charAt(0).toUpperCase() + userDetails.role.slice(1)}
              </div>

              {/* Contact Information */}
              <div className="space-y-3 w-full">
                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-white">
                  <Mail className="w-4 h-4 mr-2" />
                  <span className="truncate">{userDetails.email}</span>
                </div>
                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-white">
                  <Phone className="w-4 h-4 mr-2" />
                  {userDetails.phoneNumber}
                </div>
                {userDetails.additionalPhoneNumber && (
                  <div className="flex items-center justify-center text-sm text-gray-600 dark:text-white">
                    <Phone className="w-4 h-4 mr-2" />
                    {userDetails.additionalPhoneNumber}
                  </div>
                )}
                <div className="flex items-center justify-center text-sm text-gray-600 dark:text-white">
                  <MapPin className="w-4 h-4 mr-2" />
                  {userDetails.city}, {userDetails.state}
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 dark:bg-[#424242] dark:border-[#424242]/40 p-6">
            <h4 className="font-semibold font-quicksand mb-4">User Statistics</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Heart className="w-4 h-4 text-red-500 mr-1" />
                  <span className="text-lg font-semibold">{userDetails.likedApartments.length}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-white">Liked Properties</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Bookmark className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-lg font-semibold">{userDetails.bookmarkedApartments.length}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-white">Saved Properties</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Building className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-lg font-semibold">{userDetails.propertiesRented.length}</span>
                </div>
                <p className="text-xs text-gray-600 dark:text-white">Properties Rented</p>
              </div>
              
              {/* Blog-related stats - conditionally shown */}
              {userDetails.blogCollaborator && (
                <>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <FileText className="w-4 h-4 text-orange-500 mr-1" />
                      <span className="text-lg font-semibold">{userDetails.createdBlogs.length}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white">Blogs Created</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <ThumbsUp className="w-4 h-4 text-green-500 mr-1" />
                      <span className="text-lg font-semibold">{userDetails.likedBlogs.length}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white">Liked Blogs</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Bookmark className="w-4 h-4 text-indigo-500 mr-1" />
                      <span className="text-lg font-semibold">{userDetails.bookmarkedABlogs.length}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white">Saved Blogs</p>
                  </div>
                  <div className="text-center col-span-2">
                    <div className="flex items-center justify-center mb-1">
                      <Users className="w-4 h-4 text-cyan-500 mr-1" />
                      <span className="text-lg font-semibold">{userDetails.collaborations.length}</span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-white">Blog Collaborations</p>
                  </div>
                </>
              )}
            </div>
            
            {/* Total Engagement */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">Total Engagement</p>
                <p className="text-2xl font-bold text-blue-600">{totalEngagement}</p>
                <p className="text-xs text-gray-500 dark:text-white/80">All interactions combined</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Bio and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold font-quicksand">About</h4>
              <div className="flex items-center gap-2">
                {!hasBio && (
                  <span className="text-xs bg-gray-100 text-gray-600 dark:text-white px-2 py-1 rounded-full">
                    No Bio Provided
                  </span>
                )}
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                  {userDetails.bio.length} characters
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-white leading-relaxed mb-4 whitespace-pre-line text-sm lg:text-base">{mainBio}</p>
            
            {lifeMotto && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                <p className="text-sm italic text-yellow-800">"{lifeMotto}"</p>
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
                      <Stethoscope className="w-4 h-4 mr-1" />
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
              <div className="text-center py-4 text-gray-500 text-sm">
                This user hasn't added a bio yet.
              </div>
            )}
          </div>

          {/* Enhanced Account Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4">Account Status & Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-3 rounded-lg text-center ${userDetails.userVerified ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="text-sm font-medium">Verified</p>
                <p className="text-xs">{userDetails.userVerified ? 'Yes' : 'No'}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${userDetails.userOnboarded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="text-sm font-medium">Onboarded</p>
                <p className="text-xs">{userDetails.userOnboarded ? 'Yes' : 'No'}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${userDetails.profileCreated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="text-sm font-medium">Profile Created</p>
                <p className="text-xs">{userDetails.profileCreated ? 'Yes' : 'No'}</p>
              </div>
              <div className={`p-3 rounded-lg text-center ${userDetails.blogCollaborator ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <p className="text-sm font-medium">Blog Collaborator</p>
                <p className="text-xs">{userDetails.blogCollaborator ? 'Yes' : 'No'}</p>
              </div>
            </div>
            
            {/* Additional Status Info */}
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">User Role</p>
                <p className="text-sm text-gray-600 capitalize">{userDetails.role}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700">Username</p>
                <p className="text-sm text-gray-600">@{userDetails.username}</p>
              </div>
            </div>
          </div>

          {/* Enhanced Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4">Platform Activity</h4>
            <div className="space-y-3">
              {/* Blog-related activities - conditionally shown */}
              {userDetails.blogCollaborator && (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 dark:text-white flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-orange-500" />
                      Blogs Created
                    </span>
                    <span className="text-sm font-medium">{userDetails.createdBlogs.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 dark:text-white flex items-center">
                      <Users className="w-4 h-4 mr-2 text-green-500" />
                      Blog Collaborations
                    </span>
                    <span className="text-sm font-medium">{userDetails.collaborations.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 dark:text-white flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-2 text-green-500" />
                      Liked Blogs
                    </span>
                    <span className="text-sm font-medium">{userDetails.likedBlogs.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 dark:text-white flex items-center">
                      <Bookmark className="w-4 h-4 mr-2 text-indigo-500" />
                      Saved Blogs
                    </span>
                    <span className="text-sm font-medium">{userDetails.bookmarkedABlogs.length}</span>
                  </div>
                </>
              )}
              
              {/* Property-related activities - always shown */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 dark:text-white flex items-center">
                  <ThumbsUp className="w-4 h-4 mr-2 text-red-500" />
                  Liked Properties
                </span>
                <span className="text-sm font-medium">{userDetails.likedApartments.length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 dark:text-white flex items-center">
                  <Bookmark className="w-4 h-4 mr-2 text-blue-500" />
                  Bookmarked Properties
                </span>
                <span className="text-sm font-medium">{userDetails.bookmarkedApartments.length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 dark:text-white flex items-center">
                  <Building className="w-4 h-4 mr-2 text-purple-500" />
                  Properties Rented
                </span>
                <span className="text-sm font-medium">{userDetails.propertiesRented.length}</span>
              </div>
            </div>
            
            {/* Engagement Summary */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-white">Total Platform Engagement</span>
                <span className="text-lg font-bold text-blue-600">{totalEngagement}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActiveUserClient