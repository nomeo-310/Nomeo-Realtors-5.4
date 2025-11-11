import { 
  Notification02Icon, 
  AddInvoiceIcon, 
  PlazaIcon, 
  FileIcon, 
  Settings01Icon, 
  QuillWrite02Icon, 
  Calendar01Icon, 
  NewsIcon, 
  PropertyNewIcon, 
  CheckmarkBadge02Icon, 
  RepairIcon, 
  UserGroup03Icon,
  Clock04Icon,
  ManagerIcon,
  Briefcase07Icon
} from '@hugeicons/core-free-icons';

const superadmin_nav_links = [
  {
    text: 'Notifications',
    icon: Notification02Icon,
    path: '/superadmin-dashboard',
    page: 'notifications'
  },
  {
    text: 'Verifications',
    icon: CheckmarkBadge02Icon,
    path: '/superadmin-dashboard/verifications',
    page: 'verifications'
  },
  {
    text: 'Pendings',
    icon: Clock04Icon,
    path: '/superadmin-dashboard/pendings',
    page: 'pendings'
  },
  {
    text: 'Manage Users',
    icon: UserGroup03Icon,
    path: '/superadmin-dashboard/manage-users',
    page: 'manage users'
  },
  {
    text: 'Manage Agents',
    icon: Briefcase07Icon,
    path: '/superadmin-dashboard/manage-agents',
    page: 'manage agents'
  },
  {
    text: 'Manage Admins',
    icon: ManagerIcon,
    path: '/superadmin-dashboard/manage-admins',
    page: 'manage admins'
  },
  {
    text: 'Inspections',
    icon: Calendar01Icon,
    path: '/superadmin-dashboard/inspections',
    page: 'inspections'
  },
  {
    text: 'Transactions',
    icon: AddInvoiceIcon,
    path: '/superadmin-dashboard/transactions',
    page: 'transactions'
  },
  {
    text: 'Apartments',
    icon: PlazaIcon,
    path: '/superadmin-dashboard/apartments',
    page: 'apartments'
  },
  {
    text: 'Create Blog',
    icon: QuillWrite02Icon,
    path: '/superadmin-dashboard/create-blog',
    page: 'create blog'
  },
  {
    text: 'Created Blogs',
    icon: FileIcon,
    path: '/superadmin-dashboard/created-blogs',
    page: 'created blogs'
  },
  {
    text: 'Newsletters',
    icon: NewsIcon,
    path: '/superadmin-dashboard/newsletters',
    page: 'newsletters'
  },
  {
    text: 'All Blogs',
    icon: PropertyNewIcon,
    path: '/superadmin-dashboard/all-blogs',
    page: 'all blogs'
  },
  {
    text: 'Settings',
    icon: Settings01Icon,
    path: '/superadmin-dashboard/settings',
    page: 'settings'
  },
  {
    text: 'App Settings',
    icon: RepairIcon,
    path: '/superadmin-dashboard/app-settings',
    page: 'app settings'
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
    icon: CheckmarkBadge02Icon,
    path: '/admin-dashboard/verifications',
    page: 'verifications'
  },
  {
    text: 'Inspections',
    icon: Calendar01Icon,
    path: '/admin-dashboard/inspections',
    page: 'inspections'
  },
  {
    text: 'Apartments',
    icon: PlazaIcon,
    path: '/admin-dashboard/apartments',
    page: 'apartments'
  },
  {
    text: 'Create Blog',
    icon: QuillWrite02Icon,
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
    text: 'Settings',
    icon: Settings01Icon,
    path: '/admin-dashboard/settings',
    page: 'settings'
  },
];

const creator_nav_links = [
  {
    text: 'Notifications',
    icon: Notification02Icon,
    path: '/creator-dashboard',
    page: 'notifications'
  },
  {
    text: 'Create Blog',
    icon: QuillWrite02Icon,
    path: '/creator-dashboard/create-blog',
    page: 'create blog'
  },
  {
    text: 'Created Blogs',
    icon: FileIcon,
    path: '/creator-dashboard/created-blogs',
    page: 'created blogs'
  },
  {
    text: 'Newsletters',
    icon: NewsIcon,
    path: '/creator-dashboard/newsletters',
    page: 'newsletters'
  },
  {
    text: 'All Blogs',
    icon: PropertyNewIcon,
    path: '/creator-dashboard/all-blogs',
    page: 'all blogs'
  },
  {
    text: 'Settings',
    icon: Settings01Icon,
    path: '/creator-dashboard/settings',
    page: 'settings'
  },
];

export { creator_nav_links, admin_nav_links, superadmin_nav_links };