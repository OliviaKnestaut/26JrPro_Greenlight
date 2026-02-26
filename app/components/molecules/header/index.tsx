import type React from 'react';
import { Layout, Button, Grid } from 'antd';
import styles from './index.module.css';
import logoIcon from '../../assets/GreenlightLogo.svg';
import { useNavigate } from 'react-router';

export interface HeaderProps {
	isAuthenticated?: boolean;
	user?: any;
}

const { Header: AntHeader } = Layout;

export const Header: React.FC<HeaderProps> = ({
	isAuthenticated = true,
	user,
}) => {
    const noop = () => undefined;
	const navigate = useNavigate();
	const screens = Grid.useBreakpoint();

	return (
		<AntHeader className={styles.header}>
			<div
				className={styles.logoSection}
				role="button"
				tabIndex={0}
				onClick={() => navigate('/')}
				onKeyDown={(e) => {
					if (e.key === 'Enter' || e.key === ' ') navigate('/');
				}}
				style={{ cursor: 'pointer' }}
			>
				<img src={logoIcon} alt="Greenlight Logo" className={styles.logo} />
				<div>
					<span className={styles.logoText}>GreenLight</span>
					<span className={styles.orgName}>{user?.organization?.orgName ? String(user.organization.orgName).toUpperCase() : ''}</span>
				</div>
			</div>
			<div className={`${styles.userSection} px-8`}>
				<Button type={screens.lg ? 'primary' : 'default'} className={styles.btn} onClick={() => navigate('/event-form')}>
					New Event
				</Button>
			</div>
		</AntHeader>
	);
};