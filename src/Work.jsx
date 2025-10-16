import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import gsap from "gsap";
import { div } from "three/tsl";

export default function Work() {
    const data = [
        { name: "Kaizen Records", order: 1 },
        { name: "SynTQ", order: 2 },
        { name: "KennyS", order: 3 },
        { name: "idk", order: 4 },
        { name: "a", order: 5 },
        { name: "b", order: 6 },
    ];
    const [index, setIndex] = useState(0);
    const [visible, setVisible] = useState(data.slice(0, 4));
    const workRef = useRef(null);

    useGSAP(
        () => {
            if (index === 0) return;
            const items = workRef.current.querySelectorAll("div");
            const tl = gsap.timeline({
                onComplete: function () {
                    this.time(0).kill();
                    setVisible(Array.from({ length: visible.length }, (_, i) => data[(index + i) % data.length]));
                },
            });
            // remove the first item
            console.log(workRef.current.offsetWidth);

            // move up second and third item and fourth (invisible item)
            tl.to(
                items[1],
                {
                    x: -(workRef.current.offsetWidth / 8),
                    duration: 0.2,
                },
                0
            );
            tl.to(
                items[2],
                {
                    x: -(workRef.current.offsetWidth / 8),
                    duration: 0.2,
                },
                0
            );

            tl.to(
                items[3],
                {
                    x: -(workRef.current.offsetWidth / 8),
                    duration: 0.2,
                },
                0
            );
        },
        { scope: workRef, dependencies: [index] }
    );

    return (
        <>
            {index}
            {visible.map((x) => x.name + "       |    ")}
            <div ref={workRef} className="carousel">
                {visible.map((x, i) => (
                    <div onClick={() => setIndex(index + i)}>
                        <span>{x.name}</span>
                        <span>{x.order}</span>
                    </div>
                ))}
            </div>
        </>
    );
}
