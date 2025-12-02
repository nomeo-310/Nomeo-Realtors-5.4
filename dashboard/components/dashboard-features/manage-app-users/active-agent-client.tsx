'use client'

import React from 'react'
import { Mail, Phone, MapPin, Calendar, User, Bookmark, Heart, FileText, Users, Building, Star, Home, BadgeCheck, Clock, Award, Shield } from 'lucide-react'

// TypeScript Interfaces based on actual data
interface AgentId {
  _id: string
  isACollaborator: boolean
  agentVerified: boolean
  verificationStatus: string
  inspectionFeePerHour: number
  inspections: any[]
  apartments: string[]
  clients: any[]
  potentialClients: any[]
  licenseNumber: string
  agencyName: string
  officeAddress: string
  officeNumber: string
}

interface UserDetails {
  _id: string
  username: string
  email: string
  role: string
  userOnboarded: boolean
  profileCreated: boolean
  userVerified: boolean
  blogCollaborator: boolean
  collaborations: string[]
  createdBlogs: string[]
  likedApartments: string[]
  bookmarkedApartments: string[]
  likedBlogs: any[]
  bookmarkedABlogs: any[]
  agentId: AgentId
  additionalPhoneNumber: string
  address: string
  bio: string
  city: string
  lastName: string
  phoneNumber: string
  profilePicture: string
  state: string
  surName: string
}

interface ActiveAgentClientProps {
  userDetails: UserDetails
}

