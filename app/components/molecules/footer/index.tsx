
import type React from 'react';
import { Layout } from 'antd';
import { FacebookFilled, TwitterSquareFilled } from '@ant-design/icons';
import styles from './index.module.css';

export interface FooterProps {
	onFacebookClick?: () => void;
	onTwitterClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
	onFacebookClick,
	onTwitterClick,
}) => {
	return (
		<Layout.Footer className={styles.footer} />
	);
};
