//  Have a collection of different animations under different names popin typewriter...

import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import SplitText from "gsap/SplitText";
import gsap from "gsap";

export default function TextPopInAnimation({ children, stagger = 0.03, y = 400, duration = 1, ease = "back.out", delay = 0 }) {
    const ref = useRef(null);

    useGSAP(
        () => {
            SplitText.create(ref.current, {
                type: "chars, words",
                mask: "chars",
                autoSplit: true,
                onSplit(self) {
                    gsap.from(self.chars, {
                        duration,
                        y,
                        autoAlpha: 0,
                        stagger,
                        ease,
                        delay,
                    });
                },
            });
        },
        { scope: ref }
    );

    return (
        <div ref={ref} style={{ display: "inline" }}>
            {children}
        </div>
    );
}
