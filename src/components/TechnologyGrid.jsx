import { useEffect, useRef, useState } from "react";
import { CsharpPlain, PythonPlain, TypescriptPlain, FlaskOriginal, NumpyOriginal, PandasOriginal, MatplotlibPlain, NodejsPlain, ReactOriginal, SveltePlain, MongodbPlain, FirebasePlain, LatexOriginal, PuppeteerOriginal, ThreejsOriginal, DotnetcoreOriginal, AzuresqldatabasePlain, VisualstudioOriginal, AzuredevopsOriginal } from "devicons-react";
import BorderAnimatedBox from "./BorderAnimation";

export default function About() {
    const technologies = [
        { flask: <FlaskOriginal />, numpy: <NumpyOriginal />, pandas: <PandasOriginal />, matplotlib: <MatplotlibPlain />, latex: <LatexOriginal /> },
        { node: <NodejsPlain />, react: <ReactOriginal />, svelte: <SveltePlain />, mongodb: <MongodbPlain />, firebase: <FirebasePlain />, threejs: <ThreejsOriginal /> },
        { dotnet: <DotnetcoreOriginal />, sql: <AzuresqldatabasePlain />, visualStudio: <VisualstudioOriginal />, azure: <AzuredevopsOriginal /> },
    ];

    const containerRef = useRef(null);
    const highlightRef = useRef(null);
    // 0: Python , 1 : TypeScript, 2 : C#
    const [order, setOrder] = useState(0);

    useEffect(() => {
        const container = containerRef.current;
        const highlight = highlightRef.current;
        if (!container || !highlight) return;

        const gridItems = container.querySelectorAll(".item");

        const moveToElement = (element) => {
            if (!element) return;

            let x = 0;
            let y = 0;
            let currentElement = element;

            while (currentElement && currentElement !== container.querySelector(".Grid")) {
                x += currentElement.offsetLeft;
                y += currentElement.offsetTop;
                currentElement = currentElement.offsetParent;
            }

            highlight.style.transform = `translate(${x}px, ${y}px)`;
            highlight.style.width = `${element.offsetWidth}px`;
            highlight.style.height = `${element.offsetHeight}px`;
            highlight.style.backgroundColor = `#fff`;
        };

        const moveHighlight = (e) => {
            const hovered = document.elementFromPoint(e.clientX, e.clientY);
            const item = hovered.closest?.(".item");
            if (item && container.contains(item)) moveToElement(item);
            // convert everything to white
            container.querySelectorAll("svg").forEach((element, index) => (element.style.filter = index == order ? "brightness(0) saturate(100%)" : "brightness(0) invert(1)"));
            // turn just the highlighted item to black
            item.querySelector("svg").style.filter = `brightness(0) saturate(100%)`;
        };

        const handleMouseOut = () => {
            // Only trigger when leaving the container entirely, not child elements
            if (gridItems[order]) {
                moveToElement(gridItems[order]);
                const svg = gridItems[order].querySelector("svg");
                svg.style.filter = "brightness(0) saturate(100%)"; // Fixed: removed extra semicolon
            }
        };

        // Start on the first item if present
        if (gridItems.length > 0) moveToElement(gridItems[order]);

        container.addEventListener("mousemove", moveHighlight);
        container.addEventListener("mouseout", handleMouseOut); // Changed from mouseout to mouseleave

        return () => {
            container.removeEventListener("mousemove", moveHighlight);
            container.removeEventListener("mouseout", handleMouseOut); // Added cleanup
        };
    }, [order]);

    return (
        <div ref={containerRef} className="Technologies">
            <BorderAnimatedBox borders={{ top: true, right: false, bottom: false, left: false }} className="Grid">
                <div className="row">
                    <BorderAnimatedBox className="item" borders={{ top: false, left: false, bottom: true, right: false }} onClick={() => setOrder(0)}>
                        <span>01</span>
                        <PythonPlain />
                        <p>/python</p>
                    </BorderAnimatedBox>
                    <BorderAnimatedBox className="item" borders={{ top: false, left: true, bottom: true, right: false }} onClick={() => setOrder(1)}>
                        <span>02</span>
                        <TypescriptPlain />
                        <p>/typescript</p>
                    </BorderAnimatedBox>
                    <BorderAnimatedBox className="item" borders={{ top: false, left: true, bottom: true, right: false }} onClick={() => setOrder(2)}>
                        <span>03</span>
                        <CsharpPlain />
                        <p>/C#</p>
                    </BorderAnimatedBox>
                </div>
                <div className="row">
                    {Object.keys(technologies[order]).map((key, index) => (
                        <BorderAnimatedBox borders={{ top: false, left: index == 0 ? false : true, bottom: false, right: false }} className="item">
                            <span>
                                {order + 1}|{index + 1}
                            </span>
                            {technologies[order][key]}
                            <p>/{key}</p>
                        </BorderAnimatedBox>
                    ))}
                </div>

                <div ref={highlightRef} className="highlight" />
            </BorderAnimatedBox>
        </div>
    );
}
