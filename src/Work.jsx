import BorderAnimatedBox from "./components/BorderAnimation";
import { useRef, useState, useLayoutEffect } from "react";
import LinkButton from "./components/LinkButton";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const Column = ({ proj, index, setIncrement }) => {
    const tweenRef = useRef(null);
    const backgroundRef = useRef(null);
    const [clicked, setClicked] = useState(false);

    const handleEnter = () => index > 0 && !clicked && tweenRef.current?.play();
    const handleLeave = () => index > 0 && !clicked && tweenRef.current?.reverse();
    const handleClick = () => {
        if (index > 0) {
            setClicked(true);
            gsap.set(backgroundRef.current, { scaleY: 1 });

            // Reset after carousel animation completes
            gsap.delayedCall(0.6, () => {
                setClicked(false);
                gsap.set(backgroundRef.current, { scaleY: 0 });
            });
        }
    };

    useLayoutEffect(() => {
        // Don't reset if clicked
        if (clicked) return;
        gsap.killTweensOf(backgroundRef.current);

        // set initial state + direction (top or bottom)
        gsap.set(backgroundRef.current, {
            scaleY: 0,
            transformOrigin: "bottom",
            willChange: "transform",
        });

        tweenRef.current = gsap.to(backgroundRef.current, {
            scaleY: 1,
            duration: 0.6,
            ease: "expo.out",
            paused: true,
        });

        return () => tweenRef.current?.kill();
    }, [index, clicked]);

    return (
        <div
            className="column"
            onClick={() => {
                handleClick();
                setIncrement((prev) => prev + index);
            }}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
        >
            <div className="columnContent">
                <h1>{proj.name}</h1>
                <span>0{proj.order}</span>
            </div>
            <div ref={backgroundRef} className="background"></div>
        </div>
    );
};

export default function Work() {
    const data = [
        {
            name: "Kaizen Records",
            order: 1,
            description: `Simple landing page for indie record label. Built a 2D side-scrolling game featuring a Firebase-powered scoreboard to track and display global player rankings. Dynamic animations powered by Motion + React`,
            date: `2023`,
        },
        {
            name: "SynTQ",
            order: 2,
            description: `Worked in a .NET/WPF (ReactiveUI) codebase debugging async/UI issues and refactors.
            Maintained Selenium + SpecFlow scenarios for the WPF app increasing coverage of high-risk user flows and catching recurring issues earlier.
            Created PRs under branch policies, responded to senior code reviews, read pipeline logs/test reports, and re-ran/triaged failures.`,
            date: `2025`,
        },
        {
            name: "BDSS",
            order: 3,
            description: `Develop workshops and training sessions on various data science topics, ensuring content is engaging, informative, and relevant to the needs and interests of BDSS members. 
            Designed Society Landing Page`,
            date: `2024`,
        },
        {
            name: "KennyS",
            order: 4,
            description: `Built an Electron App that scrapes and trades in-game items using Google's Puppeteer Library written in TypeScript.
            Implemented CI/CD pipeline through a series of unit tests made to ensure quality when pushing new releases.`,
            date: `2022`,
        },
        {
            name: "Log Horizon",
            order: 5,
            description: `Developed a social networking website with real-time forum threads and chatting.
            Single page front-end written using React.js with a Back-End Server running on Node.js. 
            REST API & Web Socket technology allows for real-time dynamic chatting and forum posts.
            `,
            date: `2020`,
        },
    ];
    const [visible, setVisible] = useState(data.slice(0, 5));
    const [previousIndex, setPreviousIndex] = useState(0);
    const [content, setContent] = useState(visible[0]);
    const [increment, setIncrement] = useState(0);
    const carouselRef = useRef(null);
    const contentRef = useRef(null);
    const slideRef = useRef(null);

    useGSAP(
        () => {
            if (increment === 0 && previousIndex === 0) return;

            const items = carouselRef.current.querySelectorAll(".column");
            const currPos = increment % data.length;
            const prevPos = previousIndex % data.length;
            const step = (((currPos - prevPos) % data.length) + data.length) % data.length;

            if (step === 0) return;

            const offset = -(carouselRef.current.offsetWidth / 5) * step;

            // Update content immediately and position new items off-screen
            const newVisible = Array.from({ length: 5 }, (_, i) => data[(increment + i) % data.length]);
            setVisible(newVisible);

            gsap.set(contentRef.current, { opacity: 0 });

            // Position items off-screen instantly (this happens before paint)
            gsap.set(items, { x: -offset });

            // Then animate to 0
            gsap.to(items, {
                x: 0,
                duration: 0.5,
                stagger: 0.15,
                ease: "power3.out",
            });

            gsap.fromTo(
                slideRef.current,
                {
                    x: "100%",
                    width: "200%",
                },
                {
                    x: "-100%",
                    width: "0%",
                    duration: 1.2,
                    ease: "sine.inOut",
                    onComplete: () => {
                        gsap.to(contentRef.current, { opacity: 1 });
                    },
                }
            );

            setPreviousIndex(increment);
            setContent(data[increment % data.length]);

            return () => {};
        },
        { scope: carouselRef, dependencies: [increment] }
    );

    return (
        <div className="work">
            <div className="content" ref={contentRef}>
                <h1>{content.name}</h1>
                <p>{content.description}</p>
                <div className="footer">
                    <LinkButton style={{ width: "50%", height: "100%" }} borders={{ top: true, right: true, bottom: true, left: true }}>
                        demo
                    </LinkButton>
                    <LinkButton style={{ width: "50%", height: "100%" }} borders={{ top: true, right: true, bottom: true, left: true }}>
                        code
                    </LinkButton>
                </div>
            </div>
            <div ref={slideRef} className="slide"></div>
            <div ref={carouselRef} className="carousel">
                {visible.map((x, i) => (
                    <Column key={x.order} proj={x} index={i} increment={increment} setIncrement={setIncrement} />
                ))}
            </div>
            <div className="grid">
                <BorderAnimatedBox className="column" borders={{ top: false, right: true, bottom: false, left: false }} />
                <BorderAnimatedBox className="column" borders={{ top: false, right: true, bottom: false, left: false }} />
                <BorderAnimatedBox className="column" borders={{ top: false, right: true, bottom: false, left: false }} />
                <BorderAnimatedBox className="column" borders={{ top: false, right: true, bottom: false, left: false }} />
                <BorderAnimatedBox className="column" borders={{ top: false, right: true, bottom: false, left: false }} />
                <BorderAnimatedBox className="column" borders={{ top: false, right: true, bottom: false, left: false }} />
                <BorderAnimatedBox className="column" borders={{ top: false, right: true, bottom: false, left: false }} />
            </div>
        </div>
    );
}
