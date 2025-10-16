import Age from "./components/Age";
import Role from "./components/Role";
import Globe from "./Globe";
import TextPressure from "./components/TexstPressure";

export default function Hero() {
    return (
        <div className="Hero" data-scroll-section>
            <div className="hero-content" data-scroll data-scroll-speed="0.5">
                {/* <Role /> */}
            </div>
            {/* <TextPressure data-scroll data-scroll-speed="0.1" text="Thevin Silva" flex={true} alpha={false} stroke={false} width={true} weight={true} italic={true} textColor="#ffffff" strokeColor="#ff0000" minFontSize={36} /> */}
            <div className="Globe" data-scroll data-scroll-speed="0.6">
                <Globe />
            </div>
        </div>
    );
}
