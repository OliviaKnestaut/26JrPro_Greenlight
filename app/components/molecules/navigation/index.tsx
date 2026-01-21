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
import { useMatch, useNavigate, useLocation, Link } from 'react-router';

export interface NavigationProps {
	isAuthenticated: boolean;
	user?: any;
	onLogout?: () => void;
	onNavigate?: (route: string) => void;
	selectedKey?: string;
	customNavItems?: MenuProps['items'];
}

const { Sider } = Layout;

const defaultNavItems: MenuProps['items'] = [
	{ key: 'dashboard', icon: <HomeOutlined />, label: <Link to="/">Dashboard</Link> },
	{ key: 'event-submissions', icon: <CalendarOutlined />, label: <Link to="/event-submissions">Event Submissions</Link> },
	{ key: 'purchase-requests', icon: <DollarOutlined />, label: <Link to="/purchase-requests">Purchase Requests</Link> },
	{ key: 'budget', icon: <LineChartOutlined />, label: <Link to="/budget">Budget</Link> },
	{
		key: 'brainstorm',
		icon: <BulbOutlined />,
		label: 'Brainstorm',
		children: [
			{ key: 'docs-overview', label: 'Docs' },
			{ key: 'sheets-overview', label: 'Sheets' },
		],
	},
	{ key: 'resources', icon: <FolderOutlined />, label: <Link to="/resources">Resources</Link> },
	{ key: 'calendar', icon: <CalendarOutlined />, label: <Link to="/calendar">Calendar</Link> },
	{ key: 'org-members', icon: <UserOutlined />, label: <Link to="/org-members">Org Members</Link> },

];

export const Navigation: React.FC<NavigationProps> = ({
	isAuthenticated,
	user,
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

	// router hooks (call at top-level of component)
	const navigate = useNavigate();
	const location = useLocation();

	const handleMenuClick: React.ComponentProps<typeof Menu>['onClick'] = (e) => {
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
					"itemSelectedBg": "var(--primary-active)",
					"itemActiveBg": "var(--primary-disabled)",
					"itemColor": "var(--background-2)",
					"itemSelectedColor": "var(--background-2)",
					"colorBgElevated": "var(--primary)",
					"itemBorderRadius": 0,
					"itemMarginInline": 0,
					"itemMarginBlock": 0,
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
					style={{ position: 'fixed', left: 0, top: 64, zIndex: 1000 }}
				>
					<Menu
						mode="inline"
						items={navItems}
						onClick={handleMenuClick}
						style={{ border: 'none', flex: 1 }}
						selectedKeys={[selectedKey || (location.pathname === '/' ? 'dashboard' : location.pathname.replace(/^\//, '').split('/')[0]) ]}
						openKeys={openKeys}
						onOpenChange={onMenuOpenChange}
					/>
					<div className={styles.userSection}>
						{(() => {
							const src = user?.profileImg;
							if (!src) return <Avatar icon={<UserOutlined />} />;
							const base = (import.meta as any).env?.BASE_URL ?? '/';
							const normalizedBase = base.endsWith('/') ? base : `${base}/`;
							const profilePath = `${normalizedBase}public/uploads/profile_img/${src}`.replace(/\\/g, '/');
							return <Avatar className={styles.avatar} src={profilePath} />;
						})()}

						<div>
							<span className={styles.userName}>{user?.firstName} {user?.lastName ? user.lastName.charAt(0) + '.' : ''}</span>
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
						selectedKeys={[selectedKey || (location.pathname === '/' ? 'dashboard' : location.pathname.replace(/^\//, '').split('/')[0]) ]}
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