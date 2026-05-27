import { useEffect, useState } from "react";
import { getGPUTier } from "detect-gpu";
import Blink from "./components/Blink";

export default function Warning() {
    const [warn, setWarn] = useState(null);

    useEffect(() => {
        let cancelled = false;
        getGPUTier().then((x) => {
            if (!cancelled) setWarn(x.tier < 2);
        });

        const dismiss = () => setWarn(false);
        window.addEventListener("keydown", dismiss);

        return () => {
            cancelled = true;
            window.removeEventListener("keydown", dismiss);
        };
    }, []);

    if (warn !== true) return null;

    return (
        <div className="warning" onClick={() => setWarn(false)}>
            <div className="info">
                <h1>Critical Error</h1>
                <p>This experience makes heavy use of WebGL technology.</p>
                <p>We've detected below average performance.</p>
                <p>Please ensure the browser has "Graphics Acceleration" enabled.</p>
                <p>Error : 0E : 016 : BFF9B3D4</p>
                <span>
                    Press any key or tap to continue{" "}
                    <Blink repeat={100000} duration={0.5}>
                        _
                    </Blink>
                </span>
            </div>
        </div>
    );
}
