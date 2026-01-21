import type React from 'react';
import { Layout, Button } from 'antd';
import styles from './index.module.css';
import logoIcon from '../../assets/GreenlightLogo.svg';

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
	return (
		<AntHeader className={styles.header}>
			<div className={styles.logoSection}>
				<img src={logoIcon} alt="Greenlight Logo" className={styles.logo} />
				<div>
					<span className={styles.logoText}>Greenlight</span>
					<span className={styles.orgName}>{user?.organization?.orgName ? String(user.organization.orgName).toUpperCase() : ''}</span>
				</div>
			</div>
			<div className={`${styles.userSection} px-8`}>
				<Button type="primary" className={styles.btn}>
                	New Event
            	</Button>
			</div>
		</AntHeader>
	);
};