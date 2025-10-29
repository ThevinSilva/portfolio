import "./styles.scss";
import { useEffect } from "react";

// components
import Header from "./Header";
// Sections
import Hero from "./Hero";
import About from "./About";
import Work from "./Work";
import Contact from "./Contact";

// gsap + plugins
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Globe from "./Globe";

import Dither from "./components/Dither";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrambleTextPlugin);
gsap.registerPlugin(ScrollTrigger);

function App() {
    useEffect(() => {
        (async () => {
            const LocomotiveScroll = (await import("locomotive-scroll")).default;
            // eslint-disable-next-line no-unused-vars
            const locomotiveScroll = new LocomotiveScroll();
        })();
    }, []);

    return (
        <div className="content" data-scroll-container>
            <Hero />
            <Header />
            <About />
            <Work />
            <Contact />
            <div className="Globe">
                <Globe />
                <Dither />
            </div>
        </div>
    );
}

export default App;
