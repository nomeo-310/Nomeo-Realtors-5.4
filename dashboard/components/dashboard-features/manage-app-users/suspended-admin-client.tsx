'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Mail, Phone, MapPin, Clock, AlertTriangle, CheckCircle, MessageSquare, Loader2, XCircle, Shield, UserCog, Key, User, History } from 'lucide-react';
import { AdminDetailsProps } from '@/lib/types';
import { formatDateWithFullMonth } from '@/utils/formatDate';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { liftUserSuspension, extendSuspension, handleAppeal } from '@/actions/suspension-actions';
import { SuspensionDuration } from '@/models/suspension';

// Simplified interfaces
export interface AdminDetails {
  _id: string;
  adminAccess: string;
  adminPermissions: string[];
  adminOnboarded: boolean;
  createdAt: string;
  adminId: string;
}

export interface HistoryItem {
  action: string;
  description: string;
  performedBy: any; // Simplified - can be object or string
  performedAt: string;
  reason?: string;
  duration?: string;
  data?: {
    category: string;
    suspensionCount: number;
    adminType?: string;
  };
  _id: string;
}

export interface SuspensionData {
  _id: string;
  user: {
    _id: string;
    email: string;
    role: string;
    lastName: string;
    phoneNumber: string;
    profilePicture: string;
    surName: string;
    bio?: string;
    adminDetails?: AdminDetails;
    city?: string;
    state?: string;
  };
  isActive: boolean;
  suspendedUntil: string;
  history: HistoryItem[];
}

interface SuspendedAdminClientProps {
  suspensionDetails: SuspensionData;
  currentUser: AdminDetailsProps;
}

