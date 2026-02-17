import React from 'react';
import styles from './index.module.css';
import { Anchor } from 'antd';

export type NavMiniProps = {
    links?: NavMiniLink[];
};

export type NavMiniLink = {
    title: React.ReactNode;
    ref: React.RefObject<HTMLElement>;
};

const defaultLinks: NavMiniLink[] = [];

const NavMini: React.FC<NavMiniProps> = ({ links }) => {
    const slice = (links && links.length ? links : defaultLinks).slice(0, 4);
    
    const items = slice.map((link, i) => ({
        key: `link-${i}`,
        href: `#link-${i}`,
        title: link.title,
    }));

    const handleAnchorClick = (e: React.MouseEvent, link: NavMiniLink) => {
        e.preventDefault();
        if (link.ref?.current) {
            link.ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    return (
        <div className={styles.wrapper}>
            <Anchor 
                affix={false} 
                items={items.map((item, i) => ({
                    ...item,
                    onClick: (e: React.MouseEvent) => handleAnchorClick(e, slice[i]),
                }))}
                offsetTop={60}
            />
        </div>
    );
};

export default NavMini;
