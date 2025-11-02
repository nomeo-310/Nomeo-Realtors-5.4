import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, HourglassIcon, AlertCircleIcon, SecurityCheckIcon, CreditCardAcceptIcon, Clock03Icon, Note01Icon, TelephoneIcon, ArrowRight01Icon, Link05Icon, CreditCardAddIcon, QuillWrite02Icon, User03Icon, ContactBookIcon, PlazaIcon, SmartPhone01Icon} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import { AdminDetailsProps, NotificationProps } from '@/lib/types';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { capitalizeName } from '@/utils/capitalizeName';
import { useDeleteNotification } from '@/hooks/use-delete-notification';
import { formatDate } from '@/utils/formatDate';

type notificationCardProps = {
  notification: NotificationProps
  user: AdminDetailsProps;
  index: number;
};

type notificationTypes = 'notification' | 'inspection' | 'rentouts' | 'verification' | 'pending' | 'payment' | 'add-clients' | 'profile' | 'blog-invitation' | string;

const NotificationCard = ({notification, user }:notificationCardProps) => {
  const { seen, type, _id, createdAt, title, content, issuer, propertyId, blogId, agentId, inspectionId } = notification;

  const pathName = usePathname();
  const queryClient = useQueryClient();

  const fullUserName = `${capitalizeName(user.userId.surName || '')} ${capitalizeName(user.userId.lastName || '')}`

  const generateIcon = (type:notificationTypes) => {
    let icon:React.ReactElement = <HugeiconsIcon icon={AlertCircleIcon} className='md:size-5 size-4' />;
    let bg_color: string = 'bg-gray-200';

    switch (type) {
      case 'inspection':
        icon = <HugeiconsIcon icon={Note01Icon} className={cn('md:size-5 size-4', !seen && 'fill-blue-400')}/>;
        bg_color = 'bg-blue-200 text-blue-600';
        break;
      case 'rentouts': 
        icon = <HugeiconsIcon icon={Clock03Icon} className={cn('md:size-5 size-4 ', !seen && 'fill-orange-400')}/>;
        bg_color = 'bg-orange-200 text-orange-600';
        break;
      case 'verification': 
        icon = <HugeiconsIcon icon={SecurityCheckIcon} className={cn('md:size-5 size-4', !seen && 'fill-blue-400')}/>;
        bg_color = 'bg-blue-200 text-blue-600';
        break;
      case 'profile': 
        icon = <HugeiconsIcon icon={User03Icon} className={cn('md:size-5 size-4', !seen && 'fill-blue-400')}/>;
        bg_color = 'bg-blue-200 text-blue-600';
        break;
      case 'pending': 
        icon = <HugeiconsIcon icon={HourglassIcon}  className={cn('md:size-5 size-4', !seen && 'fill-blue-400')}/>;
        bg_color = 'bg-blue-200 text-blue-600';
        break;
      case 'payment': 
        icon = <HugeiconsIcon icon={CreditCardAcceptIcon} className={cn('md:size-5 size-4', !seen && 'fill-blue-400')}/>;
        bg_color = 'bg-blue-200 text-blue-600';
        break;
      case 'add-clients': 
        icon = <HugeiconsIcon icon={ContactBookIcon} className={cn('md:size-5 size-4', !seen && 'fill-blue-400')}/>;
        bg_color = 'bg-blue-200 text-blue-600';
        break;
      case 'blog-invitation': 
        icon = <HugeiconsIcon icon={QuillWrite02Icon} className={cn('md:size-5 size-4', !seen && 'fill-blue-400')}/>;
        bg_color = 'bg-blue-200 text-blue-600';
        break;
      default:
        icon = <HugeiconsIcon icon={AlertCircleIcon} className={cn('md:size-5 size-4 ', !seen && 'fill-green-400')}/>;
        bg_color = 'bg-green-200 text-green-600';
        break;
    }

    return { icon, bg_color};
  };

  const { icon, bg_color } = generateIcon(type);

  const { mutate } = useDeleteNotification(_id, true);

  const  path = usePathname();

  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className='w-full border-b dark:border-b-white/70 last:border-b-0 flex gap-2 items-start py-2 md:py-3'>
      <div className={cn(`size-8 md:size-9 lg:size-10 flex items-center justify-center rounded-md ${bg_color}`, seen && 'bg-gray-200 dark:bg-[#424242] text-gray-600 dark:text-white')}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className='md:text-sm text-black/70 text-xs'>{formatDate(createdAt)}</span>
          { seen &&
            <button type='button' onClick={() => {mutate(); queryClient.invalidateQueries({ queryKey: ['all-user-notifications'] });}}>
              <HugeiconsIcon icon={Cancel01Icon} className='md:size-5 size-4'/>
            </button>
          }
        </div>
        <h2 className='font-semibold font-quicksand lg:text-lg'>{title}</h2>
        <p className='text-sm w-full text-wrap text-black/60 dark:text-white/80 text-justify'>{content}</p>
        { type === 'inspection' &&
          <React.Fragment>
            { user.role === 'agent' ? (
              <div className='w-full mt-2 flex gap-2 flex-col'>
                <button className="flex items-center gap-4" onClick={() => setShowDetails((prev) => !prev)} type='button'>
                  <h2 className='text-xs font-semibold'>USER&apos;S & OTHER DETAILS</h2>
                  <hr className='flex-1 dark:border-white/70'/>
                  <HugeiconsIcon icon={ArrowRight01Icon} className={cn('md:size-5 size-4', showDetails ? '-rotate-90' : 'rotate-90')}/>
                </button>
                { showDetails &&
                  <div className='flex gap-2 items-center'>
                    <div className="relative size-14 md:size-16 rounded-full overflow-hidden flex-none">
                      <Image src={issuer?.profilePicture || '/images/default_user.png'} alt='issuer_avatar' fill className='object-cover object-center'/>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={User03Icon} className='md:size-5 size-4'/>
                        <h2 className='text-sm text-black/70 font-medium'>{issuer?.surName} {issuer?.lastName}</h2>
                      </div>
                      <div className='flex items-center gap-2'>
                        <HugeiconsIcon icon={TelephoneIcon} className='md:size-5 size-4'/>
                        <p className='text-sm text-black/70 font-medium'>{issuer?.phoneNumber}</p>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <HugeiconsIcon icon={Link05Icon} className='md:size-5 size-4'/>
                        <Link href={`/apartment/${propertyId}`} className='font-medium'>check out full details of the apartment</Link>
                      </div>
                    </div>
                  </div>
                }
              </div> 
            ): (
              <div className='w-full mt-2 flex gap-2 flex-col'>
                <button className="flex items-center gap-4" onClick={() => setShowDetails((prev) => !prev)} type='button'>
                  <h2 className='text-xs font-semibold'>AGENT&apos;S & OTHER DETAILS</h2>
                  <hr className='flex-1 dark:border-white/70'/>
                  <HugeiconsIcon icon={ArrowRight01Icon} className={cn('md:size-5 size-4', showDetails ? '-rotate-90' : 'rotate-90')}/>
                </button>
                { showDetails &&
                  <div className='flex gap-2'>
                    <div className="relative size-14 md:size-16 rounded-full overflow-hidden flex-none">
                      <Image src={agentId?.userId.profilePicture || '/images/default_user.png'} alt='issuer_avatar' fill className='object-cover object-center'/>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <HugeiconsIcon icon={User03Icon} className='md:size-5 size-4'/>
                        <h2 className='text-sm text-black/70 font-medium'>{agentId?.userId.surName} {agentId?.userId.lastName}</h2>
                      </div>
                      <div className='flex items-center gap-2'>
                        <HugeiconsIcon icon={PlazaIcon} className='md:size-5 size-4'/>
                        <p className='text-sm text-black/70 font-medium'>{agentId?.agencyName}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <HugeiconsIcon icon={TelephoneIcon} className='md:size-5 size-4'/>
                        <p className='text-sm text-black/70 font-medium'>{agentId?.officeNumber}</p>
                      </div>
                      <div className='flex items-center gap-2'>
                        <HugeiconsIcon icon={SmartPhone01Icon} className='md:size-5 size-4'/>
                        <p className='text-sm text-black/70 font-medium'>{agentId?.userId.phoneNumber}</p>
                      </div>
                      <div className='flex items-center gap-2 text-sm'>
                        <HugeiconsIcon icon={Link05Icon} className='md:size-5 size-4'/>
                        <Link href={`/apartment/${propertyId}`} className='font-medium'>check out full details of the apartment</Link>
                      </div>
                    </div>
                  </div>
                }
              </div> 
          )}
          </React.Fragment>
        }
      </div>
    </div>
  )
}

export default NotificationCard