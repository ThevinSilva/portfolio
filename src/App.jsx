import GlobeDots from "./components/Globe";
import { Canvas } from "@react-three/fiber";
import "./App.css";

function App() {
    return (
        <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a" }}>
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
                <GlobeDots dotCount={60000} globeRadius={600} dotRadius={2} />

                {/* Or use the individual mesh version for smaller dot counts */}
                {/* <GlobeDotsIndividual dotCount={5000} globeRadius={600} dotRadius={2} /> */}
            </Canvas>
        </div>
    );
}

export default App;
