import React from 'react';
import styles from './index.module.css';
import { Anchor } from 'antd';

export type NavMiniProps = {
    links?: NavMiniLink[];
};

export type NavMiniLink = {
    href: string;
    title: React.ReactNode;
};

const defaultLinks: NavMiniLink[] = [
    { href: '#event-details', title: 'Event Details' },
    { href: '#date-location', title: 'Date & Location' },
    { href: '#event-elements', title: 'Event Elements' },
    { href: '#budget-purchase', title: 'Budget & Purchase' },
];

const NavMini: React.FC<NavMiniProps> = ({ links }) => {
    const slice = (links && links.length ? links : defaultLinks).slice(0, 4);
    const items = slice.map((l, i) => ({ key: l.href ?? `link-${i}`, href: l.href, title: l.title }));

    return (
        <div className={styles.wrapper}>
            <Anchor affix={false} items={items} />
        </div>
    );
};

export default NavMini;
