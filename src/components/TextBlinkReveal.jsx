import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import SplitText from "gsap/SplitText";

export default function BlinkReveal({ children, flickerIndex, delay = 0 }) {
    const textRef = useRef(null);

    useGSAP(() => {
        const split = new SplitText(textRef.current, { type: "chars" });
        const tl = gsap.timeline({
            paused: true,
            scrollTrigger: {
                trigger: textRef.current,
                start: "top bottom",
                end: "bottom top",
                onEnter: () => tl.restart(),
                onEnterBack: () => tl.restart(),
            },
        });

        // Each letter flickers independently
        split.chars.forEach((char, i) => {
            const isFlickerChar = i === flickerIndex;
            const flickerCount = isFlickerChar ? 8 : gsap.utils.random(2, 4, 1);
            const startDelay = gsap.utils.random(0, 0.3);

            let cumulativeDelay = startDelay + delay;

            for (let j = 0; j < flickerCount; j++) {
                const interval = 0.08 + j * 0.025; // Increasing interval (slows down)

                tl.to(
                    char,
                    {
                        opacity: 0,
                        duration: 0.05,
                        ease: "steps(1)",
                    },
                    cumulativeDelay
                );

                tl.to(
                    char,
                    {
                        opacity: 1,
                        duration: 0.05,
                        ease: "steps(1)",
                    },
                    cumulativeDelay + 0.05
                );

                cumulativeDelay += interval;
            }
        });
    }, [flickerIndex, delay]);

    return <span ref={textRef}>{children}</span>;
}
