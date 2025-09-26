import { Notification02Icon, AddInvoiceIcon, PlazaIcon, FavouriteIcon, BookmarkCheck01Icon, FileIcon, UserMultiple02Icon, Settings01Icon, User03Icon, DashboardCircleEditIcon } from '@hugeicons/core-free-icons';

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
    text: 'Liked Apartments',
    icon: FavouriteIcon,
    path: '/user-dashboard/liked-apartments',
    page: 'liked apartments'
  },
  {
    text: 'Saved Apartments',
    icon: BookmarkCheck01Icon,
    path: '/user-dashboard/saved-apartments',
    page: 'saved apartments' 
  },
  {
    text: 'Saved Blogs',
    icon: FileIcon,
    path: '/user-dashboard/saved-blogs',
    page: 'saved blogs'
  },
  {
    text: 'Agents',
    icon: UserMultiple02Icon,
    path: '/user-dashboard/agents',
    page: 'agents'
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
    text: 'Saved Blogs',
    icon: FileIcon,
    path: '/agent-dashboard/saved-blogs',
    page: 'saved blogs'
  },
  {
    text: 'Clients',
    icon: UserMultiple02Icon,
    path: '/agent-dashboard/clients',
    page: 'clients'
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