const SuspendedAdminClient = ({ suspensionDetails, currentUser }: SuspendedAdminClientProps) => {
  const { user, isActive, suspendedUntil, history } = suspensionDetails;

  const suspensionEntry = history.find(h => h.action === 'suspension');
  const appealEntry = history.find(h => h.action === 'appeal');

  const userName = `${user.surName} ${user.lastName}`;
  const userInitials = `${user.surName[0]}${user.lastName[0]}`.toUpperCase();

  const isAppealPending = !!appealEntry;
  const isSuspended = isActive && new Date(suspendedUntil) > new Date();
  const adminDetails = user.adminDetails;

  const path = usePathname();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Simple check if performedBy is an object with user details
  const getPerformerInfo = (performedBy: any) => {
    if (!performedBy) return null;
    
    // If it's a string (ObjectId), return null
    if (typeof performedBy === 'string') return null;
    
    // If it has email and name properties, it's populated
    if (performedBy.email && performedBy.surName) {
      return {
        name: `${performedBy.surName} ${performedBy.lastName || ''}`,
        email: performedBy.email,
        image: performedBy.profilePicture,
        initials: `${performedBy.surName[0]}${performedBy.lastName?.[0] || ''}`.toUpperCase()
      };
    }
    
    return null;
  };

  // Check if current user can process appeal
  const canProcessAppeal = () => {
    if (currentUser.role === 'superAdmin') return true;
    
    if (!suspensionEntry) return false;
    
    const performerInfo = getPerformerInfo(suspensionEntry.performedBy);
    if (performerInfo) {
      // Compare with current user's ID
      // This depends on how currentUser is structured
      return currentUser.userId?._id === suspensionEntry.performedBy._id;
    }
    
    return false;
  };

  // Check if current user can perform actions
  const canPerformActions = () => {
    if (currentUser.role === 'superAdmin') return true;
    
    if (!suspensionEntry) return false;
    
    const performerInfo = getPerformerInfo(suspensionEntry.performedBy);
    if (performerInfo) {
      return currentUser.userId?._id === suspensionEntry.performedBy._id;
    }
    
    return false;
  };

  const getStatusVariant = () => {
    if (!isSuspended) return "default";
    if (isAppealPending) return "secondary";
    return "destructive";
  };

  const getStatusText = () => {
    if (!isSuspended) return "Active";
    if (isAppealPending) return "Appeal Pending";
    return "Suspended";
  };

  const getDurationText = (duration?: string) => {
    if (!duration) return 'N/A';
    const durationMap: Record<string, string> = {
      '24_hours': '24 Hours',
      '3_days': '3 Days',
      '7_days': '7 Days',
      '30_days': '30 Days',
      'indefinite': 'Indefinite'
    };
    return durationMap[duration] || duration.replace('_', ' ');
  };

  const getAdminAccessText = (access?: string) => {
    if (!access) return 'Unknown';
    const textMap: Record<string, string> = {
      'full_access': 'Full Access',
      'limited_access': 'Limited Access',
      'superAdmin': 'Super Admin'
    };
    return textMap[access] || access;
  };

  const [loadingStates, setLoadingStates] = React.useState({
    approve: false,
    reject: false
  });

  const [pendingStates, setPendingStates] = React.useState({
    lift: false,
    extend: false
  });

  const processSuspensionAppeal = async (decision: 'approve' | 'reject') => {
    setLoadingStates(prev => ({ ...prev, [decision]: true }));

    const adminName = `${suspensionDetails.user.surName} ${suspensionDetails.user.lastName}`;
    
    const noteVariations = {
      approve: [
        `Appeal approved for ${adminName}. Suspension lifted.`,
        `Appeal approved. Admin access restored.`,
        `Appeal approved. Suspension lifted.`
      ],
      reject: [
        `Appeal rejected. Suspension continues.`,
        `Appeal rejected. Suspension remains.`,
        `Appeal rejected.`
      ]
    };

    const randomIndex = Math.floor(Math.random() * noteVariations[decision].length);
    const adminNotes = noteVariations[decision][randomIndex];

    const appealData = {
      suspensionId: suspensionDetails._id,
      appealId: appealEntry?._id || '',
      decision: decision,
      adminNotes: adminNotes,
      path: path,
    };

    try {
      const result = await handleAppeal(appealData);
      
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['suspended-admins'] });
        if (decision === 'approve') {
          router.push(`/${currentUser.role === 'superAdmin' ? 'superadmin' : currentUser.role}-dashboard/manage-admins`);
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error handling appeal:', error);
      toast.error('Failed to process appeal');
    } finally {
      setLoadingStates(prev => ({ ...prev, [decision]: false }));
    }
  };

  const liftSuspension = async () => {
    setPendingStates(prev => ({ ...prev, lift: true }));

    const adminName = `${suspensionDetails.user.surName} ${suspensionDetails.user.lastName}`;
    
    const liftReasons = [
      `Suspension lifted for ${adminName}.`,
      `Suspension lifted. Admin access restored.`,
      `${adminName}'s suspension has been lifted.`,
    ];

    const randomIndex = Math.floor(Math.random() * liftReasons.length);
    const liftReason = liftReasons[randomIndex];

    const data = {
      suspensionId: suspensionDetails._id,
      liftReason: liftReason,
      path: path,
    };

    try {
      const result = await liftUserSuspension(data);
      
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['suspended-admins'] });
        router.push(`/${currentUser.role === 'superAdmin' ? 'superadmin' : currentUser.role}-dashboard/manage-admins`);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error lifting suspension:', error);
      toast.error('Failed to lift suspension');
    } finally {
      setPendingStates(prev => ({ ...prev, lift: false }));
    }
  };

  const extendUserSuspension = async () => {
    setPendingStates(prev => ({ ...prev, extend: true }));

    const adminName = `${suspensionDetails.user.surName} ${suspensionDetails.user.lastName}`;
    
    const extensionReasons = [
      `Suspension extended for ${adminName}.`,
      `Additional suspension time needed.`,
      `${adminName}'s suspension extended.`,
    ];

    const randomIndex = Math.floor(Math.random() * extensionReasons.length);
    const extensionReason = extensionReasons[randomIndex];

    const originalDuration = suspensionEntry?.duration || '30_days' as SuspensionDuration;
    const durationForApi = originalDuration === 'permanent' ? 'indefinite' : originalDuration;

    const data = {
      suspensionId: suspensionDetails._id,
      userId: suspensionDetails.user._id,
      duration: originalDuration as SuspensionDuration,
      extensionReason: extensionReason,
      category: suspensionEntry?.data?.category || 'other',
      path: path,
    };

    try {
      const result = await extendSuspension(data);
      
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['suspended-admins'] });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error extending suspension:', error);
      toast.error('Failed to extend suspension');
    } finally {
      setPendingStates(prev => ({ ...prev, extend: false }));
    }
  };

  return (
    <div className='w-full h-full flex flex-col gap-4 md:gap-6 pb-6'>
      {/* Header */}
      <div className="flex items-center justify-between w-full">
        <h2 className='text-lg font-semibold md:text-xl'>
          Suspended Admin Details
        </h2>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            <Shield className="w-3 h-3 mr-1" />
            {user.role}
          </Badge>
          <Badge variant={getStatusVariant()} className="text-xs">
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Admin Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center p-4">
            <Avatar className="w-20 h-20 mx-auto mb-3">
              <AvatarImage src={user.profilePicture} alt={userName} />
              <AvatarFallback className="text-base">{userInitials}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-base">{userName}</CardTitle>
            <CardDescription className="text-sm">
              {getAdminAccessText(adminDetails?.adminAccess)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">{user.phoneNumber}</span>
            </div>
            
            {adminDetails && (
              <div className="pt-3 border-t space-y-2">
                <h4 className="font-semibold text-sm flex items-center gap-2">
                  <UserCog className="w-4 h-4" />
                  Admin Info
                </h4>
                <div>
                  <p className="text-xs text-muted-foreground">Admin ID</p>
                  <p className="text-sm font-mono">{adminDetails.adminId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Onboarding</p>
                  <Badge variant={adminDetails.adminOnboarded ? "default" : "secondary"} className="text-xs">
                    {adminDetails.adminOnboarded ? 'Onboarded' : 'Pending'}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Suspension Details Card */}
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-destructive" />
                Suspension Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Suspended Until</p>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{formatDateWithFullMonth(suspendedUntil)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="text-sm">{getDurationText(suspensionEntry?.duration)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm capitalize">
                    {suspensionEntry?.data?.category?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Suspension Count</p>
                  <p className="text-sm">{suspensionEntry?.data?.suspensionCount || 1}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm mt-1">{suspensionEntry?.reason}</p>
              </div>
            </CardContent>
          </Card>

          {/* History & Appeals Tabs */}
          <Tabs defaultValue="history">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history" className="text-sm">History</TabsTrigger>
              <TabsTrigger value="appeal" className="text-sm">
                Appeal {isAppealPending && <Badge variant="secondary" className="ml-2 text-xs">Pending</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history">
              <Card>
                <CardHeader className="p-4">
                  <CardTitle className="flex items-center gap-2">
                    <History className="size-5" />
                    Activity Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {history.map((entry, index) => {
                      const performerInfo = getPerformerInfo(entry.performedBy);
                      const actionText = entry.action.replace('_', ' ');
                      
                      return (
                        <div key={entry._id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={`w-3 h-3 rounded-full ${entry.action === 'suspension' ? 'bg-destructive' :
                              entry.action === 'appeal' ? 'bg-blue-500' : 'bg-green-500'}`} />
                            {index < history.length - 1 && (
                              <div className="w-0.5 h-full bg-border mt-1" />
                            )}
                          </div>
                          <div className="flex-1 pb-4">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    entry.action === 'suspension' ? 'destructive' :
                                      entry.action === 'appeal' ? 'secondary' : 'default'
                                  } className="text-xs">
                                    {actionText}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {formatDateWithFullMonth(entry.performedAt)}
                                  </span>
                                </div>
                                <p className="text-sm mt-1">{entry.description}</p>
                              </div>
                              
                              {performerInfo && (
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-8">
                                    <AvatarImage src={performerInfo.image} alt={performerInfo.name} />
                                    <AvatarFallback className="text-xs">
                                      {performerInfo.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-xs font-medium">{performerInfo.name}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                                      {performerInfo.email}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {entry.reason && (
                              <div className="mt-2 p-2 bg-muted rounded">
                                <p className="text-xs font-medium">Reason:</p>
                                <p className="text-sm mt-1">{entry.reason}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appeal">
              {appealEntry ? (
                <Card>
                  <CardHeader className="p-4">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <MessageSquare className="w-4 h-4 text-blue-500" />
                      Admin Appeal
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Submitted on {formatDateWithFullMonth(appealEntry.performedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 p-4">
                    <div className="p-3 bg-blue-50 rounded">
                      <p className="text-sm text-blue-900">{appealEntry.reason}</p>
                    </div>
                    
                    {canProcessAppeal() ? (
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => processSuspensionAppeal('approve')}
                          disabled={loadingStates.approve || loadingStates.reject}
                          className="flex-1 text-sm bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          {loadingStates.approve ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          onClick={() => processSuspensionAppeal('reject')}
                          disabled={loadingStates.approve || loadingStates.reject}
                          variant="destructive"
                          className="flex-1 text-sm"
                          size="sm"
                        >
                          {loadingStates.reject ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </>
                          )}
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center">
                        You cannot process this appeal
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-6 text-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                    <h3 className="text-base font-medium mb-2">No Appeal Filed</h3>
                    <p className="text-sm text-muted-foreground">
                      No appeal has been filed for this suspension.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          {canPerformActions() && (
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {isSuspended ? (
                    <>
                      <Button
                        onClick={liftSuspension} 
                        disabled={pendingStates.lift}
                        className="flex-1 text-sm bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        {pendingStates.lift ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Lift Suspension
                          </>
                        )}
                      </Button>
                      <Button 
                        onClick={extendUserSuspension}
                        disabled={pendingStates.extend}
                        variant="outline"
                        className="flex-1 text-sm"
                        size="sm"
                      >
                        {pendingStates.extend ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4 mr-2" />
                            Extend
                          </>
                        )}
                      </Button>
                    </>
                  ) : (
                    <Button variant="destructive" className="flex-1 text-sm" size="sm">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Suspend Again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuspendedAdminClient;