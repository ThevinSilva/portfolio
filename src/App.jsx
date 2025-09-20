import "./styles.scss";
import { useEffect } from "react";

// components
import Header from "./Header";
// Sections
import Hero from "./Hero";
import About from "./About";

// gsap + plugins
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(SplitText);

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
            <Header />
            <Hero />
            <About />
        </div>
    );
}

export default App;
