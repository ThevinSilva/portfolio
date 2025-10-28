import { useRef, useLayoutEffect, useEffect } from "react";
import gsap from "gsap";
import SplitText from "gsap/SplitText";

// If not already:
gsap.registerPlugin(SplitText);

export default function TextShuffleAnimation({ children, stagger = -0.04, duration = 0.3, ease = "power1.inOut", play = false, disableHover = false }) {
    const rootRef = useRef(null);
    const tweenRef = useRef(null);
    const splitRef = useRef(null);

    const handleEnter = () => tweenRef.current && tweenRef.current.play(0);
    const handleLeave = () => tweenRef.current && tweenRef.current.reverse();

    useLayoutEffect(() => {
        if (!rootRef.current) return;

        // 1) Split after the element exists
        const split = new SplitText(rootRef.current, {
            type: "chars",
            mask: "chars",
            // autoSplit is true by default when type is provided
        });
        splitRef.current = split;

        // 2) Measure font size from a char (fallback to container)
        const probe = split.chars[0] || rootRef.current;
        const size = parseFloat(getComputedStyle(probe).fontSize) || 16;

        // 3) Apply text-shadow to each char (parent won't affect them)
        split.chars.forEach((el) => {
            el.style.textShadow = `0px ${size + 15}px 0px #ffffff`;
        });

        // 4) Build a paused tween so you can control it on hover
        tweenRef.current = gsap.to(split.chars, {
            duration,
            y: -(size + 15),
            stagger,
            ease,
            paused: true,
        });

        // 5) Cleanup on unmount / prop change
        return () => {
            tweenRef.current && tweenRef.current.kill();
            split.revert(); // put the DOM back the way it was
        };
    }, [stagger, duration, ease]);

    useEffect(() => {
        if (play) handleEnter();
        else handleLeave();
    }, [play]);

    return (
        <span ref={rootRef} onMouseEnter={disableHover && handleEnter} onMouseLeave={disableHover && handleLeave}>
            {children}
        </span>
    );
}
