import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
import { useShaders } from "./utils/shaderLoader";
// fetch + post requests
import getLocation from "./api/getLocation";

// Globe component that renders inside Canvas
function GlobeScene({ mapUrl, userLocation, mousePosition, mouseVelocity }) {
    // Load shaders with fallback support
    const {
        shaders,
        _,
        error: shaderError,
        usingFallback,
    } = useShaders({
        vertex: "./shaders/vertex.glsl",
        fragment: "./shaders/fragment.glsl",
    });

    // Log shader loading status
    useEffect(() => {
        if (usingFallback) {
            console.warn("Globe: Using fallback shaders - check that .glsl files are accessible");
        }
        if (shaderError) {
            console.error("Globe: Shader loading failed:", shaderError);
        }
    }, [usingFallback, shaderError]);

    const DOT_COUNT = 60000;
    const GLOBE_RADIUS = 600;

    const meshRef = useRef();
    const textMeshRefs = useRef([]);
    const [mapData, setMapData] = useState(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const raycaster = useRef(new THREE.Raycaster());
    const sphereGeometry = useRef(new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32));

    // Camera shake state
    const baseCameraPosition = useRef(new THREE.Vector3(0, 0, 1500));
    const shakeOffset = useRef(new THREE.Vector3());
    const shakeVelocity = useRef(new THREE.Vector3());

    // Load and process the map image
    useEffect(() => {
        console.log("Starting to load map:", mapUrl);
        setIsMapLoaded(false);

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            console.log("Map image loaded successfully");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            setMapData(imageData);
            setIsMapLoaded(true);
        };

        img.onerror = (error) => {
            console.error(`Failed to load map image: ${mapUrl}`, error);
            setIsMapLoaded(false);
        };

        img.src = mapUrl;
    }, [mapUrl]);

    // Calculate dot positions from map data - simplified to ensure it always returns positions
    const { positions, validDotCount, userDotIndex, userPosition } = useMemo(() => {
        console.log("Calculating positions. MapData available:", !!mapData, "UserLocation:", userLocation);

        if (!mapData) {
            console.log("No map data, returning empty positions");
            return { positions: [], validDotCount: 0, userDotIndex: -1, userPosition: null };
        }

        const positions = [];
        const vector = new THREE.Vector3();
        let closestDistance = Infinity;
        let closestIndex = -1;
        let userPos = null;

        // Check if we have valid user location
        const hasValidUserLocation = userLocation && typeof userLocation.latitude === "number" && typeof userLocation.longitude === "number" && !isNaN(userLocation.latitude) && !isNaN(userLocation.longitude);

        console.log("Has valid user location:", hasValidUserLocation, userLocation);

        for (let i = 0; i < DOT_COUNT; i++) {
            const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
            const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;
            vector.setFromSphericalCoords(GLOBE_RADIUS, phi, theta);

            // Convert 3D position to UV coordinates for map sampling
            const u = 0.5 + Math.atan2(vector.x, vector.z) / (2 * Math.PI);
            const v = 0.5 - Math.asin(vector.y / GLOBE_RADIUS) / Math.PI;

            // Sample the map image - add bounds checking
            const x = Math.max(0, Math.min(Math.floor(u * mapData.width), mapData.width - 1));
            const y = Math.max(0, Math.min(Math.floor(v * mapData.height), mapData.height - 1));
            const index = (y * mapData.width + x) * 4;

            // Check if pixel represents land (dark pixels)
            const r = mapData.data[index] || 0;
            const g = mapData.data[index + 1] || 0;
            const b = mapData.data[index + 2] || 0;

            // Land areas (dark pixels)
            if (!(r > 10 || g > 10 || b > 10)) {
                // Convert to lat/lng for user location matching
                const lat = Math.asin(vector.y / GLOBE_RADIUS) * (180 / Math.PI);
                const lng = Math.atan2(vector.x, vector.z) * (180 / Math.PI);

                // Find closest dot to user location if we have valid location
                if (hasValidUserLocation) {
                    const distance = Math.sqrt(Math.pow(lat - userLocation.latitude, 2) + Math.pow(lng - userLocation.longitude, 2));
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = positions.length;
                        userPos = vector.clone();
                    }
                }

                positions.push(vector.clone());
            }
        }

        console.log("Calculated positions:", positions.length);
        return {
            positions,
            validDotCount: positions.length,
            userDotIndex: closestIndex,
            userPosition: userPos,
        };
    }, [mapData, userLocation]);

    // Create text elements for user location
    const textElements = useMemo(() => {
        if (!userLocation || !userLocation.city) return [];

        const textData = [
            {
                text: `${userLocation.city || "Unknown"}, ${userLocation.countryName || "Unknown"}`,
                color: "#ffffff",
                size: 100,
                offset: 40,
            },
            {
                text: userLocation.ip || "N/A",
                color: "#ef0915",
                size: 40,
                offset: 0,
            },
        ];

        return textData.map(({ text, color, size, offset }) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            const fontSize = size;
            canvas.width = Math.max(256, text.length * fontSize * 0.6);
            canvas.height = fontSize * 3;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.font = `bold ${fontSize}px Arial, sans-serif`;
            context.fillStyle = color;
            context.textAlign = "center";
            context.textBaseline = "middle";
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.1,
                side: THREE.DoubleSide,
            });

            const width = canvas.width / 4;
            const height = canvas.height / 4;
            const geometry = new THREE.PlaneGeometry(width, height);

            return { geometry, material, offset };
        });
    }, [userLocation]);

    // Shader material for the dots
    const shaderMaterial = useMemo(() => {
        // console.log("Creating shader material. Shaders available:", !!shaders);

        if (!shaders) {
            console.log("No shaders available, creating basic material");
            // Fallback to basic material if shaders aren't loaded
            return new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                transparent: true,
                opacity: 0.8,
            });
        }

        return new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: shaders.vertex,
            fragmentShader: shaders.fragment,
            uniforms: {
                viewPosition: { value: new THREE.Vector3() },
                userPosition: { value: new THREE.Vector3() },
                mouseWorldPosition: { value: new THREE.Vector3() },
                time: { value: 0.0 },
                mouseVelocity: { value: 0.0 },
            },
        });
    }, [shaders]);

    // Set up instance data
    useEffect(() => {
        console.log("Setting up instance data. MeshRef:", !!meshRef.current, "Positions:", positions.length);

        if (!meshRef.current || positions.length === 0) {
            console.log("Cannot setup instances - missing mesh or positions");
            return;
        }

        try {
            const matrix = new THREE.Matrix4();
            const userDotFlags = new Float32Array(validDotCount);
            const dotIndices = new Float32Array(validDotCount);

            positions.forEach((position, i) => {
                matrix.setPosition(position);
                meshRef.current.setMatrixAt(i, matrix);
                userDotFlags[i] = i === userDotIndex ? 1.0 : 0.0;
                dotIndices[i] = i;
            });

            meshRef.current.geometry.setAttribute("isUserDot", new THREE.InstancedBufferAttribute(userDotFlags, 1));
            meshRef.current.geometry.setAttribute("dotIndex", new THREE.InstancedBufferAttribute(dotIndices, 1));
            meshRef.current.instanceMatrix.needsUpdate = true;

            console.log("Instance data setup complete");
        } catch (error) {
            console.error("Error setting up instance data:", error);
        }
    }, [positions, validDotCount, userDotIndex]);

    // Enhanced animation loop with improved camera shake
    useFrame(({ camera, clock }, delta) => {
        if (meshRef.current && shaderMaterial) {
            // Slower rotation
            meshRef.current.rotation.y += delta * 0.15;

            // ENHANCED CAMERA SHAKE based on mouse velocity
            const time = clock.elapsedTime;
            const shakeIntensity = Math.min(mouseVelocity * 10.0, 15.0);

            if (shakeIntensity > 0.05) {
                // Multiple shake frequencies for more realistic effect
                const highFreq = Math.sin(time * 45 + mouseVelocity * 15) * shakeIntensity * 0.8;
                const medFreq = Math.sin(time * 25 + mouseVelocity * 8) * shakeIntensity * 0.6;
                const lowFreq = Math.sin(time * 12 + mouseVelocity * 4) * shakeIntensity * 0.4;

                // Combine frequencies for complex shake pattern
                const shakeX = (highFreq + medFreq * 0.7 + lowFreq * 0.5) * 0.8;
                const shakeY = (Math.cos(time * 38 + mouseVelocity * 12) * shakeIntensity * 0.6 + Math.cos(time * 22 + mouseVelocity * 6) * shakeIntensity * 0.4) * 0.8;
                const shakeZ = (Math.sin(time * 33 + mouseVelocity * 10) * shakeIntensity * 0.3 + Math.sin(time * 18 + mouseVelocity * 5) * shakeIntensity * 0.2) * 0.8;

                // Apply physics-based shake with momentum
                const dampening = 0.92;
                const shakeForce = 0.15;

                shakeVelocity.current.x += (shakeX - shakeOffset.current.x) * shakeForce;
                shakeVelocity.current.y += (shakeY - shakeOffset.current.y) * shakeForce;
                shakeVelocity.current.z += (shakeZ - shakeOffset.current.z) * shakeForce;

                shakeVelocity.current.multiplyScalar(dampening);
                shakeOffset.current.add(shakeVelocity.current);

                // Apply shake to camera
                camera.position.x = baseCameraPosition.current.x + shakeOffset.current.x;
                camera.position.y = baseCameraPosition.current.y + shakeOffset.current.y;
                camera.position.z = baseCameraPosition.current.z + shakeOffset.current.z;

                // Add rotational shake for more dramatic effect
                const rotShake = shakeIntensity * 0.002;
                camera.rotation.x += Math.sin(time * 40 + mouseVelocity * 10) * rotShake;
                camera.rotation.y += Math.cos(time * 35 + mouseVelocity * 8) * rotShake;
                camera.rotation.z += Math.sin(time * 30 + mouseVelocity * 12) * rotShake * 0.5;
            } else {
                // Smooth return to base position when no shake
                const returnSpeed = 0.08;
                shakeOffset.current.lerp(new THREE.Vector3(0, 0, 0), returnSpeed);
                shakeVelocity.current.multiplyScalar(0.9);

                camera.position.lerp(baseCameraPosition.current, returnSpeed);
                camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, 0, returnSpeed);
                camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, 0, returnSpeed);
                camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, 0, returnSpeed);
            }

            // Update shader uniforms only if using shader material
            if (shaderMaterial.uniforms) {
                shaderMaterial.uniforms.viewPosition.value.copy(camera.position);
                shaderMaterial.uniforms.time.value = time;
                shaderMaterial.uniforms.mouseVelocity.value = mouseVelocity;

                // Project mouse position onto sphere
                raycaster.current.setFromCamera(mousePosition, camera);
                const sphereMesh = new THREE.Mesh(sphereGeometry.current);
                sphereMesh.rotation.copy(meshRef.current.rotation);

                const intersects = raycaster.current.intersectObject(sphereMesh);
                if (intersects.length > 0) {
                    shaderMaterial.uniforms.mouseWorldPosition.value.copy(intersects[0].point);
                }

                if (userPosition) {
                    shaderMaterial.uniforms.userPosition.value.copy(userPosition);
                }
            }
        }

        // Update text positioning with shake compensation
        if (userPosition && textMeshRefs.current.length > 0) {
            const rotatedUserPosition = userPosition.clone();
            rotatedUserPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), meshRef.current.rotation.y);

            textMeshRefs.current.forEach((textMesh, i) => {
                if (textMesh && textElements[i]) {
                    const offset = 140;
                    const textOffset = textElements[i].offset;

                    const direction = rotatedUserPosition.clone().normalize();
                    const textPosition = direction.multiplyScalar(GLOBE_RADIUS + offset).add(new THREE.Vector3(0, textOffset, 0));

                    textMesh.position.copy(textPosition);
                    textMesh.lookAt(camera.position);
                }
            });
        }
    });

    // console.log("Render check - MapData:", !!mapData, "ShaderMaterial:", !!shaderMaterial, "Positions:", positions.length, "IsMapLoaded:", isMapLoaded);

    // Show loading state or render globe
    if (!isMapLoaded) {
        return (
            <mesh>
                <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
                <meshBasicMaterial color={0x333333} wireframe />
            </mesh>
        );
    }

    if (!mapData || !shaderMaterial) {
        console.log("Still loading resources...");
        return null;
    }

    if (positions.length === 0) {
        console.warn("No positions calculated from map data");
        return (
            <mesh>
                <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
                <meshBasicMaterial color={0x666666} wireframe />
            </mesh>
        );
    }

    return (
        <group rotation={[0.6, 0, 0]}>
            <instancedMesh ref={meshRef} args={[null, null, validDotCount]} material={shaderMaterial}>
                <planeGeometry args={[2, 2]} />
            </instancedMesh>

            {userLocation && userPosition && textElements.map((textElement, i) => <mesh key={i} ref={(el) => (textMeshRefs.current[i] = el)} geometry={textElement.geometry} material={textElement.material} />)}
        </group>
    );
}

