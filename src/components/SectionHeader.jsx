import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import TextBlinkReveal from "./TextBlinkReveal";

export default function SectionHeader({ children, props }) {
    const headerRef = useRef(null);

    useGSAP(
        () => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    onEnter: () => tl.restart(),
                    onEnterBack: () => tl.restart(),
                },
            });

            // Top border - expands from left to right
            tl.from(headerRef.current, {
                height: 0,
                opacity: 0,
                delay: 0.5,
                duration: 0.5,
                ease: "back.inOut",
            });
        },
        { scope: headerRef }
    );

    return (
        <div ref={headerRef} className="sectionHeader" {...props}>
            <TextBlinkReveal flickerIndex={100} delay={0.5}>
                {children}
            </TextBlinkReveal>
        </div>
    );
}
