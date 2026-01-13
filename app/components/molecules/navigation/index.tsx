import type React from 'react';
import { useEffect, useState } from 'react';
import { Layout, Menu, Button, Drawer, ConfigProvider, Avatar } from 'antd';
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
	HomeOutlined,
	UserOutlined,
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
	{ key: 'dashboard', icon: <HomeOutlined />, label: 'Dashboard' },
	{ key: 'event-submissions', icon: <CalendarOutlined />, label: 'Event Submissions' },
	{ key: 'purchase-requests', icon: <DollarOutlined />, label: 'Purchase Requests' },
	{ key: 'budget', icon: <LineChartOutlined />, label: 'Budget' },
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
	{ key: 'calendar', icon: <CalendarOutlined />, label: 'Calendar' },
	{ key: 'org-members', icon: <UserOutlined />, label: 'Org Members' },

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
		<ConfigProvider
            theme={{
                "components": {
                    "Menu": {
					"colorBgContainer": "var(--primary)",
					"colorFillAlter": "var(--primary)",
					"colorText": "var(--background-2)",
					"itemHoverBg": "var(--primary-active)",
					"itemActiveBg": "var(--primary-disabled)",
					"colorBgElevated": "var(--primary)",
					},
					"Button": {
						"colorText": "var(--background-2)",
					}
                }
            }}
        >
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
					width={208}
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
					<div className={styles.userSection}>
						<Avatar size="large" icon={<UserOutlined />} />
						<div>
							<span className={styles.userName}>Serati Ma</span>
						</div>
						<Button
							className={styles.logout}
							icon={<LogoutOutlined />}
							type="link"
							onClick={onLogout}>
						</Button>
					</div>
				</Sider>
			)}
			{/* Mobile Drawer */}
			{isAuthenticated && (
				<Drawer
					placement="left"
					open={mobileOpen}
					onClose={() => setMobileOpen(false)}
					width={208}
					style={{ top: 68, zIndex: 1000 }}
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
						type="text"
						onClick={onLogout}
						style={{ width: '100%', marginTop: 24 }}
					>
						Log Out
					</Button>
				</Drawer>
			)}
		</ConfigProvider>
	);
};