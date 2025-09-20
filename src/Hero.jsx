import Age from "./components/Age";
import Role from "./components/Role";
import Globe from "./Globe";

export default function Hero() {
    return (
        <div className="Hero" data-scroll-section>
            <div className="hero-content" data-scroll data-scroll-speed="0.5">
                <p>
                    I'm a <Age /> year old
                </p>
                <Role />
            </div>
            <div className="Globe" data-scroll data-scroll-speed="0.1">
                <Globe />
            </div>
        </div>
    );
}
