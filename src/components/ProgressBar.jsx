import React from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import SplitText from "gsap/SplitText";

export default function ProgressBar({ count = 50, fillPercentage = 0.75, name = "" }) {
    const ref = useRef(null);

    useGSAP(() => {
        const tl = gsap.timeline({
            paused: true,
            scrollTrigger: {
                trigger: ref.current,
                start: "top bottom",
                end: "bottom top",
            },
        });

        tl.from(ref.current.querySelectorAll(".box"), {
            visibility: "hidden",
            duration: 0.01,
            stagger: 0.1,
            ease: "power2.out",
        }).tweenTo(tl.duration() * fillPercentage);
    });

    return (
        <div className="language">
            <p>{name}</p>
            <div className="content">
                <div ref={ref} className="bar">
                    {[...Array(count)].map(() => (
                        <div className="box"></div>
                    ))}
                </div>
                <div className="amount">{fillPercentage * 100}%</div>
            </div>
        </div>
    );
}
