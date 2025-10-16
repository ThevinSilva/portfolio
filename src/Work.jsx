import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import gsap from "gsap";

export default function Work() {
    const data = [
        { name: "Kaizen Records", order: 1 },
        { name: "SynTQ", order: 2 },
        { name: "BDSS", order: 3 },
        { name: "idk", order: 4 },
        { name: "a", order: 5 },
        { name: "b", order: 6 },
    ];
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(data.slice(0, 5));
    const carouselRef = useRef(null);
    const prevIndexRef = useRef(0);
    const [previousIndex, setPreviousIndex] = useState(0);


    useGSAP(
        () => {
            if (index === 0 && prevIndexRef.current === 0) return;

            const items = carouselRef.current.querySelectorAll("div");
            const currPos = index % data.length;
            const prevPos = prevIndexRef.current % data.length;
            const step = (((currPos - prevPos) % data.length) + data.length) % data.length;

            if (step === 0) return;

            const offset = -(carouselRef.current.offsetWidth / 5) * step;

            // Update content immediately and position new items off-screen
            const newVisible = Array.from({ length: 5 }, (_, i) => data[(index + i) % data.length]);
            setVisible(newVisible);

            // Position items off-screen instantly (this happens before paint)
            gsap.set(items, { x: offset });

            // Then animate to 0
            gsap.to(items, {
                x: 0,
                duration: 0.7,
                ease: "power3.out",
            });

            prevIndexRef.current = index;
        },
        { scope: carouselRef, dependencies: [index] }
    );

    return (
        <div className="work">
            <div className="column"></div>
            <div className="column"></div>
            <div className="column"></div>
            <div className="column"></div>
            <div className="column"></div>
            <div className="column"></div>
            <div ref={carouselRef} className="carousel">
                {visible.map((x, i) => (
                    <div key={x.order} className="column" onClick={() => setIndex(index + i)}>
                        <h1>{x.name}</h1>
                    </div>
                ))}
            </div>
        </div>
    );
}
