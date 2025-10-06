import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

function PixelTransition({ firstContent, secondContent, gridSize = 7, pixelColor = "currentColor", animationStepDuration = 0.3, className = "", style = {}, aspectRatio = 1, run = false }) {
    const pixelGridRef = useRef(null);
    const activeRef = useRef(null);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const pixelGridEl = pixelGridRef.current;
        const activeEl = activeRef.current;

        if (!pixelGridEl) return;

        // Initialize active element
        if (activeEl) {
            activeEl.style.display = "none";
        }

        pixelGridEl.innerHTML = "";

        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const pixel = document.createElement("div");
                pixel.classList.add("pixelated-image-card__pixel");
                pixel.style.backgroundColor = pixelColor;

                const size = 100 / gridSize;
                pixel.style.width = `${size}%`;
                pixel.style.height = `${size}%`;
                pixel.style.left = `${col * size}%`;
                pixel.style.top = `${row * size}%`;
                pixelGridEl.appendChild(pixel);
            }
        }
    }, [gridSize, pixelColor]);

    // Run animation when run prop changes
    useEffect(() => {
        if (run) {
            animatePixels();
            console.log("this happened");
        }
    }, [run]);

    const animatePixels = () => {
        const pixelGridEl = pixelGridRef.current;
        const activeEl = activeRef.current;
        if (!pixelGridEl || !activeEl) return;

        const pixels = pixelGridEl.querySelectorAll(".pixelated-image-card__pixel");
        if (!pixels.length) return;

        const newState = !isActive;
        setIsActive(newState);

        gsap.killTweensOf(pixels);
        gsap.set(pixels, { display: "none" });

        const totalPixels = pixels.length;
        const staggerDuration = animationStepDuration / totalPixels;

        // Show pixels with stagger
        gsap.to(pixels, {
            display: "block",
            duration: 0,
            stagger: {
                each: staggerDuration,
                from: "random",
            },
        });

        // Switch content after pixels appear
        gsap.delayedCall(animationStepDuration, () => {
            activeEl.style.display = newState ? "block" : "none";
        });

        // Hide pixels with stagger
        gsap.to(pixels, {
            display: "none",
            duration: 0,
            delay: animationStepDuration,
            stagger: {
                each: staggerDuration,
                from: "random",
            },
        });
    };

    return (
        <div className={`pixelated-image-card ${className}`} style={{ ...style, aspectRatio: aspectRatio }}>
            <div className="pixelated-image-card__default">{firstContent}</div>
            <div className="pixelated-image-card__active" ref={activeRef}>
                {secondContent}
            </div>
            <div className="pixelated-image-card__pixels" ref={pixelGridRef} />
        </div>
    );
}

export default PixelTransition;
