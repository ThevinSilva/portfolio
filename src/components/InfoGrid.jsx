import { useGSAP } from "@gsap/react";
import { useRef, useState } from "react";
import gsap from "gsap";
import TextTypeWriterAnimation from "./TextTypeWriterAnimation";
import TextPopInAnimation from "./TextPopInAnimation";
import DynamicImage from "./DynamicImage";
import TechnologyGrid from "./TechnologyGrid";
import BorderAnimatedBox from "./BorderAnimation";
import Age from "./Age";
import LocationWorldMap from "./LocationWorldMap";
import LangDistribution from "./LangDistribution";
import SectionHeader from "./SectionHeader";
import Infobar from "./InfoBar";

function InfoGrid() {
    const attributeRef = useRef(null);
    const [inView, setInView] = useState(false);

    useGSAP(
        () => {
            const scrambleAnimation = gsap.timeline({ id: "informationAnimation", paused: true });
            const revealItems = gsap.utils.toArray(".reveal");
            const scrambleItems = gsap.utils.toArray(".scrambled");

            revealItems.forEach((element, index) => {
                let tl = gsap.timeline().from(element, { duration: 0.1, y: -32, x: -14, opacity: 0, ease: "back.out" });
                scrambleAnimation.add(tl, index * 0.1 + 0.5);
            });

            scrambleItems.forEach((element, index) => {
                let text = element.innerText;

                let tl = gsap
                    .timeline()
                    .to(element, { duration: 0.01, opacity: 1 })
                    .to(
                        element,
                        {
                            duration: 1,
                            ease: "none",
                            scrambleText: {
                                text: text,
                                oldClass: "old",
                                newClass: "new",
                            },
                        },
                        "<"
                    );
                scrambleAnimation.add(tl, index * 0.1 + 1.2);
            });

            window.addEventListener("AboutInView", (e) => {
                const { target, way, from } = e.detail;
                console.log(`target: ${target}`, `way: ${way}`, `from: ${from}`);
                scrambleAnimation.play();
                setInView(true);
            });
        },
        { dependencies: attributeRef }
    );

    const information = {
        fields: [
            { key: "OS", value: "Human" },
            { key: "Host", value: "Thevin Silva " },
            { key: "Uptime", value: "21" },
            { key: "Shell", value: "English // Italian // Sinhala" },
            { key: "Education", value: "Bsc Data Science @ Uni of Bristol" },
            { key: "Experience", value: ".NET Developer @ SciY/optimal-tech" },
            { key: "Disk", value: "Anime // Video games // Projects" },
            { key: "Locale", value: "en_GB (London/Bristol)" },
        ],
    };

    return (
        <>
            <div className="header"></div>
            <div className="infoGrid" data-scroll-section>
                <BorderAnimatedBox className="left " data-scroll data-scroll-speed="-0.1" data-scroll-repeat>
                    <div className="thing">
                        <div className="image">
                            <DynamicImage inView={inView} />
                            <SectionHeader>
                                01 <span style={{ fontFamily: "KHInterferenceTRIAL", fontSize: "3rem", fontWeight: 400 }}>//</span>About
                            </SectionHeader>
                        </div>
                        <BorderAnimatedBox className="attributes" ref={attributeRef} data-scroll data-scroll-call="AboutInView" borders={{ top: false, right: false, bottom: false, left: true }}>
                            <span className="header">
                                {inView && (
                                    <TextPopInAnimation delay={0.4} ease={"power4.out"} duration={1}>
                                        thevin<span className="accent">@</span>silva
                                    </TextPopInAnimation>
                                )}
                            </span>
                            {inView && (
                                <TextTypeWriterAnimation duration={1} ease="power4.out">
                                    <span className="divider">{Array(20).fill(">").join(" ")}</span>
                                </TextTypeWriterAnimation>
                            )}
                            {information.fields.map(({ key, value }) => (
                                <div className="field">
                                    <span className="reveal accent">{key}: </span> {key == "Uptime" ? <Age /> : <span className="scrambled">{value}</span>}
                                </div>
                            ))}
                        </BorderAnimatedBox>
                    </div>
                </BorderAnimatedBox>
                <Infobar data-scroll data-scroll-speed="0" data-scroll-repeat />
                <BorderAnimatedBox className="right glass" data-scroll data-scroll-repeat data-scroll-speed="0.5">
                    <LocationWorldMap />
                    <LangDistribution />
                    <TechnologyGrid />
                </BorderAnimatedBox>
            </div>
        </>
    );
}

export default InfoGrid;
