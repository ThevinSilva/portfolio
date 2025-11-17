import MenuButton from "./components/MenuButton";
import FlowingMenu from "./components/FlowingMenu";
import { useGSAP } from "@gsap/react";
import { useRef } from "react";
import gsap from "gsap";

export default function Header() {
    const demoItems = [
        { classname: ".about", text: "About", icon: "hn hn-user-solid" },
        { classname: ".work", text: "Work", icon: "hn hn-code-solid" },
        { classname: ".contact", text: "Contact", icon: "hn hn-globe" },
    ];
    const containerRef = useRef(null);
    const timelineRef = useRef(null);

    useGSAP(
        () => {
            timelineRef.current = gsap.timeline({
                paused: true,
            });

            // Top border - expands from left to right
            timelineRef.current.from(containerRef.current, {
                height: 0,
                opacity: 0,
                delay: 0.1,
                duration: 0.5,
                ease: "back.inOut",
                pointerEvents: "none",
            });
        },
        { scope: containerRef }
    );

    return (
        <>
            <menu>
                <div className="links">
                    <MenuButton text={"About"} className={".about"} />
                    <MenuButton text={"Work"} className={".work"} />
                    <MenuButton text={"Contact"} className={".contact"} />
                    <MenuButton
                        text={"Menu"}
                        className={""}
                        clickHandler={(event) => {
                            event.preventDefault();
                            timelineRef.current.play();
                        }}
                    />
                </div>
            </menu>
            <div
                className="menu-wrap"
                ref={containerRef}
                onClick={(event) => {
                    event.preventDefault();
                    timelineRef.current.reverse();
                }}
            >
                <FlowingMenu items={demoItems} />
            </div>
        </>
    );
}
