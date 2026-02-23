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
                items={slice.map((link, i) => {
                    const anchorId = `section-${i}`;
                    return {
                        key: anchorId,
                        href: `#${anchorId}`,
                        title: <a onClick={(e) => handleAnchorClick(e as any, link)}>{link.title}</a>,
                    };
                })}
                offsetTop={60}
            />
        </div>
    );
};

export default NavMini;