// Main Globe component that manages state and wraps Canvas
export default function Globe({ mapUrl = "map.jpg", ...props }) {
    const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
    const [mouseVelocity, setMouseVelocity] = useState(0);
    const lastMousePosition = useRef(new THREE.Vector2());
    const lastMouseTime = useRef(Date.now());
    const [location, setLocation] = useState(null);

    // Enhanced mouse tracking with better velocity calculation
    useEffect(() => {
        const handleMouseMove = (event) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastMouseTime.current;

            // Convert to normalized device coordinates
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            const newMousePos = new THREE.Vector2(x, y);

            // Calculate mouse velocity with smoothing
            if (deltaTime > 0 && deltaTime < 100) {
                const distance = newMousePos.distanceTo(lastMousePosition.current);
                const velocity = distance / (deltaTime * 0.001);
                const smoothedVelocity = Math.min(velocity * 0.015, 12);
                setMouseVelocity((prev) => THREE.MathUtils.lerp(prev, smoothedVelocity, 0.3));
            }

            setMousePosition(newMousePos);
            lastMousePosition.current.copy(newMousePos);
            lastMouseTime.current = currentTime;
        };

        const handleMouseLeave = () => {
            setMouseVelocity((prev) => prev * 0.9);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseleave", handleMouseLeave);

        const velocityDecay = setInterval(() => {
            setMouseVelocity((prev) => prev * 0.95);
        }, 16);

        // Load location data
        getLocation()
            .then((data) => {
                console.log("Location loaded:", data);
                setLocation(data);
            })
            .catch((error) => {
                console.warn("Failed to load location:", error);
            });

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
            clearInterval(velocityDecay);
        };
    }, []);

    return (
        <Canvas
            camera={{
                position: [0, 0, 1500],
                fov: 60,
                near: 1,
                far: 3000,
            }}
            gl={{ antialias: true }}
            {...props}
        >
            <ambientLight intensity={0.5} />
            <GlobeScene mapUrl={mapUrl} userLocation={location} mousePosition={mousePosition} mouseVelocity={mouseVelocity} />
        </Canvas>
    );
}
