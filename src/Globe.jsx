import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Canvas } from "@react-three/fiber";
import * as THREE from "three";
// fetch + post requests
import getLocation from "./api/getLocation";
// Globe component that renders inside Canvas
function GlobeScene({ mapUrl, userLocation, mousePosition, mouseVelocity }) {
    // Load shaders with fallback support
    const shaders = {
        vertex: `            
attribute float isUserDot;
attribute float dotIndex;
varying vec3 vWorldPosition;
varying vec3 vOriginalPosition;
varying float vIsUserDot;
varying vec2 vUv;
varying float vDotIndex;
varying float vDistanceFromUser;
varying float vDistanceFromMouse;
uniform vec3 viewPosition;
uniform vec3 userPosition;
uniform vec3 mouseWorldPosition;
uniform float time;
uniform float mouseVelocity;

void main() {
vIsUserDot = isUserDot;
vUv = uv;
vDotIndex = dotIndex;

// Get the instance position (center of the dot)
vec4 instancePos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
vec3 originalWorldPos = (modelMatrix * instancePos).xyz;
vOriginalPosition = originalWorldPos;
vec3 worldPos = originalWorldPos;

// Calculate distance from user dot for pulse effect
vDistanceFromUser = distance(worldPos, userPosition);

// Calculate distance from mouse for ripple effect
vDistanceFromMouse = distance(worldPos, mouseWorldPosition);

// Billboard the geometry to always face the camera
vec3 cameraDirection = normalize(viewPosition - worldPos);
vec3 up = vec3(0.0, 1.0, 0.0);
vec3 right = normalize(cross(up, cameraDirection));
up = normalize(cross(cameraDirection, right));

// Base dot size - user dot largest, others varied
float dotSize = isUserDot > 0.5 ? 7.0 : (mod(dotIndex, 2.0) < 1.0 ? 2.5 : 1.8);

// Pulse effect from user dot
if (isUserDot < 0.5) {
    float pulseSpeed = 2.0;
    float pulseRadius = mod(time * pulseSpeed, 8.0) * 100.0;
    float pulseWidth = 50.0;
    
    if (abs(vDistanceFromUser - pulseRadius) < pulseWidth) {
        float pulseStrength = 1.0 - abs(vDistanceFromUser - pulseRadius) / pulseWidth;
        dotSize += pulseStrength * 1.5;
    }
}

// DRAMATIC MOUSE RIPPLE EFFECTS - MUCH LARGER AND MORE INTENSE
float baseRippleRadius = 400.0; // Much larger base radius
float velocityMultiplier = 1.0 + mouseVelocity * 2.0; // Velocity amplifies effect
float effectiveRippleRadius = baseRippleRadius * velocityMultiplier;

if (vDistanceFromMouse < effectiveRippleRadius) {
    float proximity = 1.0 - (vDistanceFromMouse / effectiveRippleRadius);
    proximity = smoothstep(0.0, 1.0, proximity);
    
    // Multiple dramatic ripple waves
    float waveIntensity = 1.0 + mouseVelocity * 1.0; // Velocity makes waves more intense
    
    float wave1 = sin(vDistanceFromMouse * 0.008 - time * 12.0) * waveIntensity;
    float wave2 = sin(vDistanceFromMouse * 0.012 - time * 8.0) * waveIntensity * 0.8;
    float wave3 = sin(vDistanceFromMouse * 0.015 - time * 15.0) * waveIntensity * 0.6;
    float wave4 = sin(vDistanceFromMouse * 0.005 - time * 6.0) * waveIntensity * 1.2;
    
    float combinedWave = (wave1 + wave2 + wave3 + wave4) * 0.25;
    float rippleStrength = combinedWave * proximity;
    
    
    // DRAMATIC radial displacement from mouse position
    vec3 displacementDirection = normalize(worldPos - mouseWorldPosition);
    if (length(displacementDirection) > 0.0) {
        // Much larger displacement based on velocity
        float baseDisplacement = 60.0;
        float velocityDisplacement = mouseVelocity * 40.0;
        float displacementAmount = rippleStrength * (baseDisplacement + velocityDisplacement);
        
        worldPos += displacementDirection * displacementAmount;
        
        // Additional chaotic movement for high velocities
        if (mouseVelocity > 0.1) {
            float chaos = sin(time * 4.0 + vDotIndex * 0.1) * mouseVelocity * 10.0;
            vec3 chaosDirection = normalize(vec3(
                sin(vDotIndex * 0.1),
                cos(vDotIndex * 0.1), 
                sin(vDotIndex * 0.1)
            ));
            worldPos += chaosDirection * chaos * proximity;
        }
        
        // Velocity-based radial pulsing
        float velocityPulse = sin(time * 1.0) * mouseVelocity * 30.0;
        worldPos += displacementDirection * velocityPulse * proximity;
    }
    
    // Z-axis displacement for 3D effects
    float zDisplacement = cos(vDistanceFromMouse * 0.1 - time * 0.01) * proximity * (20.0 + mouseVelocity * 5.0);
    worldPos.z -= zDisplacement;
}

// Store final world position
vWorldPosition = worldPos;

// Apply the billboard transformation to the vertex position
vec3 billboardPos = worldPos + (right * position.x + up * position.y) * dotSize;

gl_Position = projectionMatrix * viewMatrix * vec4(billboardPos, 1.0);
}`,
        fragment: `
varying vec3 vWorldPosition;
varying vec3 vOriginalPosition;
varying float vIsUserDot;
varying vec2 vUv;
varying float vDotIndex;
varying float vDistanceFromUser;
varying float vDistanceFromMouse;
uniform vec3 viewPosition;
uniform float time;
uniform float mouseVelocity;

// Shape functions
float octagonShape(vec2 uv) {
uv = abs(uv);
float d = max(uv.x, uv.y);
float corner = (uv.x + uv.y) * 0.7071;
d = max(d, corner);
return 1.0 - smoothstep(0.8, 0.9, d);
}

void main() {
// Calculate how much this dot faces the camera
vec3 viewDirection = normalize(viewPosition);
vec3 dotDirection = normalize(vOriginalPosition);
float facing = dot(dotDirection, viewDirection);

// Fade based on angle - front bright, back dim but visible
float baseFacing = max(0.0, facing);
float opacity = mix(0.15, 1.0, baseFacing);

// Create shape based on facing angle
vec2 centeredUV = (vUv - 0.5) * 2.0;
float shapeAlpha;

if (baseFacing < 0.3) {
shapeAlpha = octagonShape(centeredUV);
} else {
float dist = length(centeredUV);
shapeAlpha = 1.0 - smoothstep(0.8, 1.0, dist);
}

opacity *= shapeAlpha;

// Enhanced color scheme
vec3 color;
if (vIsUserDot > 0.5) {
// User dot - bright red with pulsing
float pulse = sin(time * 3.0) * 0.3 + 0.7;
color = vec3(1.0, 0.0, 0.0) * pulse;
} else {
// Regular dots - varying shades of white/grey
float greyVariation = mod(vDotIndex * 0.1, 1.0);
float greyLevel = mix(0.4, 0.9, greyVariation);

// Pulse effect coloring from user location
float pulseSpeed = 2.0;
float pulseRadius = mod(time * pulseSpeed, 8.0) * 100.0;
float pulseWidth = 50.0;

if (abs(vDistanceFromUser - pulseRadius) < pulseWidth) {
    float pulseStrength = 1.0 - abs(vDistanceFromUser - pulseRadius) / pulseWidth;
    greyLevel = mix(greyLevel, 1.0, pulseStrength * 0.8);
}

// DRAMATIC mouse ripple coloring effects
float baseRippleRadius = 400.0;
float velocityMultiplier = 1.0 + mouseVelocity * 2.0;
float effectiveRippleRadius = baseRippleRadius * velocityMultiplier;

if (vDistanceFromMouse < effectiveRippleRadius) {
    float proximity = 1.0 - (vDistanceFromMouse / effectiveRippleRadius);
    proximity = smoothstep(0.0, 1.0, proximity);
    
    // Dynamic color waves based on velocity
    float colorIntensity = 1.0 + mouseVelocity * 2.0;
    float colorWave1 = sin(vDistanceFromMouse * 0.008 - time * 12.0) * colorIntensity;
    float colorWave2 = sin(vDistanceFromMouse * 0.012 - time * 8.0) * colorIntensity;
    
    // Velocity-based color shifting
    vec3 baseRippleColor = vec3(1, 1, 1.0); // Blue
    vec3 velocityColor = vec3(1.0, 0.3, 0.8); // Hot pink for high velocity
    vec3 rippleColor = mix(baseRippleColor, velocityColor, mouseVelocity * 0.3);
    
    // Add electric effect for high velocity
    if (mouseVelocity > 3.0) {
        float electric = sin(time * 30.0 + vDotIndex * 0.5) * 0.5 + 0.5;
        rippleColor = mix(rippleColor, vec3(1.0, 1.0, 0.0), electric * 0.4); // Yellow electric
    }
    
    // Blend ripple color with base color - much more dramatic
    float colorBlend = proximity * (0.8 + mouseVelocity * 0.2);
    color = mix(vec3(greyLevel), rippleColor, colorBlend);
    
    // MASSIVE brightness boost based on velocity
    float brightnessBoost = 1.0 + proximity * (1.0 + mouseVelocity * 2.0);
    color *= brightnessBoost;
    
    // Make opacity more dramatic too
    opacity *= (1.0 + proximity * mouseVelocity * 0.5);
} else {
    color = vec3(greyLevel);
}
}

// Discard transparent pixels
if (opacity < 0.01) discard;

gl_FragColor = vec4(color, opacity);
}
`,
    };

    const DOT_COUNT = 60000;
    const GLOBE_RADIUS = 600;

    const meshRef = useRef();
    const textMeshRefs = useRef([]);
    const [mapData, setMapData] = useState(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const raycaster = useRef(new THREE.Raycaster());
    const sphereGeometry = useRef(new THREE.SphereGeometry(GLOBE_RADIUS, 32, 32));

    // Camera and rotation controls
    const targetRotation = useRef(new THREE.Euler());
    const currentRotation = useRef(new THREE.Euler());
    const userLocationRotation = useRef(new THREE.Euler());
    const [isUserLocationSet, setIsUserLocationSet] = useState(false);

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

    // Calculate initial rotation to center on user location
    useEffect(() => {
        if (userLocation && userLocation.latitude && userLocation.longitude && !isUserLocationSet) {
            const lat = userLocation.latitude * (Math.PI / 180);
            const lng = userLocation.longitude * (Math.PI / 180);

            // Calculate rotation needed to center user location facing the camera
            // For longitude: rotate around Y-axis to bring the longitude to the front
            // For latitude: rotate around X-axis to bring the latitude to center height
            userLocationRotation.current.y = -lng; // Negative because we want to rotate the globe to bring this point forward
            userLocationRotation.current.x = lat; // Negative to bring the latitude to center (positive lat should be up, so we rotate down)
            userLocationRotation.current.z = 0; // No roll needed

            // Set initial rotation
            targetRotation.current.copy(userLocationRotation.current);
            currentRotation.current.copy(userLocationRotation.current);

            setIsUserLocationSet(true);
            console.log("Centered globe on user location:", userLocation.latitude, userLocation.longitude);
            console.log("Applied rotation:", userLocationRotation.current.x, userLocationRotation.current.y, userLocationRotation.current.z);
        }
    }, [userLocation, isUserLocationSet]);

    // Calculate dot positions from map data - with better user location positioning
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

        // If we have user location, calculate the exact 3D position first
        if (hasValidUserLocation) {
            const userLat = userLocation.latitude * (Math.PI / 180);
            const userLng = userLocation.longitude * (Math.PI / 180);

            // Convert lat/lng directly to 3D coordinates using proper spherical conversion
            // Standard spherical coordinates: phi (polar angle from +Y), theta (azimuthal angle from +Z toward +X)
            const phi = Math.PI / 2 - userLat; // Convert latitude to polar angle (0 to π)
            const theta = userLng; // Longitude is already azimuthal angle (-π to π)

            userPos = new THREE.Vector3();
            userPos.setFromSphericalCoords(GLOBE_RADIUS, phi, theta);

            console.log("Direct user position calculation:");
            console.log("  Lat/Lng:", userLocation.latitude, userLocation.longitude);
            console.log("  Phi/Theta (rad):", phi, theta);
            console.log("  3D Position:", userPos.x, userPos.y, userPos.z);
        }

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
                // Find closest dot to calculated user position if we have valid location
                if (hasValidUserLocation && userPos) {
                    const distance = vector.distanceTo(userPos);
                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestIndex = positions.length;

                        // Debug info for the closest match
                        const lat = Math.asin(vector.y / GLOBE_RADIUS) * (180 / Math.PI);
                        const lng = Math.atan2(vector.x, vector.z) * (180 / Math.PI);
                        console.log("New closest dot found:");
                        console.log("  Distance:", distance);
                        console.log("  Dot lat/lng:", lat, lng);
                        console.log("  Dot 3D pos:", vector.x, vector.y, vector.z);
                    }
                }

                positions.push(vector.clone());
            }
        }

        console.log("Final user dot selection:");
        console.log("  Closest distance:", closestDistance);
        console.log("  User dot index:", closestIndex);
        console.log("  User position:", userPos);

        return {
            positions,
            validDotCount: positions.length,
            userDotIndex: closestIndex,
            userPosition: userPos, // Use the calculated exact position
        };
    }, [mapData, userLocation]);

    // Create text elements for user location
    const textElements = useMemo(() => {
        if (!userLocation || !userLocation.city) return [];

        const textData = [
            {
                text: `${userLocation.city || "Unknown"}, ${userLocation.countryName || "Unknown"}`,
                color: "#ff0000",
                size: 100,
                offset: 40,
            },
            {
                text: userLocation.ip || "N/A",
                color: "#ffffff",
                size: 60,
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
        if (!shaders) {
            console.log("No shaders available, creating basic material");
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

    // Animation loop with mouse-based rotation controls
    useFrame(({ camera, clock }, delta) => {
        if (meshRef.current && shaderMaterial) {
            const time = clock.elapsedTime;

            // Mouse-based rotation controls
            if (isUserLocationSet) {
                // Define sensitivity for mouse movement
                const mouseSensitivity = 0.3;

                // Calculate target rotation based on mouse position relative to user location center
                const mouseInfluenceX = mousePosition.x * mouseSensitivity;
                const mouseInfluenceY = mousePosition.y * mouseSensitivity;

                // Update target rotation: start from user location rotation and add mouse influence
                targetRotation.current.y = userLocationRotation.current.y + mouseInfluenceX;
                targetRotation.current.x = userLocationRotation.current.x + mouseInfluenceY;

                // Smooth interpolation to target rotation
                const rotationSpeed = 3.0 * delta;
                currentRotation.current.x = THREE.MathUtils.lerp(currentRotation.current.x, targetRotation.current.x, rotationSpeed);
                currentRotation.current.y = THREE.MathUtils.lerp(currentRotation.current.y, targetRotation.current.y, rotationSpeed);

                // Apply the rotation to the mesh
                meshRef.current.rotation.copy(currentRotation.current);
            } else {
                // Fallback: slow automatic rotation if user location not set
                meshRef.current.rotation.y += delta * 0.15;
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

        // Update text positioning with current globe rotation
        if (userPosition && textMeshRefs.current.length > 0) {
            const rotatedUserPosition = userPosition.clone();
            if (meshRef.current) {
                rotatedUserPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), meshRef.current.rotation.y);
                rotatedUserPosition.applyAxisAngle(new THREE.Vector3(1, 0, 0), meshRef.current.rotation.x);
            }

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
        <group rotation={[0, 0, 0]}>
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
                position: [0, 0, 1200],
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
