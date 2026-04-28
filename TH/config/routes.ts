import { layout } from "@/app";

export default [
	// Root redirect first
	{
		path: '/',
		redirect: '/auth/login',
		exact: true,
	},

	// Auth routes - Không cần đăng nhập
	{
		path: '/auth',
		layout: false,
		routes: [
			{
				path: '/auth/login',
				component: '@/pages/Signin/Login',
				exact: true,
			},
			{
				path: '/auth/register',
				component: '@/pages/Signin/Register',
				exact: true,
			},
			{
				path: '/auth',
				redirect: '/auth/login',
				exact: true,
			},
		],
	},

	// Admin routes
	{
		path: '/admin',
		component: '@/layouts/BasicLayout',
		wrappers: ['@/middleware/auth'],
		authority: ['admin'],
    layout: false,
		routes: [
			{
				path: '/admin/dashboard',
				component: '@/pages/Admin/DeviceManagement/index',
				exact: true,
			},
			{
				path: '/admin/devices',
				component: '@/pages/Admin/DeviceManagement/index',
				exact: true,
			},
			{
				path: '/admin/borrow-requests',
				component: '@/pages/Admin/BorrowRequests/Pending/index',
				exact: true,
			},
			{
				path: '/admin/borrow-history',
				component: '@/pages/Admin/BorrowRecords/index',
				exact: true,
			},
			{
				path: '/admin/statistics',
				component: '@/pages/Admin/DeviceManagement/index',
				exact: true,
			},
			{
				path: '/admin',
				redirect: '/admin/dashboard',
				exact: true,
			},
		],
	},

	// User routes
	{
		path: '/app',
		component: '@/layouts/BasicLayout',
		wrappers: ['@/middleware/auth'],
		authority: ['user'],
    layout: false,
		routes: [
			{
				path: '/app/dashboard',
				component: '@/pages/Userr/Home/index',
				exact: true,
			},
			{
				path: '/app/devices',
				component: '@/pages/Userr/Devices/index',
				exact: true,
			},
			{
				path: '/app/my-requests',
				component: '@/pages/Userr/MyRequests/index',
				exact: true,
			},
			{
				path: '/app/history',
				component: '@/pages/Userr/History/index',
				exact: true,
			},
			{
				path: '/app/profile',
				component: '@/pages/Userr/Profile/index',
				exact: true,
			},
			{
				path: '/app/statistics',
				component: '@/pages/Userr/Statistics/index',
				exact: true,
			},
			{
				path: '/app',
				redirect: '/app/dashboard',
				exact: true,
			},
		],
	},

	// Legacy redirects
	{
		path: '/dashboard',
		redirect: '/app/dashboard',
		exact: true,
	},
	{
		path: '/devices',
		redirect: '/app/devices',
		exact: true,
	},
	{
		path: '/my-requests',
		redirect: '/app/my-requests',
		exact: true,
	},
	{
		path: '/history',
		redirect: '/app/history',
		exact: true,
	},
	{
		path: '/profile',
		redirect: '/app/profile',
		exact: true,
	},
	{
		path: '/statistics',
		redirect: '/app/statistics',
		exact: true,
	},
	{
		path: '/user/login',
		redirect: '/auth/login',
		exact: true,
	},
	{
		path: '/user/register',
		redirect: '/auth/register',
		exact: true,
	},

	// Error pages
	{
		path: '/403',
		component: '@/pages/exception/403',
		layout: false,
		exact: true,
	},
	{
		path: '/404',
		component: '@/pages/exception/404',
		layout: false,
		exact: true,
	},
	{
		path: '/500',
		component: '@/pages/exception/500',
		layout: false,
		exact: true,
	},
	{
		path: '/hold-on',
		component: '@/pages/exception/DangCapNhat',
		layout: false,
		exact: true,
	},

	// 404 fallback
	{
		component: '@/pages/exception/404',
	},
];
