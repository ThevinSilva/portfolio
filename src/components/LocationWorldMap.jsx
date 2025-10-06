import { useGSAP } from "@gsap/react";
import World from "./svgs/World";
import Europe from "./svgs/Europe";
import { useRef } from "react";
import UK from "./svgs/UK";
import gsap from "gsap";

export default function LocationWorldMap() {
    const mapRef = useRef();
    const ukRef = useRef();
    const europeRef = useRef();
    const worldRef = useRef();

    useGSAP(
        () => {
            gsap.to(europeRef.current, { opacity: 0, duration: 2 });
            gsap.to(worldRef.current, { opacity: 0, duration: 1 });
        },
        { scope: mapRef } // Use 'scope' instead of 'dependencies'
    );

    return (
        <div ref={mapRef} className="map">
            <UK ref={ukRef} />
            <Europe ref={europeRef} />
            <World ref={worldRef} />
        </div>
    );
}
