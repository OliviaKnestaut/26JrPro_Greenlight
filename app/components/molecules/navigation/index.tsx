import type React from 'react';
import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import {
	LineChartOutlined,
	DollarOutlined,
	CalendarOutlined,
	FolderOutlined,
	BulbOutlined,
	LogoutOutlined,
	MenuOutlined,
	CloseOutlined,
} from '@ant-design/icons';
import styles from './index.module.css';
import { useMatch } from 'react-router';

export interface NavigationProps {
	isAuthenticated: boolean;
	onLogout?: () => void;
	onNavigate?: (route: string) => void;
	selectedKey?: string;
	customNavItems?: MenuProps['items'];
}

const { Sider } = Layout;

const defaultNavItems: MenuProps['items'] = [
	{ key: 'dashboard', icon: <LineChartOutlined />, label: 'Dashboard' },
	{ key: 'events', icon: <CalendarOutlined />, label: 'Events' },
	{ key: 'budget', icon: <DollarOutlined />, label: 'Budget' },
	{
		key: 'brainstorm',
		icon: <BulbOutlined />,
		label: 'Brainstorm',
		children: [
			{ key: 'docs-overview', label: 'Docs' },
			{ key: 'sheets-overview', label: 'Sheets' },
		],
	},
	{ key: 'resources', icon: <FolderOutlined />, label: 'Resources' },
];

export const Navigation: React.FC<NavigationProps> = ({
	isAuthenticated,
	onLogout,
	onNavigate,
	selectedKey,
	customNavItems,
}) => {
	const [collapsed, setCollapsed] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [openKeys, setOpenKeys] = useState<string[]>([]);
	const accountPath = useMatch('/account/*');

	useEffect(() => {
		if (accountPath) {
			setOpenKeys(['account']);
		}
	}, [accountPath]);

	const navItems = customNavItems || defaultNavItems;

	const handleMenuClick: React.ComponentProps<typeof Menu>['onClick'] = (e) => {
		// Use keyPath for nested menu items
		const { key } = e;
		setOpenKeys(e.keyPath);
		if (onNavigate) {
			onNavigate(key);
		}
		setMobileOpen(false);
	};

	const onMenuOpenChange = (keys: string[]) => {
		setOpenKeys(keys);
	};

	// Responsive: show Drawer on mobile, Sider on desktop
	return (
		<>
			{/* Hamburger for mobile (top right) - only if authenticated */}
			{isAuthenticated && (
				<div className={styles.hamburgerContainer} style={{ zIndex: 1050 }}>
					<Button
						className={styles.hamburger ?? ''}
						icon={mobileOpen ? <CloseOutlined /> : <MenuOutlined />}
						onClick={() => setMobileOpen(!mobileOpen)}
						type="text"
						aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
					/>
				</div>
			)}
			{/* Desktop Sider */}
			{isAuthenticated && (
				<Sider
					className={styles.sidebar ?? ''}
					breakpoint="md"
					collapsedWidth="0"
					width={260}
					trigger={null}
					collapsible
					collapsed={collapsed}
					onCollapse={setCollapsed}
					style={{ position: 'fixed', left: 0, top: 68, zIndex: 1000 }}
				>
					<Menu
						mode="inline"
						items={navItems}
						onClick={handleMenuClick}
						style={{ border: 'none', flex: 1 }}
						selectedKeys={[selectedKey || 'home']}
						openKeys={openKeys}
						onOpenChange={onMenuOpenChange}
					/>
					<Button
						className={styles.logoutDesktop ?? ''}
						icon={<LogoutOutlined />}
						type="link"
						onClick={onLogout}
						style={{ width: '100%', marginTop: 24 }}
					>
						Log Out
					</Button>
				</Sider>
			)}
			{/* Mobile Drawer */}
			{isAuthenticated && (
				<Drawer
					placement="left"
					open={mobileOpen}
					onClose={() => setMobileOpen(false)}
					width={260}
					className={styles.mobileDrawer ?? ''}
				>
					<Menu
						mode="inline"
						items={navItems}
						onClick={handleMenuClick}
						style={{ border: 'none', flex: 1 }}
						selectedKeys={[selectedKey || 'home']}
					/>
					<Button
						className={styles.logoutMobile ?? ''}
						icon={<LogoutOutlined />}
						type="link"
						onClick={onLogout}
						style={{ width: '100%', marginTop: 24 }}
					>
						Log Out
					</Button>
				</Drawer>
			)}
		</>
	);
};