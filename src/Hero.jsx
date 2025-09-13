import Age from "./components/Age";
import TextPopInAnimation from "./components/TextPopInAnimation";
import Role from "./components/Role";
import { Canvas } from "@react-three/fiber";
import GlobeDots from "./components/Globe";

export default function Hero() {
    const userLocation = {
        latitude: 51.5828,
        longitude: -0.3448,
        city: "London",
        countryName: "United Kingdom",
        ip: "192.168.1.1",
    };
    return (
        <div className="Hero" data-scroll-section>
            <div className="content" data-scroll data-scroll-speed="0.5">
                <p>
                    I'm a <Age /> year old
                </p>
                <Role />
            </div>
            <div className="Globe" data-scroll data-scroll-speed="0.1">
                <Canvas
                    camera={{
                        position: [0, 0, 1500],
                        fov: 60,
                        near: 1,
                        far: 3000,
                    }}
                    gl={{ antialias: true }}
                >
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} />

                    {/* Use the instanced version for better performance */}
                    <GlobeDots dotCount={60000} globeRadius={600} dotRadius={2} userLocation={userLocation} />

                    {/* Or use the individual mesh version for smaller dot counts */}
                    {/* <GlobeDotsIndividual dotCount={5000} globeRadius={600} dotRadius={2} /> */}
                </Canvas>
            </div>
            {/* <video id="vid" autoPlay muted>
                <source src="/Horizon.mp4" type="video/mp4" />
            </video> */}
        </div>
    );
}
