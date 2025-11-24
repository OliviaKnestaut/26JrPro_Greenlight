import type React from 'react';
import { Layout } from 'antd';
import { Header } from '../../molecules/header/index';
import { Navigation } from '../../molecules/navigation/index';
import { Footer } from '../../molecules/footer/index';
import styles from './index.module.css';

export interface AppLayoutProps {
	isAuthenticated: boolean;
	onLogin?: () => void;
	onLogout?: () => void;
	onSignUp?: () => void;
	onCreateListing?: () => void;
	onNavigate?: (route: string) => void;
	selectedKey?: string;
	children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
	isAuthenticated,
	onLogin,
	onLogout,
	onSignUp,
	onNavigate,
	selectedKey,
	children,
}) => {
	return (
		<Layout className={styles.appLayout}>
			<Header
				isAuthenticated={isAuthenticated}
			/>
			<div className={styles.bodyWrapper}>
				<Navigation
					isAuthenticated={isAuthenticated}
					onLogout={
						onLogout ??
						(() => {
							/* intentionally empty for layout */
						})
					}
					onNavigate={
						onNavigate ??
						(() => {
							/* intentionally empty for layout */
						})
					}
					selectedKey={selectedKey ?? ''}
				/>
				<main className={styles.content}>{children}</main>
			</div>
			<Footer />
		</Layout>
	);
};