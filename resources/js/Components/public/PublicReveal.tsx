import clsx from 'clsx';
import { createElement, useEffect, useRef, useState, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';

type PublicRevealElement = keyof HTMLElementTagNameMap;

interface PublicRevealProps extends HTMLAttributes<HTMLElement> {
    as?: PublicRevealElement;
    children: ReactNode;
    delay?: number;
    disabled?: boolean;
}

export default function PublicReveal({
    as = 'div',
    children,
    className,
    delay = 0,
    disabled = false,
    style,
    ...props
}: PublicRevealProps) {
    const ref = useRef<HTMLElement | null>(null);
    const [visible, setVisible] = useState(disabled);

    useEffect(() => {
        if (disabled) {
            setVisible(true);
            return;
        }

        if (typeof window === 'undefined') {
            setVisible(true);
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setVisible(true);
            return;
        }

        const element = ref.current;

        if (!element || typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry?.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: '0px 0px -10% 0px',
                threshold: 0.12,
            },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [disabled]);

    return createElement(
        as,
        {
            ...props,
            ref,
            className: clsx('public-reveal', visible && 'is-visible', className),
            style: {
                ...style,
                '--public-reveal-delay': `${delay}ms`,
            } as CSSProperties,
        },
        children,
    );
}
