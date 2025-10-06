import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

export default function Blink({ children, repeat = 8, duration = 0.1, delay = 1 }) {
    const textRef = useRef(null);

    useGSAP(() => {
        gsap.fromTo(
            textRef.current,
            { opacity: 0 },
            {
                opacity: 1,
                duration,
                ease: "steps(1)",
                yoyo: true,
                delay,
                repeat,
                scrollTrigger: {
                    trigger: textRef.current,
                    start: "top bottom",
                    end: "bottom top",
                },
            }
        );
    }, []);

    return <span ref={textRef}>{children}</span>;
}
