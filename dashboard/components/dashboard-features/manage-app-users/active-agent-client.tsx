'use client'

import React from 'react'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  User, 
  Bookmark, 
  Heart, 
  FileText, 
  Users, 
  Building, 
  Star, 
  Home, 
  BadgeCheck, 
  Clock, 
  Award, 
  Shield,
  Briefcase,
  BookOpen,
  TrendingUp,
  Target,
  DollarSign,
  ShieldCheck
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
  const [imageError, setImageError] = React.useState(false)

  // Get profile image URL from userDetails
  const getProfileImageUrl = () => {
    if (userDetails.profilePicture && 
        userDetails.profilePicture !== '' && 
        userDetails.profilePicture !== 'null') {
      return userDetails.profilePicture
    }
    
    // Return null for placeholder
    return null
  }

  // Get initials for placeholder
  const getInitials = () => {
    const { surName, lastName, email } = userDetails
    
    if (surName && lastName) {
      return `${surName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
    }
    
    if (surName) {
      return surName.charAt(0).toUpperCase()
    }
    
    if (lastName) {
      return lastName.charAt(0).toUpperCase()
    }
    
    // Use first two letters of email
    const emailPrefix = email.split('@')[0]
    if (emailPrefix.length >= 2) {
      return emailPrefix.substring(0, 2).toUpperCase()
    }
    
    return email.charAt(0).toUpperCase()
  }

  // Get placeholder background color
  const getPlaceholderBgColor = () => {
    const emailHash = userDetails.email.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)
    
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500',
      'bg-cyan-500', 'bg-violet-500'
    ]
    
    return colors[emailHash % colors.length]
  }

  const hasProfileImage = getProfileImageUrl() !== null

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

  const { mainBio, specialties, experience, hasBio } = parseBio(userDetails.bio || '')

  // Get verification badge color
  const getVerificationBadgeColor = (verified: boolean) => {
    return verified 
      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }

  // Get blog contributor badge color
  const getBlogContributorBadgeColor = (isContributor: boolean) => {
    return isContributor 
      ? 'bg-purple-100 text-purple-800 hover:bg-purple-100' 
      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
  }

  // Get status badge color
  const getStatusBadgeColor = (status: boolean) => {
    return status 
      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
  }

  // Get metric card background color
  const getMetricCardColor = (index: number) => {
    const colors = [
      'bg-blue-50 border-blue-200 text-blue-700',
      'bg-green-50 border-green-200 text-green-700',
      'bg-purple-50 border-purple-200 text-purple-700',
      'bg-orange-50 border-orange-200 text-orange-700'
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agent Profile</h1>
          <p className="text-gray-600 mt-1 dark:text-white/80">Detailed information about the real estate agent</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getVerificationBadgeColor(userDetails.agentId.agentVerified)}>
            {userDetails.agentId.agentVerified ? (
              <>
                <ShieldCheck className="h-3 w-3 mr-1" />
                Verified Agent
              </>
            ) : (
              <>
                <Shield className="h-3 w-3 mr-1" />
                Unverified Agent
              </>
            )}
          </Badge>
          
          <Badge className={getBlogContributorBadgeColor(userDetails.blogCollaborator)}>
            {userDetails.blogCollaborator ? (
              <>
                <FileText className="h-3 w-3 mr-1" />
                Blog Contributor
              </>
            ) : (
              <>
                <BookOpen className="h-3 w-3 mr-1" />
                Not a Contributor
              </>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image or Placeholder */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  {hasProfileImage && !imageError ? (
                    <img
                      src={getProfileImageUrl()!}
                      alt={`${userDetails.surName} ${userDetails.lastName}`}
                      className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className={`${getPlaceholderBgColor()} w-32 h-32 rounded-full flex items-center justify-center border-4 border-white shadow-lg`}>
                      <span className="text-4xl font-bold text-white">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                  
                  {/* Status indicator */}
                  <div className="absolute -bottom-2 -right-2">
                    {userDetails.agentId.agentVerified ? (
                      <div className="bg-green-500 text-white p-1 rounded-full">
                        <BadgeCheck className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="bg-gray-500 text-white p-1 rounded-full">
                        <Shield className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <h2 className="text-xl font-semibold">
                    {userDetails.surName} {userDetails.lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-white/80">@{userDetails.username}</p>
                  {(!hasProfileImage || imageError) && (
                    <p className="text-xs text-gray-500 mt-1">
                      Using placeholder avatar
                    </p>
                  )}
                </div>

                {/* Agency Info */}
                <div className="mt-4 flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                  <Building className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    {userDetails.agentId.agencyName}
                  </span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 dark:text-white/90">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="truncate">{userDetails.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{userDetails.phoneNumber}</span>
                  </div>
                  {userDetails.additionalPhoneNumber && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>Alt: {userDetails.additionalPhoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{userDetails.city}, {userDetails.state}</span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div className="space-y-3">
                <h3 className="font-medium text-gray-700 dark:text-white/90">Account Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-700">Profile</span>
                    <Badge variant={userDetails.profileCreated ? "default" : "secondary"} 
                           className={getStatusBadgeColor(userDetails.profileCreated)}>
                      {userDetails.profileCreated ? 'Complete' : 'Incomplete'}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-700">Onboarded</span>
                    <Badge variant={userDetails.userOnboarded ? "default" : "secondary"} 
                           className={getStatusBadgeColor(userDetails.userOnboarded)}>
                      {userDetails.userOnboarded ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-700">User Verified</span>
                    <Badge variant={userDetails.userVerified ? "default" : "secondary"} 
                           className={getStatusBadgeColor(userDetails.userVerified)}>
                      {userDetails.userVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium dark:text-gray-700">Agent Verified</span>
                    <Badge variant={userDetails.agentId.agentVerified ? "default" : "secondary"} 
                           className={getStatusBadgeColor(userDetails.agentId.agentVerified)}>
                      {userDetails.agentId.agentVerified ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agency Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Agency Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <p className="text-sm font-medium text-gray-700 dark:text-white/70">Office Phone</p>
                  <p className="text-sm text-gray-900 dark:text-white">{userDetails.agentId.officeNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-white/70">Inspection Fee</p>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(userDetails.agentId.inspectionFeePerHour)}/hour
                    </span>
                  </div>
                </div>
                {userDetails.agentId.licenseNumber && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-white/70">License Number</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{userDetails.agentId.licenseNumber}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600 dark:text-white/70">Properties Listed</span>
                  <span className="text-sm font-semibold">{userDetails.agentId.apartments.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-sm text-gray-600 dark:text-white/70">Total Clients</span>
                  <span className="text-sm font-semibold">{userDetails.agentId.clients.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-sm text-gray-600 dark:text-white/70">Potential Clients</span>
                  <span className="text-sm font-semibold">{userDetails.agentId.potentialClients.length}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-sm text-gray-600 dark:text-white/70">Inspections</span>
                  <span className="text-sm font-semibold">{userDetails.agentId.inspections.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details and Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Bio */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Professional Bio
                {!hasBio && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    No Bio Provided
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base dark:text-white/80">
                  {mainBio}
                </p>

                {/* Experience Section */}
                {experience && (
                  <div className={`border rounded-lg p-4 bg-blue-50 border-blue-200`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-blue-800">Professional Experience</h4>
                    </div>
                    <p className="text-sm text-blue-700">{experience}</p>
                  </div>
                )}

                {/* Specialties Section */}
                {specialties.length > 0 && (
                  <div className={`border rounded-lg p-4 bg-purple-50 border-purple-200`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Target className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-purple-800">Areas of Expertise</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {specialties.map((specialty, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary"
                          className="bg-white text-purple-700 border-purple-200"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {!hasBio && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-white/70">This agent hasn't added a professional bio yet.</p>
                    <p className="text-sm text-gray-500 dark:text-white/60 mt-1">
                      Encourage them to complete their profile for better client engagement.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Business Metrics */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Business Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon: Home, label: 'Properties Listed', value: userDetails.agentId.apartments.length, index: 0 },
                  { icon: Users, label: 'Total Clients', value: userDetails.agentId.clients.length, index: 1 },
                  { icon: Users, label: 'Potential Clients', value: userDetails.agentId.potentialClients.length, index: 2 },
                  { icon: Calendar, label: 'Inspections', value: userDetails.agentId.inspections.length, index: 3 }
                ].map((metric) => (
                  <div 
                    key={metric.label} 
                    className={`${getMetricCardColor(metric.index)} border rounded-lg p-4 text-center`}
                  >
                    <div className="flex flex-col items-center">
                      <metric.icon className="h-8 w-8 mb-2" />
                      <div className="text-2xl font-bold mb-1">{metric.value}</div>
                      <p className="text-xs opacity-80">{metric.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Platform Activity */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Platform Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Blog activities - ONLY show if user is a blog collaborator */}
                {userDetails.blogCollaborator ? (
                  <>
                    <div className={`border rounded-lg p-4 bg-green-50 border-green-200`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <h4 className="font-semibold text-green-800">Blog Contributor Activity</h4>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          Active Contributor
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2 border-b border-green-100">
                          <span className="text-sm text-green-700 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Blogs Created
                          </span>
                          <span className="text-sm font-semibold text-green-800">{userDetails.createdBlogs.length}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-sm text-green-700 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Blog Collaborations
                          </span>
                          <span className="text-sm font-semibold text-green-800">{userDetails.collaborations.length}</span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-gray-400" />
                        <h4 className="font-medium text-gray-700 dark:text-white/80">Blog Contributor Status</h4>
                      </div>
                      <Badge variant="secondary" className="text-gray-600">
                        Not Active
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-white/60">
                      This user is not currently a blog contributor.
                    </p>
                  </div>
                )}
                
                {/* Property activities - always show */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="h-5 w-5 text-red-500" />
                      <h4 className="font-medium text-gray-700 dark:text-white/80">Property Engagement</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-white/70">Liked Properties</span>
                        <span className="text-sm font-semibold">{userDetails.likedApartments.length}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-white/70">Bookmarked Properties</span>
                        <span className="text-sm font-semibold">{userDetails.bookmarkedApartments.length}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-5 w-5 text-blue-500" />
                      <h4 className="font-medium text-gray-700 dark:text-white/80">Verification Status</h4>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-white/70">Agent Verification</span>
                        <Badge 
                          variant={userDetails.agentId.agentVerified ? "default" : "secondary"} 
                          className={getStatusBadgeColor(userDetails.agentId.agentVerified)}
                        >
                          {userDetails.agentId.agentVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-white/70">User Verification</span>
                        <Badge 
                          variant={userDetails.userVerified ? "default" : "secondary"} 
                          className={getStatusBadgeColor(userDetails.userVerified)}
                        >
                          {userDetails.userVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                System Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-white/70 mb-2">User Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/60">User ID</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white truncate">{userDetails._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/60">Role</p>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">{userDetails.role}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 dark:text-white/70 mb-2">Agent Information</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/60">Agent ID</p>
                      <p className="text-sm font-mono text-gray-900 dark:text-white truncate">{userDetails.agentId._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-white/60">Verification Status</p>
                      <p className="text-sm text-gray-900 dark:text-white capitalize">{userDetails.agentId.verificationStatus}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ActiveAgentClient