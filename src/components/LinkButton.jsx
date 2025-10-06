import BorderAnimatedBox from "./BorderAnimation";
import TextPopInAnimation from "./TextPopInAnimation";
import TextBlinkReveal from "./TextBlinkReveal";

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

export default function LinkButton({ children, style, borders }) {
    const arrowRef = useRef(null);
    const arrowTweenRef = useRef(null);
    const underlineTweenRef = useRef(null);
    const underlineRef = useRef(null);

    const handleEnter = () => {
        arrowTweenRef.current && arrowTweenRef.current.play();
        underlineTweenRef.current && underlineTweenRef.current.play();
    };

    const handleLeave = () => {
        arrowTweenRef.current && arrowTweenRef.current.reverse();
        underlineTweenRef.current && underlineTweenRef.current.reverse();
    };

    useGSAP(() => {
        if (!arrowRef.current) return;

        arrowRef.current.style.textShadow = `0px calc(3rem + 8px) 0px #ffffff`;

        arrowTweenRef.current = gsap
            .timeline({
                paused: true,
                scrollTrigger: {
                    trigger: arrowRef.current,
                    start: "top bottom",
                    end: "bottom top",
                    onEnter: () => arrowTweenRef.current.play(),
                    onEnterBack: () => arrowTweenRef.current.restart(),
                },
            })
            .to(arrowRef.current, {
                duration: 0.4,
                y: -42,
                x: 42,
                ease: "power2.inOut",
            });

        underlineTweenRef.current = gsap.timeline({ paused: true }).fromTo(
            underlineRef.current,
            {
                width: "0%",
                left: "0%",
            },
            {
                width: "100%",
                duration: 0.3,
                ease: "power2.out",
            }
        );
    });

    return (
        <BorderAnimatedBox className="linkButton" style={style} onMouseEnter={handleEnter} onMouseLeave={handleLeave} borders={borders}>
            <div style={{ marginLeft: "2rem", position: "relative" }}>
                <TextPopInAnimation delay={0.4} ease={"power4.out"} duration={1}>
                    {children}
                </TextPopInAnimation>
                <div
                    ref={underlineRef}
                    style={{
                        position: "absolute",
                        display: "block",
                        bottom: 0,
                        left: 0,
                        width: 0,
                        height: "1px",
                        backgroundColor: "#ffffff",
                    }}
                />
            </div>
            <div className="hn-arrow-container">
                <div className="hn hn-arrow-up" ref={arrowRef}></div>
            </div>
        </BorderAnimatedBox>
    );
}
