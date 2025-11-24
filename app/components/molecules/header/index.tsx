import type React from 'react';
import { Layout, Button } from 'antd';
import styles from './index.module.css';
import logoIcon from '../../assets/GreenlightTemp.png';

export interface HeaderProps {
	isAuthenticated?: boolean;
}

const { Header: AntHeader } = Layout;

export const Header: React.FC<HeaderProps> = ({
	isAuthenticated = true,
}) => {
    const noop = () => undefined;
	return (
		<AntHeader className={styles.header}>
			<div className={styles.logoSection}>
				<img src={logoIcon} alt="Sharethrift Logo" className={styles.logo} />
				<div>
					<span className={styles.logoText}>Greenlight</span>
					<span className={styles.orgName}>DU WOMEN IN BUSINESS</span>
				</div>
			</div>
		</AntHeader>
	);
};