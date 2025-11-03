import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const BorderAnimatedBox = ({ children, className = "", style = {}, borders = { top: true, right: true, bottom: true, left: true }, delay = 0, ...props }) => {
    const boxRef = useRef(null);
    const topRef = useRef(null);
    const rightRef = useRef(null);
    const bottomRef = useRef(null);
    const leftRef = useRef(null);

    useEffect(() => {
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: boxRef.current,
                start: "top bottom",
                end: "bottom top",
                onEnter: () => tl.restart(),
                onEnterBack: () => tl.restart(),
            },
        });

        // Top border - expands from left to right
        if (borders.top && topRef.current) {
            tl.fromTo(
                topRef.current,
                { width: "0%" },
                {
                    width: "100%",
                    duration: 0.25,
                    ease: "power2.out",
                },
                delay
            );
        }

        // Right border - expands from top to bottom
        if (borders.right && rightRef.current) {
            tl.fromTo(
                rightRef.current,
                { height: "0%" },
                {
                    height: "100%",
                    duration: 0.25,
                    ease: "power2.out",
                },
                0.25 + delay
            );
        }

        // Bottom border - expands from right to left
        if (borders.bottom && bottomRef.current) {
            tl.fromTo(
                bottomRef.current,
                { width: "0%" },
                {
                    width: "100%",
                    duration: 0.25,
                    ease: "power2.out",
                },
                0.5 + delay
            );
        }

        // Left border - expands from bottom to top
        if (borders.left && leftRef.current) {
            tl.fromTo(
                leftRef.current,
                { height: "0%" },
                {
                    height: "100%",
                    duration: 0.25,
                    ease: "power2.out",
                },
                0.75 + delay
            );
        }

        return () => {
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
        };
    }, [borders.top, borders.right, borders.bottom, borders.left, delay]);

    const borderStyle = {
        position: "absolute",
        backgroundColor: "#FFFFFF33",
        pointerEvents: "none",
    };

    return (
        <div
            ref={boxRef}
            className={className}
            style={{
                position: "relative",
                ...style,
            }}
            {...props}
        >
            {/* Top border */}
            {borders.top && (
                <div
                    ref={topRef}
                    style={{
                        ...borderStyle,
                        top: 0,
                        left: 0,
                        width: "0%",
                        height: "2px",
                    }}
                />
            )}

            {/* Right border */}
            {borders.right && (
                <div
                    ref={rightRef}
                    style={{
                        ...borderStyle,
                        top: 0,
                        right: 0,
                        width: "2px",
                        height: "0%",
                    }}
                />
            )}

            {/* Bottom border */}
            {borders.bottom && (
                <div
                    ref={bottomRef}
                    style={{
                        ...borderStyle,
                        bottom: 0,
                        right: 0,
                        width: "0%",
                        height: "2px",
                    }}
                />
            )}

            {/* Left border */}
            {borders.left && (
                <div
                    ref={leftRef}
                    style={{
                        ...borderStyle,
                        bottom: 0,
                        left: 0,
                        width: "2px",
                        height: "0%",
                    }}
                />
            )}

            {children}
        </div>
    );
};

export default BorderAnimatedBox;
