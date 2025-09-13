import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function Role({ roles = ["fullstack developer", "Data Scientist", "Web Designer"] }) {
    const [word, setWord] = useState("");
    const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const cursorRef = useRef();
    const ref = useRef();

    useEffect(() => {
        const currentRole = roles[currentRoleIndex];

        if (currentCharIndex < currentRole.length) {
            // Still typing the current role
            const timeout = setTimeout(() => {
                setWord((prev) => prev + currentRole.charAt(currentCharIndex).toUpperCase());
                setCurrentCharIndex((prev) => prev + 1);
            }, 100);

            return () => clearTimeout(timeout);
        } else {
            // Finished typing current role, wait then move to next
            gsap.to(cursorRef.current, {
                opacity: -100,
                ease: "steps(1)",
                yoyo: true,
                duration: 0.4,
                repeat: 10,
            });
            gsap.to(ref.current, {
                backgroundColor: "#f9020290",
                delay: 4, // very short duration for the "flash"
                duration: 1,
                ease: "steps(1)",
                onComplete: () => {
                    gsap.to(ref.current, {
                        backgroundColor: "",
                    });
                    gsap.to(cursorRef.current, {
                        opacity: 100,
                    });
                },
            });

            const timeout = setTimeout(() => {
                setWord("");
                setCurrentCharIndex(0);
                setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
            }, 5000);

            return () => clearTimeout(timeout);
        }
    }, [currentCharIndex, currentRoleIndex, roles]);

    return (
        <h1 ref={ref}>
            {word} <span ref={cursorRef} style={{ borderLeft: "4px solid #f9020290", height: "100%" }}></span>
        </h1>
    );
}
