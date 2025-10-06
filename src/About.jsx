import TechnologyGrid from "./components/TechnologyGrid";
import InfoGrid from "./components/InfoGrid.jsx";
import BorderAnimatedBox from "./components/BorderAnimation";

export default function About() {
    return (
        <BorderAnimatedBox className="About">
            <InfoGrid />
        </BorderAnimatedBox>
    );
}
