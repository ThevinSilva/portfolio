import Age from "./components/Age";
import Role from "./components/Role";
import TextPressure from "./components/TexstPressure";

export default function Hero() {
    return (
        <div className="Hero">
            <div className="hero-content">
                {/* <Role /> */}
            </div>
            <TextPressure text="Thevin Silva" flex={true} alpha={false} stroke={false} width={true} weight={true} italic={true} textColor="#ffffff" strokeColor="#ff0000" minFontSize={36} />
        </div>
    );
}
