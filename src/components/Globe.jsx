import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function GlobeDots({ mapUrl = "map.jpg", userLocation = { latitude: 51.5828, longitude: -0.3448 }, ...props }) {
    const DOT_COUNT = 60000;
    const meshRef = useRef();
    const pinRef = useRef();
    const textMeshRefs = useRef([]);
    const [mapData, setMapData] = useState(null);
    const { size } = useThree();
    const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
    const [mouseVelocity, setMouseVelocity] = useState(0);
    const raycaster = useRef(new THREE.Raycaster());
    const sphereGeometry = useRef(new THREE.SphereGeometry(600, 32, 32));
    const lastMousePosition = useRef(new THREE.Vector2());
    const lastMouseTime = useRef(Date.now());

    // Load and process the map image
    useEffect(() => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, img.width, img.height);
            setMapData(imageData);
        };

        img.src = mapUrl;
    }, [mapUrl]);

    // Global mouse tracking that works even with overlaying HTML elements
    useEffect(() => {
        const handleMouseMove = (event) => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastMouseTime.current;

            // Convert to normalized device coordinates
            const x = (event.clientX / size.width) * 2 - 1;
            const y = -(event.clientY / size.height) * 2 + 1;
            const newMousePos = new THREE.Vector2(x, y);

            // Calculate mouse velocity
            if (deltaTime > 0) {
                const distance = newMousePos.distanceTo(lastMousePosition.current);
                const velocity = distance / (deltaTime * 0.001); // pixels per second
                setMouseVelocity(Math.min(velocity * 0.01, 10)); // Normalize and cap
            }

            setMousePosition(newMousePos);
            lastMousePosition.current.copy(newMousePos);
            lastMouseTime.current = currentTime;
        };

        // Listen on document to bypass z-index issues
        document.addEventListener("mousemove", handleMouseMove);
        return () => document.removeEventListener("mousemove", handleMouseMove);
    }, [size]);

    // Calculate positions for entire globe (both sides)
    const { positions, validDotCount, userDotIndex, userPosition } = useMemo(() => {
        if (!mapData) return { positions: [], validDotCount: 0, userDotIndex: -1, userPosition: null };

        const positions = [];
        const vector = new THREE.Vector3();
        let closestDistance = Infinity;
        let closestIndex = -1;
        let userPos = null;

        for (let i = 0; i < DOT_COUNT; i++) {
            const phi = Math.acos(-1 + (2 * i) / DOT_COUNT);
            const theta = Math.sqrt(DOT_COUNT * Math.PI) * phi;
            vector.setFromSphericalCoords(600, phi, theta);

            // Convert 3D position to UV coordinates
            const u = 0.5 + Math.atan2(vector.x, vector.z) / (2 * Math.PI);
            const v = 0.5 - Math.asin(vector.y / 600) / Math.PI;

            // Sample the map image
            const x = Math.floor(u * mapData.width);
            const y = Math.floor(v * mapData.height);
            const index = (y * mapData.width + x) * 4;

            // Check if pixel has data (not transparent/black)
            const r = mapData.data[index];
            const g = mapData.data[index + 1];
            const b = mapData.data[index + 2];

            // if black then it's land
            if (!(r > 10 || g > 10 || b > 10)) {
                // Convert vector back to lat/lng for distance calculation
                const lat = Math.asin(vector.y / 600) * (180 / Math.PI);
                const lng = Math.atan2(vector.x, vector.z) * (180 / Math.PI);

                // If we have user location, find closest dot
                if (userLocation) {
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

        return { positions, validDotCount: positions.length, userDotIndex: closestIndex, userPosition: userPos };
    }, [mapData, userLocation]);

    // Text geometries and materials
    const textElements = useMemo(() => {
        if (!userLocation) return [];

        const textData = [
            { text: `${userLocation.city || "Unknown"}, ${userLocation.countryName || "Unknown"}`, color: "#ffffff", size: 300, offset: 40 },
            { text: userLocation.ip || "N/A", color: "#ef0915", size: 300, offset: 0 },
        ];

        return textData.map(({ text, color, size, offset }) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            canvas.width = Math.max(256, text.length * size * 0.6);
            canvas.height = size * 2;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.font = `bold ${size}px Arial, sans-serif`;
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

            const width = canvas.width / 8;
            const height = canvas.height / 8;
            const geometry = new THREE.PlaneGeometry(width, height);

            return { geometry, material, offset, texture };
        });
    }, [userLocation]);

    // Highly dramatic shader material with velocity-based ripple effects
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: `
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
                    float dotSize = isUserDot > 0.5 ? 4.0 : (mod(dotIndex, 2.0) < 1.0 ? 2.5 : 1.8);
                    
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
                }
            `,
            fragmentShader: `
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
            uniforms: {
                viewPosition: { value: new THREE.Vector3() },
                userPosition: { value: new THREE.Vector3() },
                mouseWorldPosition: { value: new THREE.Vector3() },
                time: { value: 0.0 },
                mouseVelocity: { value: 0.0 },
            },
        });
    }, []);

    // Set up instance matrices
    useEffect(() => {
        if (!meshRef.current || positions.length === 0) return;

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
    }, [positions, validDotCount, userDotIndex]);

    useFrame(({ camera, clock }, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5;

            // Update shader uniforms
            shaderMaterial.uniforms.viewPosition.value.copy(camera.position);
            shaderMaterial.uniforms.time.value = clock.elapsedTime;
            shaderMaterial.uniforms.mouseVelocity.value = mouseVelocity;

            // Project mouse position onto sphere for ripple effects
            raycaster.current.setFromCamera(mousePosition, camera);
            const sphereMesh = new THREE.Mesh(sphereGeometry.current);
            sphereMesh.rotation.copy(meshRef.current.rotation);

            const intersects = raycaster.current.intersectObject(sphereMesh);
            if (intersects.length > 0) {
                const intersectionPoint = intersects[0].point;
                shaderMaterial.uniforms.mouseWorldPosition.value.copy(intersectionPoint);
            }

            // Update user position for pulse effect
            if (userPosition) {
                shaderMaterial.uniforms.userPosition.value.copy(userPosition);
            }
        }

        // Update text elements to follow rotating globe position and always face camera
        if (userPosition && textMeshRefs.current.length > 0) {
            // Calculate the current rotated position of the user dot
            const rotatedUserPosition = userPosition.clone();
            rotatedUserPosition.applyAxisAngle(new THREE.Vector3(0, 1, 0), meshRef.current.rotation.y);

            // Position text elements relative to the rotated user position
            textMeshRefs.current.forEach((textMesh, i) => {
                if (textMesh && textElements[i]) {
                    // Calculate offset from user position
                    const offset = 140; // Distance from globe surface
                    const textOffset = textElements[i].offset; // Vertical offset between text elements

                    // Position text at offset distance from globe surface
                    const direction = rotatedUserPosition.clone().normalize();
                    const textPosition = direction.multiplyScalar(600 + offset).add(new THREE.Vector3(0, textOffset, 0));

                    textMesh.position.copy(textPosition);

                    // Make text always face the camera
                    textMesh.lookAt(camera.position);
                }
            });
        }
    });

    if (!mapData || positions.length === 0) return null;

    return (
        <group {...props} rotation={[0.6, 0, 0]}>
            {/* Globe dots */}
            <instancedMesh ref={meshRef} args={[null, null, validDotCount]} material={shaderMaterial}>
                <planeGeometry args={[2, 2]} />
            </instancedMesh>

            {/* User location text - now outside the rotating pin group */}
            {userLocation && userPosition && textElements.map((textElement, i) => <mesh key={i} ref={(el) => (textMeshRefs.current[i] = el)} geometry={textElement.geometry} material={textElement.material} />)}
        </group>
    );
}
