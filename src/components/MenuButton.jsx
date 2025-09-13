import { useGSAP } from "@gsap/react";
import TextShuffleAnimation from "./TextShuffleAnimation";
import { useRef, useState } from "react";
import gsap from "gsap";

export default function MenuButton({ text }) {
    const rootRef = useRef(null);
    const leftBracketRef = useRef(null);
    const rightBracketRef = useRef(null);
    const tweenRef = useRef(null);
    const [play, setPlay] = useState(false);

    useGSAP(
        () => {
            const tl = gsap.timeline({ paused: true });

            // Animate both brackets outward simultaneously
            tl.to(leftBracketRef.current, { x: -16, duration: 0.3 }, 0).to(rightBracketRef.current, { x: 16, duration: 0.3 }, 0);

            tweenRef.current = tl;
        },
        { scope: [leftBracketRef, rightBracketRef] }
    );

    const handleEnter = () => {
        tweenRef.current?.play();
        setPlay(true);
    };
    const handleLeave = () => {
        tweenRef.current?.reverse();
        setPlay(false);
    };

    return (
        <button ref={rootRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
            <span style={{ display: "inline-block" }} ref={leftBracketRef}>
                [
            </span>
            <TextShuffleAnimation play={play} disableHover={true}>
                {text}
            </TextShuffleAnimation>
            <div style={{ display: "inline-block" }} ref={rightBracketRef}>
                ]
            </div>
        </button>
    );
}
