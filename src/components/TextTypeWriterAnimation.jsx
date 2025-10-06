import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import SplitText from "gsap/SplitText";
import gsap from "gsap";

export default function TextTypeWriterAnimation({ children, stagger = 0.03, x = -29, duration = 1, ease = "steps(1)", delay = 0 }) {
    const ref = useRef(null);

    useGSAP(
        () => {
            SplitText.create(ref.current, {
                type: "chars, words",
                mask: "words",
                charsClass: "chars",
                autoSplit: true,
                onSplit(self) {
                    gsap.from(self.chars, {
                        duration,
                        x,
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
        <div style={{ display: "inline" }} ref={ref}>
            {children}
        </div>
    );
}
