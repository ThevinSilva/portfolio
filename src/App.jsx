import "./styles.scss";
import { useState, useEffect } from "react";

// components
import Header from "./Header";
// Sections
import Hero from "./Hero";

// fetch + post requests
import getLocation from "./api/getLocation";

// gsap + plugins
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(SplitText);

function App() {
    const [location, setLocation] = useState({});

    useEffect(() => {
        // get ip date for the contact me section globe

        getLocation().then((data) => setLocation(data));
        // setup smooth scroll

        (async () => {
            const LocomotiveScroll = (await import("locomotive-scroll")).default;
            // eslint-disable-next-line no-unused-vars
            const locomotiveScroll = new LocomotiveScroll();
        })();
    }, []);

    return (
        <div className="content" data-scroll-container>
            <Header />
            <Hero />
        </div>
    );
}

export default App;
