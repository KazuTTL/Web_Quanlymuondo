// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import routes from './routes';
import proxy from './proxy';
// const { REACT_APP_ENV } = process.env;

export default defineConfig({
	hash: true,
	antd: {},
	dva: {
		hmr: false,
		immer: true,
	},
	layout: {
		// https://umijs.org/zh-CN/plugins/plugin-layout
		locale: true,
		...defaultSettings,
		title: 'Hệ thống mượn thiết bị',
		logo: '/logo.png',
	},
	// https://umijs.org/zh-CN/plugins/plugin-locale
	locale: {
		// enable: true,
		default: 'vi-VN',
		antd: true,
		// default true, when it is true, will use `navigator.language` overwrite default
		baseNavigator: false,
		// baseSeparator: '_',
	},
	dynamicImport: {
		loading: '@/components/PageLoading',
	},
	targets: {
		ie: 11,
	},
	routes: [
		{
			path: '/user',
			layout: false, // Tắt layout mặc định của UmiJS
			routes: [
				{
					path: '/user/auth/login',
					component: '@/pages/user/Login',
				},
				{
					path: '/user/auth/register',
					component: '@/pages/user/Register',
				},
				// {
				// 	path: '/user',
				// 	redirect: '/user/login',
				// },
			],
		},
		...routes,
	],
	// Theme for antd: https://ant.design/docs/react/customize-theme-cn
	theme: {
		'primary-color': '#1890ff',
		'border-radius-base': '2px',
	},
	// esbuild is father build tools
	// https://umijs.org/plugins/plugin-esbuild
	esbuild: {},
	title: false,
	ignoreMomentLocale: true,
	// proxy: proxy[REACT_APP_ENV || 'dev'],
	manifest: {
		basePath: '/',
	},
	// Fast Refresh 热更新
	fastRefresh: {},

	nodeModulesTransform: {
		type: 'none',
	},
	// mfsu: {},
	webpack5: {},
	exportStatic: {},
	define: Object.entries(process.env).reduce((result, [key, value]) => {
		if (key.startsWith('APP_CONFIG_')) {
			return {
				...result,
				[key]: value,
			};
		}
		return result;
	}, {}),
});
