import { Notification02Icon, AddInvoiceIcon, PlazaIcon, FavouriteIcon, BookmarkCheck01Icon, FileIcon, UserMultiple02Icon, Settings01Icon, User03Icon, DashboardCircleEditIcon, QuillWrite02Icon, LicenseIcon, BookmarkAdd01Icon, Calendar01Icon} from '@hugeicons/core-free-icons';

const user_nav_links = [
  {
    text: 'Notifications',
    icon: Notification02Icon,
    path: '/user-dashboard',
    page: 'notifications'
  },
  {
    text: 'Transactions',
    icon: AddInvoiceIcon,
    path: '/user-dashboard/transactions',
    page: 'transactions'
  },
  {
    text: 'Apartments',
    icon: PlazaIcon,
    path: '/user-dashboard/apartments',
    page: 'apartments'
  },
  {
    text: 'Likes',
    icon: FavouriteIcon,
    path: '/user-dashboard/likes',
    page: 'likes'
  },
  {
    text: 'Saves',
    icon: BookmarkCheck01Icon,
    path: '/user-dashboard/saves',
    page: 'saves' 
  },
  {
    text: 'Create Blog',
    icon: QuillWrite02Icon,
    path: '/user-dashboard/create-blog',
    page: 'create blog'
  },
  {
    text: 'Blogs',
    icon: LicenseIcon,
    path: '/user-dashboard/created-blogs',
    page: 'created blogs' 
  },
  {
    text: 'Settings',
    icon: Settings01Icon,
    path: '/user-dashboard/settings',
    page: 'settings'
  },
];


const agent_nav_link = [
  {
    text: 'Notifications',
    icon: Notification02Icon,
    path: '/agent-dashboard',
    page: 'notifications'
  },
  {
    text: 'Profile',
    icon: User03Icon,
    path: '/agent-dashboard/profile',
    page: 'profile'
  },
  {
    text: 'Add Apartments',
    icon: DashboardCircleEditIcon,
    path: '/agent-dashboard/add-apartments',
    page: 'add apartments'
  },
  {
    text: 'Apartments',
    icon: PlazaIcon,
    path: '/agent-dashboard/apartments',
    page: 'apartments'
  },
  {
    text: 'Transactions',
    icon: AddInvoiceIcon,
    path: '/agent-dashboard/transactions',
    page: 'transactions'
  },
  {
    text: 'Create Blog',
    icon: QuillWrite02Icon,
    path: '/agent-dashboard/create-blog',
    page: 'create blog'
  },
  {
    text: 'Blogs',
    icon: LicenseIcon,
    path: '/agent-dashboard/created-blogs',
    page: 'created blogs' 
  },
  {
    text: 'Saves',
    icon: BookmarkAdd01Icon,
    path: '/agent-dashboard/saves',
    page: 'saves'
  },
  {
    text: 'Likes',
    icon: FavouriteIcon,
    path: '/agent-dashboard/likes',
    page: 'likes'
  },
  {
    text: 'Clients',
    icon: UserMultiple02Icon,
    path: '/agent-dashboard/clients',
    page: 'clients'
  },
  {
    text: 'Inspections',
    icon: Calendar01Icon,
    path: '/agent-dashboard/inspections',
    page: 'inspections'
  },
  {
    text: 'Settings',
    icon: Settings01Icon,
    path: '/agent-dashboard/settings',
    page: 'settings'
  },
];

const admin_nav_links = [
  {
    text: 'Notifications',
    icon: Notification02Icon,
    path: '/admin-dashboard',
    page: 'notifications'
  },
  {
    text: 'Verifications',
    icon: UserMultiple02Icon,
    path: '/admin-dashboard/verifications',
    page: 'verifications'
  },
  {
    text: 'Transactions',
    icon: AddInvoiceIcon,
    path: '/admin-dashboard/transactions',
    page: 'transactions'
  },
  {
    text: 'Apartments',
    icon: PlazaIcon,
    path: '/admin-dashboard/apartments',
    page: 'apartments'
  },
  {
    text: 'Create Blog',
    icon: DashboardCircleEditIcon,
    path: '/admin-dashboard/create-blog',
    page: 'create blog'
  },
  {
    text: 'Created Blogs',
    icon: FileIcon,
    path: '/admin-dashboard/created-blogs',
    page: 'created blogs'
  },
  {
    text: 'All Blogs',
    icon: FileIcon,
    path: '/admin-dashboard/all-blogs',
    page: 'all blogs'
  },
  {
    text: 'Settings',
    icon: Settings01Icon,
    path: '/admin-dashboard/settings',
    page: 'settings'
  },
];

export { user_nav_links, agent_nav_link, admin_nav_links };