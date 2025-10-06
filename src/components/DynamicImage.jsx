import { useState } from "react";
import GridDistortion from "./GridDistortion";
import PixelTransition from "./PixelTransition";
import FlatImage from "./FlatImage";

export default function DynamicImage({ inView }) {
    const [imageAspectRatio, setImageAspectRatio] = useState(1);

    const handleImageLoad = (aspectRatio) => {
        setImageAspectRatio(aspectRatio);
    };

    // Use the image aspect ratio directly for CSS aspect-ratio property

    return (
        <PixelTransition
            firstContent={
                <div
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "grid",
                        placeItems: "center",
                        backgroundColor: "inherit",
                    }}
                ></div>
            }
            secondContent={
                <div style={{ width: "100%", height: "100%", position: "relative", display: "block", margin: "auto" }}>
                    <GridDistortion imageSrc="./potrait.png" grid={10} mouse={0.1} strength={0.15} relaxation={0.9} asciiMode={true} invertColors={false} asciiSize={70} gridSize={60} onImageLoad={handleImageLoad} />
                </div>
            }
            pixelColor="#ffffff"
            animationStepDuration={0.4}
            className="custom-pixel-card"
            aspectRatio={imageAspectRatio}
            run={inView}
        />
    );
}
