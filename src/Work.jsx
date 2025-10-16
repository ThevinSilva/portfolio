import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import gsap from "gsap";
import { div } from "three/tsl";

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

    useGSAP(
        () => {
            if (index === 0) return;
            const items = carouselRef.current.querySelectorAll("div");
            const tl = gsap.timeline({
                onComplete: function () {
                    this.time(0).kill();
                    setVisible(Array.from({ length: visible.length }, (_, i) => data[(index + i) % data.length]));
                },
            });
            const currPos = index % data.length;
            const prevPos = visible[0].order - 1;
            const step = (((currPos - prevPos) % data.length) + data.length) % data.length;
            console.log("seperation");
            console.log(index % data.length);
            console.log(visible[0].order - 1);
            console.log(step);
            const offset = -(carouselRef.current.offsetWidth / 5) * step;

            for (let i = 0; i <= 5; i++) {
                tl.to(
                    items[i],
                    {
                        x: offset,
                        duration: 0.7,
                        ease: "power3.out",
                    },
                    0
                );
            }
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
                    <div className="column" onClick={() => setIndex(index + i)}>
                        <span>{x.name}</span>
                        <span>{x.order}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
