import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { UpOutlined } from '@ant-design/icons';

export function ScrollToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const mainContent = document.querySelector('main');
            if (mainContent) {
                setIsVisible(mainContent.scrollTop > 300);
            }
        };

        const mainContent = document.querySelector('main');
        if (mainContent) {
            mainContent.addEventListener('scroll', handleScroll);
            handleScroll(); // Check on mount
        }

        return () => {
            if (mainContent) {
                mainContent.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    const scrollToTop = () => {
        const mainContent = document.querySelector('main');
        if (!mainContent) return;
        
        const duration = 400;
        const start = mainContent.scrollTop;
        const startTime = performance.now();
        
        const animateScroll = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const scrollTo = start * (1 - easeOutCubic);
            
            mainContent.scrollTop = scrollTo;
            
            if (progress < 1) {
                requestAnimationFrame(animateScroll);
            }
        };
        
        requestAnimationFrame(animateScroll);
    };

    if (!isVisible) return null;

    return (
        <Button
            type="primary"
            shape="circle"
            icon={<UpOutlined />}
            onClick={scrollToTop}
            style={{
                position: 'fixed',
                bottom: '2rem',
                right: '2rem',
                zIndex: 9999,
                width: '48px',
                height: '48px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                backgroundColor: '#045966',
            }}
            aria-label="Scroll to top"
        />
    );
}

export default ScrollToTop;
