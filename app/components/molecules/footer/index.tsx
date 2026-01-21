
import type React from 'react';
import { Layout, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import styles from './index.module.css';

export interface FooterProps {
}

export const Footer: React.FC<FooterProps> = ({

}) => {
	return (
		<Layout.Footer className={styles.footer}/>
	);
};