const ActiveAgentClient: React.FC<ActiveAgentClientProps> = ({ userDetails }) => {

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount)
  }

  // Parse bio for specialties and experience
  const parseBio = (bio: string) => {
    if (!bio || bio.trim() === '') {
      return {
        mainBio: 'No bio provided by the agent.',
        specialties: [],
        experience: '',
        hasBio: false
      }
    }

    let mainBio = bio
    let specialties: string[] = []
    let experience = ''

    // Extract experience from bio
    const experiencePatterns = [
      /(\d+)\s*years?\s*of\s*experience/i,
      /(\d+)\s*years?\s*in\s*real\s*estate/i,
      /experience:\s*(\d+\s*years?)/i
    ]

    for (const pattern of experiencePatterns) {
      const match = bio.match(pattern)
      if (match) {
        experience = match[0]
        break
      }
    }

    // Extract potential specialties from bio
    const specialtyKeywords = ['Ikorodu', 'single', 'married', '5 star', 'apartments', 'recommendation']
    specialties = specialtyKeywords.filter(keyword => 
      bio.toLowerCase().includes(keyword.toLowerCase())
    )

    return {
      mainBio: mainBio,
      specialties,
      experience,
      hasBio: true
    }
  }

  const { mainBio, specialties, experience, hasBio } = parseBio(userDetails.bio || "")

  return (
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>Agent Details</h2>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/80">
          <BadgeCheck className="w-4 h-4 text-blue-500" />
          <span>Professional Agent</span>
        </div>
      </div>

      {/* Agent Profile Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
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
              
              {/* Agency Badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-2">
                <Building className="w-3 h-3 mr-1" />
                {userDetails.agentId.agencyName}
              </div>

              {/* Verification Status */}
              <div className="flex flex-wrap gap-1 mb-4 justify-center">
                {userDetails.agentId.agentVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Shield className="w-3 h-3 mr-1" />
                    Verified Agent
                  </span>
                )}
                {userDetails.userVerified && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <User className="w-3 h-3 mr-1" />
                    Verified User
                  </span>
                )}
                {userDetails.agentId.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Award className="w-3 h-3 mr-1" />
                    {userDetails.agentId.verificationStatus}
                  </span>
                )}
                {/* Blog Collaborator Badge */}
                {userDetails.blogCollaborator && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <FileText className="w-3 h-3 mr-1" />
                    Blog Contributor
                  </span>
                )}
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
                {userDetails.agentId.officeNumber && (
                  <div className="flex items-center justify-center text-sm text-gray-600 dark:text-white">
                    <Building className="w-4 h-4 mr-2" />
                    Office: {userDetails.agentId.officeNumber}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Agency Details Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <Building className="w-4 h-4" />
              Agency Information
            </h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-white/70">Agency Name</p>
                <p className="text-sm text-gray-900 dark:text-white">{userDetails.agentId.agencyName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-white/70">Office Address</p>
                <p className="text-sm text-gray-900 dark:text-white">{userDetails.agentId.officeAddress}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-white/70">Inspection Fee</p>
                <p className="text-sm text-gray-900 dark:text-white">{formatCurrency(userDetails.agentId.inspectionFeePerHour)}/hour</p>
              </div>
              {userDetails.agentId.licenseNumber && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white/70">License Number</p>
                  <p className="text-sm text-gray-900 font-mono dark:text-white">{userDetails.agentId.licenseNumber}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4">Account Statistics</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-white">Profile Status</span>
                <span className={`text-sm font-medium ${userDetails.profileCreated ? 'text-green-600' : 'text-red-600'}`}>
                  {userDetails.profileCreated ? 'Complete' : 'Incomplete'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-white">Onboarding</span>
                <span className={`text-sm font-medium ${userDetails.userOnboarded ? 'text-green-600' : 'text-red-600'}`}>
                  {userDetails.userOnboarded ? 'Completed' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-white">Blog Contributor</span>
                <span className={`text-sm font-medium ${userDetails.blogCollaborator ? 'text-green-600' : 'text-red-600'}`}>
                  {userDetails.blogCollaborator ? 'Active' : 'Not Active'}
                </span>
              </div>
              {userDetails.blogCollaborator && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white">Blogs Created</span>
                    <span className="text-sm font-medium">{userDetails.createdBlogs.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-white">Collaborations</span>
                    <span className="text-sm font-medium">{userDetails.collaborations.length}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Bio and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:p-6 p-4 dark:bg-[#424242] dark:border-[#424242]/40">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold font-quicksand flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Professional Bio
              </h4>
              {!hasBio && (
                <span className="text-xs bg-gray-100 text-gray-600 dark:text-white px-2 py-1 rounded-full">
                  No Bio Provided
                </span>
              )}
            </div>
            
            <p className="text-gray-700 dark:text-white/80 leading-relaxed mb-4 whitespace-pre-line text-sm lg:text-base">{mainBio}</p>

            {/* Experience */}
            {experience && (
              <div className="mb-4">
                <h5 className="font-medium text-purple-700 mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Professional Experience
                </h5>
                <p className="text-sm text-gray-700 bg-purple-50 px-3 py-2 rounded-lg">{experience}</p>
              </div>
            )}

            {/* Specialties */}
            {specialties.length > 0 && (
              <div className="mb-4">
                <h5 className="font-medium text-blue-700 mb-2 flex items-center">
                  <Star className="w-4 h-4 mr-1" />
                  Areas of Expertise
                </h5>
                <div className="flex flex-wrap gap-1">
                  {specialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full capitalize"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {!hasBio && (
              <div className="text-center py-4 text-gray-500 dark:text-white/80 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>This agent hasn't added a professional bio yet.</p>
              </div>
            )}
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:p-6 p-4 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Business Metrics
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Home className="w-4 h-4 text-blue-500 mr-1" />
                  <span className="text-lg font-semibold dark:text-black">{userDetails.agentId.apartments.length}</span>
                </div>
                <p className="text-xs text-gray-600">Properties Listed</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-lg font-semibold dark:text-black">{userDetails.agentId.clients.length}</span>
                </div>
                <p className="text-xs text-gray-600">Total Clients</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Users className="w-4 h-4 text-purple-500 mr-1" />
                  <span className="text-lg font-semibold dark:text-black">{userDetails.agentId.potentialClients.length}</span>
                </div>
                <p className="text-xs text-gray-600">Potential Clients</p>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-1">
                  <Calendar className="w-4 h-4 text-orange-500 mr-1" />
                  <span className="text-lg font-semibold dark:text-black">{userDetails.agentId.inspections.length}</span>
                </div>
                <p className="text-xs text-gray-600">Inspections</p>
              </div>
            </div>
          </div>

          {/* Activity & Engagement */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:p-6 p-4 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Platform Activity
            </h4>
            
            <div className="space-y-3">
              {/* Blog activities - ONLY show if user is a blog collaborator */}
              {userDetails.blogCollaborator ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 dark:text-white flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-green-500" />
                      Blogs Created
                    </span>
                    <span className="text-sm font-medium">{userDetails.createdBlogs.length}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600 dark:text-white flex items-center">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      Blog Collaborations
                    </span>
                    <span className="text-sm font-medium">{userDetails.collaborations.length}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600 dark:text-white flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    Blog Contributor Status
                  </span>
                  <span className="text-sm font-medium text-gray-500">Not Active</span>
                </div>
              )}
              
              {/* Property activities - always show */}
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600 dark:text-white flex items-center">
                  <Heart className="w-4 h-4 mr-2 text-red-500" />
                  Liked Properties
                </span>
                <span className="text-sm font-medium">{userDetails.likedApartments.length}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-600 dark:text-white flex items-center">
                  <Bookmark className="w-4 h-4 mr-2 text-blue-500" />
                  Bookmarked Properties
                </span>
                <span className="text-sm font-medium">{userDetails.bookmarkedApartments.length}</span>
              </div>
            </div>
          </div>

          {/* Blog Contributor Section - Only show if user is a collaborator */}
          {userDetails.blogCollaborator && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 lg:p-6 p-4 dark:bg-[#424242] dark:border-[#424242]/40">
              <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Blog Contributor Profile
              </h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white">Contributor Since</p>
                  <p className="text-sm text-gray-600 dark:text-white/80">Active Contributor</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white">Content Created</p>
                  <p className="text-sm text-gray-600 dark:text-white/80">{userDetails.createdBlogs.length} Blogs</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white">Collaborative Projects</p>
                  <p className="text-sm text-gray-600 dark:text-white/80">{userDetails.collaborations.length} Projects</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white">Contributor Level</p>
                  <p className="text-sm text-gray-600 dark:text-white/80">
                    {userDetails.createdBlogs.length >= 5 ? 'Advanced' : 
                     userDetails.createdBlogs.length >= 2 ? 'Intermediate' : 'Beginner'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* System Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 dark:bg-[#424242] dark:border-[#424242]/40">
            <h4 className="font-semibold font-quicksand mb-4 flex items-center gap-2">
              <BadgeCheck className="w-4 h-4" />
              System Information
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-white">User ID</p>
                <p className="text-sm text-gray-600 dark:text-white/80 font-mono truncate">{userDetails._id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-white">Agent ID</p>
                <p className="text-sm text-gray-600 dark:text-white/80 font-mono truncate">{userDetails.agentId._id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-white">User Role</p>
                <p className="text-sm text-gray-600 dark:text-white/80 capitalize">{userDetails.role}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-white">Blog Collaborator</p>
                <p className={`text-sm font-medium ${userDetails.blogCollaborator ? 'text-green-600' : 'text-gray-600'}`}>
                  {userDetails.blogCollaborator ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ActiveAgentClient