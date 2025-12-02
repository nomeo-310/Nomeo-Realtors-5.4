'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Mail, Phone, MapPin, Clock, AlertTriangle, CheckCircle, MessageSquare, Loader2, XCircle, Building, Shield, Award, Wallet } from 'lucide-react';
import { AdminDetailsProps, SuspensionData } from '@/lib/types';
import { formatDateWithFullMonth } from '@/utils/formatDate';
import { usePathname, useRouter } from 'next/navigation';
import { extendSuspension, handleAppeal, liftUserSuspension } from '@/actions/suspension-actions';
import { toast } from 'sonner';
import React from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Type guard to check if agent is populated
function isAgentPopulated(agentId: any): agentId is { 
  _id: string;
  agencyName: string;
  officeAddress: string;
  officeNumber: string;
  licenseNumber?: string;
  inspectionFeePerHour?: number;
  agentVerified: boolean;
  verificationStatus: 'pending' | 'verified' | 'rejected';
} {
  return (
    typeof agentId === 'object' &&
    agentId !== null &&
    '_id' in agentId &&
    'agencyName' in agentId &&
    'officeAddress' in agentId &&
    'officeNumber' in agentId
  );
}

const SuspendedUserClient = ({ suspensionDetails, currentUser }: { suspensionDetails: SuspensionData, currentUser: AdminDetailsProps }) => {

  const { user, isActive, suspendedUntil, history } = suspensionDetails;

  const suspensionEntry = history.find(h => h.action === 'suspension');
  const appealEntry = history.find(h => h.action === 'appeal');

  const userName = `${user.surName} ${user.lastName}`;
  const userInitials = `${user.surName[0]}${user.lastName[0]}`.toUpperCase();

  const isAppealPending = !!appealEntry;
  const isSuspended = isActive && new Date(suspendedUntil) > new Date();
  const isAgent = user.role === 'agent';
  const hasAgentDetails = isAgent && user.agentId && isAgentPopulated(user.agentId);
  
  // Get the agent details safely
  const agentDetails = hasAgentDetails ? user.agentId : null;

  const path = usePathname();
  const router = useRouter();

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

  const getDurationText = (duration: string) => {
    const durationMap: Record<string, string> = {
      '24_hours': '24 Hours',
      '3_days': '3 Days',
      '7_days': '7 Days',
      '30_days': '30 Days',
      'indefinite': 'Indefinite',
      'permanent': 'Permanent'
    };
    return durationMap[duration] || duration;
  };

  const [loadingStates, setLoadingStates] = React.useState({
    approve: false,
    reject: false
  });

  const [pendingStates, setPendingStates] = React.useState({
    lift: false,
    extend: false
  });

  const queryClient = useQueryClient();

  const processSuspensionAppeal = async (decision: 'approve' | 'reject') => {
    setLoadingStates(prev => ({ ...prev, [decision]: true }));

    const userName = `${suspensionDetails.user.surName} ${suspensionDetails.user.lastName}`;
    
    const noteVariations = {
      approve: [
        `Appeal approved for ${userName}. User has shown understanding of guidelines. Suspension lifted.`,
        `Appeal approved - ${userName} demonstrated sufficient remediation. Account access restored.`,
        `After review, appeal approved for ${userName}. Suspension lifted effective immediately.`
      ],
      reject: [
        `Appeal rejected for ${userName}. Explanation insufficient. Suspension continues.`,
        `Appeal rejected - ${userName}'s appeal does not justify violation. Suspension remains.`,
        `After consideration, appeal rejected for ${userName}. Suspension period continues as scheduled.`
      ]
    };

    const randomIndex = Math.floor(Math.random() * noteVariations[decision].length);
    const adminNotes = noteVariations[decision][randomIndex];

    const appealData = {
      suspensionId: suspensionDetails?._id || '',
      appealId: appealEntry?._id || '',
      decision: decision,
      adminNotes: adminNotes,
      path: path,
    };

    try {
      const result = await handleAppeal(appealData);
      
      if (result.success) {
        toast.success(result.message);
        queryClient.invalidateQueries({ queryKey: ['suspended-users'] });
        {decision === 'approve' && router.push(`/${currentUser.role === 'superAdmin' ? 'superadmin' : currentUser.role}-dashboard/manage-users`);}
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

    const userName = `${suspensionDetails.user.surName} ${suspensionDetails.user.lastName}`;
    const suspensionCategory = suspensionEntry?.data?.category || 'policy violation';
    
    // Pre-filled lift reasons for different scenarios
    const liftReasons = [
      // General administrative reasons
      `Suspension lifted for ${userName}. Administrative review completed.`,
      `Manual suspension lift for ${userName}. Account access restored.`,
      `${userName}'s suspension has been lifted by administrator decision.`,
      
      // Time-based reasons
      `Suspension period completed early for ${userName}. Good behavior observed.`,
      `Proactive lift for ${userName}. User has served sufficient suspension time.`,
      
      // Appeal-related (even without seeing appeal text)
      `Suspension lifted for ${userName} after administrative reconsideration.`,
      `${userName}'s case reviewed - suspension lifted based on overall account history.`,
      
      // Category-specific reasons
      `Suspension lifted - ${suspensionCategory} issue resolved for ${userName}.`,
      `${userName} has addressed the ${suspensionCategory} concerns. Suspension lifted.`,
      
      // Professional/formal reasons
      `After comprehensive review, the suspension for ${userName} has been lifted effective immediately.`,
      `Administrative decision: ${userName}'s suspension is hereby lifted.`,
    ];

    // Pick random variation
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
        queryClient.invalidateQueries({ queryKey: isAgent ? ['suspended-agents'] : ['suspended-users'] });
        router.push(`/${currentUser.role === 'superAdmin' ? 'superadmin' : currentUser.role}-dashboard/${isAgent ? 'manage-agents' : 'manage-users'}`);
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

    const userName = `${suspensionDetails.user.surName} ${suspensionDetails.user.lastName}`;
    const suspensionCategory = suspensionEntry?.data?.category || 'policy violation';
    
    // Pre-filled extension reasons for different scenarios
    const extensionReasons = [
      // General administrative reasons
      `Suspension extended for ${userName}. Further review required.`,
      `Additional suspension time needed for ${userName} to address violations.`,
      `${userName}'s suspension extended pending comprehensive investigation.`,
      
      // Severity-based reasons
      `Severity of ${suspensionCategory} violation warrants extended suspension for ${userName}.`,
      `Due to serious nature of infraction, ${userName}'s suspension is extended.`,
      `${userName}'s ${suspensionCategory} violation requires additional suspension time.`,
      
      // Repeat offender reasons
      `Repeat violation by ${userName} necessitates extended suspension period.`,
      `Due to previous suspensions, ${userName}'s account requires extended review period.`,
      `Extended suspension for ${userName} based on account history and repeat offenses.`,
      
      // Appeal-related reasons
      `After reviewing appeal circumstances, ${userName}'s suspension is extended.`,
      `${userName}'s appeal does not adequately address violation - suspension extended.`,
      `Based on appeal review, additional suspension time required for ${userName}.`,
      
      // Safety/security reasons
      `Extended suspension for ${userName} to ensure community safety standards.`,
      `Additional time needed to verify ${userName}'s compliance with platform policies.`,
      `Precautionary extension for ${userName} pending security review completion.`,
      
      // Professional/formal reasons
      `Administrative decision: ${userName}'s suspension period is hereby extended.`,
      `After thorough evaluation, extended suspension is warranted for ${userName}.`,
      `Platform policy enforcement requires extended suspension for ${userName}.`,
    ];

    // Pick random variation
    const randomIndex = Math.floor(Math.random() * extensionReasons.length);
    const extensionReason = extensionReasons[randomIndex];

    // Normalize duration value to match the server-side SuspensionDuration type
    // (map any client-side 'permanent' value to the server's 'indefinite')
    const originalDuration = suspensionDetails.history.find(h => h.action === 'suspension')?.duration || '30_days';
    const durationForApi = originalDuration === 'permanent' ? 'indefinite' : originalDuration;

    const data = {
      suspensionId: suspensionDetails._id,
      userId: suspensionDetails.user._id,
      duration: durationForApi as any,
      extensionReason: extensionReason,
      category: suspensionEntry?.data?.category || 'other',
      path: path,
    };

    try {
      const result = await extendSuspension(data);
      
      if (result.success) {
        toast.success(result.message);
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
    <div className='w-full h-full flex flex-col gap-6 md:gap-8 lg:gap-10 pb-6'>
      {/* Header - Maintaining your original structure */}
      <div className="items-center flex justify-between w-full">
        <h2 className='text-xl font-semibold font-quicksand md:text-2xl lg:text-3xl'>
          {isAgent ? 'Suspended Agent Details' : 'Suspended User Details'}
        </h2>
        <div className="flex items-center gap-3">
          {isAgent && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Building className="w-3 h-3" />
              Agent
            </Badge>
          )}
          <Badge variant={getStatusVariant()} className="text-sm px-3 py-1">
            {getStatusText()}
          </Badge>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* User Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarImage src={user.profilePicture} alt={userName} />
              <AvatarFallback className="text-lg font-quicksand">{userInitials}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-xl font-quicksand">{userName}</CardTitle>
            <CardDescription className="font-quicksand capitalize">{user.role}</CardDescription>
            
            {/* Agent Verification Badge */}
            {agentDetails && typeof agentDetails !== 'string' && agentDetails.agentVerified && (
              <div className="flex justify-center mt-2">
                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  Verified Agent
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Contact Information */}
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-quicksand">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-quicksand">{user.phoneNumber}</span>
            </div>
            {user.additionalPhoneNumber && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-quicksand">{user.additionalPhoneNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-quicksand">{user.city}, {user.state}</span>
            </div>

            {/* Agent Details Section */}
            {agentDetails && (
              <div className="pt-4 border-t border-gray-200 space-y-3">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-blue-600">
                  <Building className="w-4 h-4" />
                  Agency Information
                </h4>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Agency Name</p>
                    <p className="text-sm font-quicksand">{agentDetails && typeof agentDetails !== 'string' ? agentDetails.agencyName : ''}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Office Address</p>
                    <p className="text-sm font-quicksand">{agentDetails && typeof agentDetails !== 'string' ? agentDetails.officeAddress : ''}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Office Number</p>
                    <p className="text-sm font-quicksand">{agentDetails && typeof agentDetails !== 'string' ? agentDetails.officeNumber : ''}</p>
                  </div>
                  
                  {agentDetails && typeof agentDetails !== 'string' && agentDetails.licenseNumber && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">License Number</p>
                      <p className="text-sm font-mono">{agentDetails.licenseNumber}</p>
                    </div>
                  )}
                  
                  {agentDetails && typeof agentDetails !== 'string' && agentDetails.inspectionFeePerHour && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">Inspection Fee</p>
                      <p className="text-sm font-quicksand flex items-center gap-1">
                        <Wallet className="w-3 h-3" />
                        ₦{agentDetails.inspectionFeePerHour.toLocaleString()}/hour
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-muted-foreground">Verification Status</p>
                    <Badge 
                      variant={
                        typeof agentDetails !== 'string' && agentDetails ?
                          (agentDetails.verificationStatus === 'verified' ? 'default' :
                            agentDetails.verificationStatus === 'pending' ? 'secondary' : 'destructive')
                          : 'default'
                      }
                      className="text-xs capitalize"
                    >
                      {typeof agentDetails !== 'string' && agentDetails ? agentDetails.verificationStatus : ''}
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {/* Agent without populated details */}
            {isAgent && !agentDetails && user.agentId && typeof user.agentId === 'string' && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-sm flex items-center gap-2 text-amber-600">
                  <Building className="w-4 h-4" />
                  Agent Profile
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Agent details not loaded. Reference ID: {user.agentId}
                </p>
              </div>
            )}

            {/* Bio Section */}
            {user.bio && (
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">About</h4>
                <p className="text-sm text-muted-foreground font-quicksand leading-relaxed">{user.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Area - Rest of your existing code remains the same */}
        <div className="lg:col-span-2 space-y-4 md:space-y-8">
          {/* Suspension Details Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-quicksand">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Suspension Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground font-quicksand">
                    Suspended Until
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    <span className="font-quicksand">{formatDateWithFullMonth(suspendedUntil)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground font-quicksand">
                    Duration
                  </label>
                  <p className="mt-1 font-quicksand">
                    {suspensionEntry?.duration ? getDurationText(suspensionEntry.duration) : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground font-quicksand">
                    Category
                  </label>
                  <p className="mt-1 capitalize font-quicksand">
                    {suspensionEntry?.data?.category?.replace('_', ' ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground font-quicksand">
                    Suspension Count
                  </label>
                  <p className="mt-1 font-quicksand">
                    {suspensionEntry?.data?.suspensionCount || 1}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground font-quicksand">
                  Reason for Suspension
                </label>
                <p className="mt-1 text-sm font-quicksand">{suspensionEntry?.reason}</p>
              </div>
            </CardContent>
          </Card>

          {/* History & Appeals Tabs */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 font-quicksand">
              <TabsTrigger value="history">Suspension History</TabsTrigger>
              <TabsTrigger value="appeal">
                Appeal {isAppealPending && (
                  <Badge variant="secondary" className="ml-2 font-quicksand">Pending</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-quicksand">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {history.map((entry, index) => (
                      <div key={entry._id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${entry.action === 'suspension' ? 'bg-destructive' :
                            entry.action === 'appeal' ? 'bg-blue-500' : 'bg-green-500'
                            }`} />
                          {index < history.length - 1 && (
                            <div className="w-0.5 h-full bg-border mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={
                              entry.action === 'suspension' ? 'destructive' :
                                entry.action === 'appeal' ? 'secondary' : 'default'
                            } className="font-quicksand">
                              {entry.action}
                            </Badge>
                            <span className="text-sm text-muted-foreground font-quicksand">
                              {formatDateWithFullMonth(entry.performedAt)}
                            </span>
                          </div>
                          <p className="text-sm font-quicksand">{entry.description}</p>
                          {entry.reason && (
                            <div className="mt-2 p-3 bg-muted rounded-lg">
                              <p className="text-sm font-medium font-quicksand">Reason:</p>
                              <p className="text-sm mt-1 font-quicksand">{entry.reason}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appeal">
              {appealEntry ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-quicksand">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      User Appeal
                    </CardTitle>
                    <CardDescription className="font-quicksand">
                      Submitted on {formatDateWithFullMonth(appealEntry.performedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900 font-quicksand">{appealEntry.reason}</p>
                    </div>
                    {suspensionEntry?.performedBy === currentUser.userId._id && (
                      <div className="flex gap-3">
                        <Button 
                          onClick={() => processSuspensionAppeal('approve')}
                          disabled={loadingStates.approve || loadingStates.reject}
                          className="flex-1 bg-secondary-blue text-white hover:bg-secondary-blue/90"
                        >
                          {loadingStates.approve ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Approving...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve Appeal
                            </>
                          )}
                        </Button>
                        
                        <Button 
                          onClick={() => processSuspensionAppeal('reject')}
                          disabled={loadingStates.approve || loadingStates.reject}
                          variant="outline"
                          className="flex-1"
                        >
                          {loadingStates.reject ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Rejecting...
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject Appeal
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-4 text-center">
                    <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2 font-quicksand">No Appeal Filed</h3>
                    <p className="text-muted-foreground font-quicksand">
                      The user has not filed an appeal for this suspension.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          {suspensionEntry?.performedBy === currentUser.userId._id && (
            <Card>
              <CardContent className="lg:p-4 p-3">
                <div className="flex gap-3">
                  {isSuspended ? (
                    <>
                      <Button
                        onClick={() => liftSuspension()} 
                        variant="default" 
                        className="flex-1 font-quicksand bg-secondary-blue text-white hover:bg-secondary-blue/90"
                        disabled={pendingStates.lift || pendingStates.extend}
                        >
                          { pendingStates.lift ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing ...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Unsuspend User
                            </>
                          )}
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 font-quicksand "
                        disabled={pendingStates.lift || pendingStates.extend}
                        onClick={() => extendUserSuspension()}
                      >
                        { pendingStates.extend ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Processing ...
                            </>
                          ) : (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Extend Suspension
                            </>
                          )}
                      </Button>
                    </>
                  ) : (
                    <Button variant="destructive" className="flex-1 font-quicksand">
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
  )
}

export default SuspendedUserClient