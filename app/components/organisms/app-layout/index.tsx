import React, { useEffect, useLayoutEffect } from 'react';
import { Layout } from 'antd';
import { useLocation } from 'react-router';
import { Header } from '../../molecules/header/index';
import { Navigation } from '../../molecules/navigation/index';
import { Footer } from '../../molecules/footer';
import styles from './index.module.css';

export interface AppLayoutProps {
	isAuthenticated: boolean;
	user?: any;
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
	user,
	onLogin,
	onLogout,
	onSignUp,
	onNavigate,
	selectedKey,
	children,
}) => {
	const location = useLocation();

	// Disable browser's native scroll restoration so it doesn't override our position
	useEffect(() => {
		if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
	}, []);

	// useLayoutEffect fires before paint — reset scroll synchronously on every route change
	useLayoutEffect(() => {
		window.scrollTo({ top: 0, left: 0 });
		document.documentElement.scrollTop = 0;
		document.body.scrollTop = 0;
		const main = document.querySelector('main');
		if (main) main.scrollTop = 0;
	}, [location.pathname]);
	return (
		<Layout className={styles.appLayout}>
			<Header
				isAuthenticated={isAuthenticated}
				user={user}
			/>
			<Navigation
				isAuthenticated={isAuthenticated}
				user={user}
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
			<main className={styles.content}>
				<div className="container m-6 w-auto" style={{ minHeight: 'calc(100% - 78px)' }}>
					{children}
				</div>
				<Footer />
			</main>
		</Layout>
	);
};