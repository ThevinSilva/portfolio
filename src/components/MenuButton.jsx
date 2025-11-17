import { useGSAP } from "@gsap/react";
import TextShuffleAnimation from "./TextShuffleAnimation";
import { useRef, useState } from "react";
import gsap from "gsap";

export default function MenuButton({ text, className, clickHandler = null }) {
    const rootRef = useRef(null);
    const leftBracketRef = useRef(null);
    const rightBracketRef = useRef(null);
    const tweenRef = useRef(null);
    const [play, setPlay] = useState(false);

    useGSAP(
        () => {
            const tl = gsap.timeline({ paused: true });

            // Animate both brackets outward simultaneously
            tl.to(leftBracketRef.current, { x: -16, duration: 0.2, ease: "power1.inOut" }, 0).to(rightBracketRef.current, { x: 16, duration: 0.2, ease: "power1.inOut" }, 0);

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

    const handleClick = (event) => {
        event.preventDefault();

        let section = document.querySelector(className);
        section.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" });
    };

    return (
        <button ref={rootRef} onMouseEnter={handleEnter} onMouseLeave={handleLeave} onClick={clickHandler || handleClick}>
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
