import React, { useEffect, useRef, useState } from 'react';
import { Skeleton } from 'antd';
import styles from './index.module.css';

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
    placeholder?: 'skeleton' | 'blur' | 'grey';
    aspectRatio?: number; // width / height
};

const OptimizedImage: React.FC<Props> = ({ src, alt, className, style, placeholder = 'skeleton', aspectRatio, ...rest }) => {
    const imgRef = useRef<HTMLImageElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [inView, setInView] = useState<boolean>(false);
    const [loaded, setLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (!containerRef.current) return;
        if (typeof IntersectionObserver === 'undefined') {
            setInView(true);
            return;
        }
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) setInView(true); });
        }, { rootMargin: '200px' });
        obs.observe(containerRef.current);
        return () => obs.disconnect();
    }, []);

    const wrapperStyle: React.CSSProperties = {
        position: 'relative',
        overflow: 'hidden',
        display: 'block',
        ...(aspectRatio ? { aspectRatio: `${aspectRatio}` } : {}),
        ...style as any,
    };

    return (
        <div ref={containerRef} className={[styles.wrapper, className].filter(Boolean).join(' ')} style={wrapperStyle}>
            {!loaded && placeholder === 'skeleton' && (
                <div className={styles.placeholder}><Skeleton.Image active /></div>
            )}
            {!loaded && placeholder === 'grey' && (
                <div className={styles.placeholder} />
            )}
            {inView && (
                <img
                    ref={imgRef}
                    src={src}
                    alt={alt}
                    onLoad={() => setLoaded(true)}
                    loading="lazy"
                    decoding="async"
                    className={`${styles.img} ${loaded ? styles.loaded : styles.loading}`}
                    {...rest}
                />
            )}
        </div>
    );
};

export default OptimizedImage;
