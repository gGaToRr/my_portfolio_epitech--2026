import React from 'react';
import useInView from '../../hooks/useInView';
import './ScrollReveal.css';

function ScrollReveal({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 600,
    threshold = 0.12,
    rootMargin = '0px 0px -40px 0px',
    once = true,
    className = '',
    as: Component = 'div',
    style = {},
    ...restProps
}) {
    const [ref, inView] = useInView({ threshold, rootMargin, once });

    const combinedStyle = {
        ...style,
        '--reveal-delay': `${delay}ms`,
        '--reveal-duration': `${duration}ms`,
    };

    const classes = [
        'scroll-reveal',
        `scroll-reveal--${animation}`,
        inView ? 'is-revealed' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <Component
            ref={ref}
            className={classes}
            style={combinedStyle}
            {...restProps}
        >
            {children}
        </Component>
    );
}

export default ScrollReveal;
