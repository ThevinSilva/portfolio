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

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(SplitText);
gsap.registerPlugin(ScrambleTextPlugin);
gsap.registerPlugin(ScrollTrigger);

function App() {
    useEffect(() => {
        const mainElement = document.querySelector('.main');

        const handleScroll = () => {
            ScrollTrigger.refresh();
        };

        if (mainElement) {
            mainElement.addEventListener('scroll', handleScroll);
        }

        // Initial refresh after mount
        ScrollTrigger.refresh();

        return () => {
            if (mainElement) {
                mainElement.removeEventListener('scroll', handleScroll);
            }
        };
    }, []);

    return (
        <div className="main">
            <Header />
            <About />
            <Work />
            <Contact />
        </div>
    );
}

export default App;
