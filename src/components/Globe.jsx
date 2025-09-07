import React, { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function GlobeDots({ mapUrl = "map.jpg", userLocation = { latitude: 51.5828, longitude: -0.3448 }, ...props }) {
    const DOT_COUNT = 60000;
    const meshRef = useRef();
    const pinRef = useRef();
    const textMeshRefs = useRef([]);
    const [mapData, setMapData] = useState(null);

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
            const u = 0.5 + Math.atan2(vector.z, vector.x) / (2 * Math.PI);
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
                const lng = Math.atan2(vector.z, vector.x) * (180 / Math.PI);

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

    // Pin geometry and materials
    const pinGeometry = useMemo(() => {
        const geometry = new THREE.CylinderGeometry(1, 1, 120, 8);
        return geometry;
    }, []);

    const pinMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: `
                varying vec3 vWorldPosition;
                varying float vHeight;
                
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                    vHeight = position.y;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vWorldPosition;
                varying float vHeight;
                uniform float time;
                
                void main() {
                    // Create a pulsing effect
                    float pulse = sin(time * 3.0) * 0.3 + 0.7;
                    
                    // Fade towards the top
                    float heightFade = smoothstep(-60.0, 60.0, vHeight);
                    
                    // Tron-like cyan color
                    vec3 color = vec3(0.0, 1.0, 1.0);
                    float opacity = heightFade * pulse * 0.8;
                    
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            uniforms: {
                time: { value: 0 },
            },
        });
    }, []);

    // Text geometries and materials - fix the text rendering
    const textElements = useMemo(() => {
        if (!userLocation) return [];

        const textData = [
            { text: userLocation.ip || "N/A", color: "#00ffff", size: 32, offset: 20 },
            { text: `${userLocation.city || "Unknown"}, ${userLocation.countryName || "Unknown"}`, color: "#ffffff", size: 24, offset: 0 },
            { text: `${userLocation.latitude?.toFixed(4) || "0.0000"}, ${userLocation.longitude?.toFixed(4) || "0.0000"}`, color: "#888888", size: 18, offset: -20 },
        ];

        return textData.map(({ text, color, size, offset }) => {
            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");

            // Set canvas size based on text length
            canvas.width = Math.max(256, text.length * size * 0.6);
            canvas.height = size * 2;

            // Clear canvas
            context.clearRect(0, 0, canvas.width, canvas.height);

            // Set font and style
            context.font = `bold ${size}px Arial, sans-serif`;
            context.fillStyle = color;
            context.textAlign = "center";
            context.textBaseline = "middle";

            // Draw text
            context.fillText(text, canvas.width / 2, canvas.height / 2);

            // Create texture
            const texture = new THREE.CanvasTexture(canvas);
            texture.needsUpdate = true;

            // Create material
            const material = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.1,
                side: THREE.DoubleSide,
            });

            // Create geometry - scale based on text length
            const width = canvas.width / 8; // Scale down
            const height = canvas.height / 8;
            const geometry = new THREE.PlaneGeometry(width, height);

            return { geometry, material, offset, texture };
        });
    }, [userLocation]);

    // Custom shader material with billboarding and distance-based fading
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            vertexShader: `
                attribute float isUserDot;
                varying vec3 vWorldPosition;
                varying float vIsUserDot;
                uniform vec3 viewPosition;
                
                void main() {
                    vIsUserDot = isUserDot;
                    
                    // Get the instance position (center of the dot)
                    vec4 instancePos = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
                    vWorldPosition = (modelMatrix * instancePos).xyz;
                    
                    // Billboard the geometry to always face the camera
                    vec3 worldPos = vWorldPosition;
                    vec3 cameraDirection = normalize(viewPosition - worldPos);
                    vec3 up = vec3(0.0, 1.0, 0.0);
                    vec3 right = normalize(cross(up, cameraDirection));
                    up = normalize(cross(cameraDirection, right));
                    
                    // Make user dot slightly larger
                    float dotSize = isUserDot > 0.5 ? 3.0 : 2.0;
                    
                    // Apply the billboard transformation to the vertex position
                    vec3 billboardPos = worldPos + (right * position.x + up * position.y) * dotSize;
                    
                    gl_Position = projectionMatrix * viewMatrix * vec4(billboardPos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec3 vWorldPosition;
                varying float vIsUserDot;
                uniform vec3 viewPosition;
                
                void main() {
                    // Calculate how much this dot faces the camera based on its position on the sphere
                    vec3 viewDirection = normalize(viewPosition);
                    vec3 dotDirection = normalize(vWorldPosition);
                    float facing = dot(dotDirection, viewDirection);
                    
                    // Fade based on angle - front bright, back dim but visible
                    float opacity = mix(0.2, 1.0, max(0.0, facing));
                    
                    // Color: red for user dot, green for others
                    vec3 color = vIsUserDot > 0.5 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.5);
                    
                    gl_FragColor = vec4(color, opacity);
                }
            `,
            uniforms: {
                viewPosition: { value: new THREE.Vector3() },
            },
        });
    }, []);

    // Set up instance matrices
    useEffect(() => {
        if (!meshRef.current || positions.length === 0) return;

        const matrix = new THREE.Matrix4();
        const userDotFlags = new Float32Array(validDotCount);

        positions.forEach((position, i) => {
            matrix.setPosition(position);
            meshRef.current.setMatrixAt(i, matrix);

            // Mark user dot
            userDotFlags[i] = i === userDotIndex ? 1.0 : 0.0;
        });

        meshRef.current.geometry.setAttribute("isUserDot", new THREE.InstancedBufferAttribute(userDotFlags, 1));
        meshRef.current.instanceMatrix.needsUpdate = true;
    }, [positions, validDotCount, userDotIndex]);

    useFrame(({ camera }, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta;
            // Update camera position for shader
            shaderMaterial.uniforms.viewPosition.value.copy(camera.position);
        }

        // Update pin material time uniform for animation
        if (pinMaterial.uniforms.time) {
            pinMaterial.uniforms.time.value += delta;
        }

        // Rotate pin group with globe
        if (pinRef.current) {
            pinRef.current.rotation.y += delta;
        }

        // Billboard text elements to face camera
        textMeshRefs.current.forEach((textMesh) => {
            if (textMesh) {
                textMesh.lookAt(camera.position);
            }
        });
    });

    if (!mapData || positions.length === 0) return null;

    return (
        <group {...props} rotation={[0.6, 0, 0]}>
            {/* Globe dots */}
            <instancedMesh ref={meshRef} args={[null, null, validDotCount]} material={shaderMaterial}>
                <circleGeometry args={[2, 6]} />
            </instancedMesh>

            {/* User location pin and info */}
            {userLocation && userPosition && (
                <group ref={pinRef}>
                    {/* Vertical pin */}
                    <mesh
                        geometry={pinGeometry}
                        material={pinMaterial}
                        position={[
                            userPosition.x + (userPosition.x / 600) * 60, // Offset outward from surface
                            userPosition.y + (userPosition.y / 600) * 60,
                            userPosition.z + (userPosition.z / 600) * 60,
                        ]}
                        lookAt={[0, 0, 0]} // Point towards globe center
                    />

                    {/* Text labels using canvas textures */}
                    {textElements.map((textElement, i) => (
                        <mesh key={i} ref={(el) => (textMeshRefs.current[i] = el)} geometry={textElement.geometry} material={textElement.material} position={[userPosition.x + (userPosition.x / 600) * 140, userPosition.y + (userPosition.y / 600) * 140 + textElement.offset, userPosition.z + (userPosition.z / 600) * 140]} />
                    ))}
                </group>
            )}
        </group>
    );
}
