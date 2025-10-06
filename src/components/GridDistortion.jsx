import { useRef, useEffect } from "react";
import * as THREE from "three";

const vertexShader = `
uniform float time;
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform sampler2D uCharTexture;
uniform vec4 resolution;
uniform bool uAsciiMode;
uniform bool uInvertColors;
uniform float uAsciiSize;
varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec4 offset = texture2D(uDataTexture, vUv);
    vec2 distortedUv = uv - 0.02 * offset.rg;
    
    vec4 color = texture2D(uTexture, distortedUv);
    
    if (uInvertColors) {
        color.rgb = 1.0 - color.rgb;
    }
    
    if (uAsciiMode) {
        // Pixelate the UV coordinates
        vec2 cellSize = vec2(1.0) / uAsciiSize;
        vec2 cell = floor(distortedUv / cellSize) * cellSize + cellSize * 0.5;
        
        // Sample the pixelated color
        vec4 pixelColor = texture2D(uTexture, cell);
        if (uInvertColors) {
            pixelColor.rgb = 1.0 - pixelColor.rgb;
        }
        
        // Calculate brightness
        float brightness = dot(pixelColor.rgb, vec3(0.299, 0.587, 0.114));
        
        // Map brightness to character index (0-9 characters)
        float charIndex = floor(brightness * 10.0);
        charIndex = clamp(charIndex, 0.0, 9.0);
        
        // Calculate position within the current cell
        vec2 cellPos = mod(distortedUv, cellSize) / cellSize;
        
        // Calculate UV coordinates for the character texture
        // Character texture is 10x1 (10 characters in a row)
        float charWidth = 1.0 / 10.0;
        vec2 charUv = vec2(
            (charIndex * charWidth) + (cellPos.x * charWidth),
            cellPos.y
        );
        
        // Sample the character texture
        float charMask = texture2D(uCharTexture, charUv).r;
        
		vec3 gray = vec3(brightness);

		// Apply the ASCII mask
		if (charMask > 0.5) {
			color.rgb = gray;
		} else {
			color.rgb = vec3(0.0); // dark background
		}
	}
    
    gl_FragColor = color;
}`;

export default function GridDistortion({ grid = 15, mouse = 0.1, strength = 0.15, relaxation = 0.9, imageSrc, className = "", asciiMode = false, invertColors = false, asciiSize = 50.0, onImageLoad }) {
    const containerRef = useRef(null);
    const sceneRef = useRef(null);
    const rendererRef = useRef(null);
    const cameraRef = useRef(null);
    const planeRef = useRef(null);
    const imageAspectRef = useRef(1);
    const animationIdRef = useRef(null);
    const resizeObserverRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        const scene = new THREE.Scene();
        sceneRef.current = scene;

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true,
            powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;

        container.innerHTML = "";
        container.appendChild(renderer.domElement);

        const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
        camera.position.z = 2;
        cameraRef.current = camera;

        const uniforms = {
            time: { value: 0 },
            resolution: { value: new THREE.Vector4() },
            uTexture: { value: null },
            uDataTexture: { value: null },
            uCharTexture: { value: null },
            uAsciiMode: { value: asciiMode },
            uInvertColors: { value: invertColors },
            uAsciiSize: { value: asciiSize },
        };

        const geometry = new THREE.PlaneGeometry(1, 1, grid - 1, grid - 1);
        const material = new THREE.ShaderMaterial({
            side: THREE.DoubleSide,
            uniforms,
            vertexShader,
            fragmentShader,
            transparent: true,
        });

        const plane = new THREE.Mesh(geometry, material);
        planeRef.current = plane;
        scene.add(plane);

        const textureLoader = new THREE.TextureLoader();

        // Create ASCII character texture
        const createCharTexture = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const chars = " .:-=+*#%@"; // From dark to light
            const charSize = 32;

            canvas.width = chars.length * charSize;
            canvas.height = charSize;

            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "white";
            ctx.font = `${charSize}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            for (let i = 0; i < chars.length; i++) {
                ctx.fillText(chars[i], i * charSize + charSize / 2, charSize / 2);
            }

            const texture = new THREE.CanvasTexture(canvas);
            texture.magFilter = THREE.NearestFilter;
            texture.minFilter = THREE.NearestFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            return texture;
        };

        uniforms.uCharTexture.value = createCharTexture();

        textureLoader.load(imageSrc, (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.wrapS = THREE.ClampToEdgeWrapping;
            texture.wrapT = THREE.ClampToEdgeWrapping;
            imageAspectRef.current = texture.image.width / texture.image.height;
            uniforms.uTexture.value = texture;
            handleResize();

            // Notify parent component about the loaded image aspect ratio
            if (onImageLoad) {
                onImageLoad(imageAspectRef.current);
            }
        });

        const size = grid;
        const data = new Float32Array(4 * size * size);
        for (let i = 0; i < size * size; i++) {
            data[i * 4] = Math.random() * 255 - 125;
            data[i * 4 + 1] = Math.random() * 255 - 125;
        }

        const dataTexture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
        dataTexture.needsUpdate = true;
        uniforms.uDataTexture.value = dataTexture;

        const handleResize = () => {
            console.log("something happened");
            if (!container || !renderer || !camera) return;

            const rect = container.getBoundingClientRect();
            const width = rect.width;
            const height = rect.height;

            if (width === 0 || height === 0) return;

            const containerAspect = width / height;
            const imageAspect = imageAspectRef.current;

            renderer.setSize(width, height);

            // Simple scaling: fit image to container while maintaining aspect ratio

            plane.scale.set(1, containerAspect / imageAspect, 1);

            const frustumHeight = 1;
            const frustumWidth = frustumHeight * containerAspect;
            camera.left = -frustumWidth / 2;
            camera.right = frustumWidth / 2;
            camera.top = frustumHeight / 2;
            camera.bottom = -frustumHeight / 2;
            camera.updateProjectionMatrix();

            uniforms.resolution.value.set(width, height, 1, 1);
        };

        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
                handleResize();
            });
            resizeObserver.observe(container);
            resizeObserverRef.current = resizeObserver;
        } else {
            window.addEventListener("resize", handleResize);
        }

        const mouseState = {
            x: 0,
            y: 0,
            prevX: 0,
            prevY: 0,
            vX: 0,
            vY: 0,
        };

        const handleMouseMove = (e) => {
            const rect = container.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = 1 - (e.clientY - rect.top) / rect.height;
            mouseState.vX = x - mouseState.prevX;
            mouseState.vY = y - mouseState.prevY;
            Object.assign(mouseState, { x, y, prevX: x, prevY: y });
        };

        const handleMouseLeave = () => {
            if (dataTexture) {
                dataTexture.needsUpdate = true;
            }
            Object.assign(mouseState, {
                x: 0,
                y: 0,
                prevX: 0,
                prevY: 0,
                vX: 0,
                vY: 0,
            });
        };

        container.addEventListener("mousemove", handleMouseMove);
        container.addEventListener("mouseleave", handleMouseLeave);

        handleResize();

        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);

            if (!renderer || !scene || !camera) return;

            uniforms.time.value += 0.05;

            // Update uniforms dynamically
            uniforms.uAsciiMode.value = asciiMode;
            uniforms.uInvertColors.value = invertColors;
            uniforms.uAsciiSize.value = asciiSize;

            const data = dataTexture.image.data;
            for (let i = 0; i < size * size; i++) {
                data[i * 4] *= relaxation;
                data[i * 4 + 1] *= relaxation;
            }

            const gridMouseX = size * mouseState.x;
            const gridMouseY = size * mouseState.y;
            const maxDist = size * mouse;

            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    const distSq = Math.pow(gridMouseX - i, 2) + Math.pow(gridMouseY - j, 2);
                    if (distSq < maxDist * maxDist) {
                        const index = 4 * (i + size * j);
                        const power = Math.min(maxDist / Math.sqrt(distSq), 10);
                        data[index] += strength * 100 * mouseState.vX * power;
                        data[index + 1] -= strength * 100 * mouseState.vY * power;
                    }
                }
            }

            dataTexture.needsUpdate = true;
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }

            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            } else {
                window.removeEventListener("resize", handleResize);
            }

            container.removeEventListener("mousemove", handleMouseMove);
            container.removeEventListener("mouseleave", handleMouseLeave);

            if (renderer) {
                renderer.dispose();
                if (container.contains(renderer.domElement)) {
                    container.removeChild(renderer.domElement);
                }
            }

            if (geometry) geometry.dispose();
            if (material) material.dispose();
            if (dataTexture) dataTexture.dispose();
            if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();
            if (uniforms.uCharTexture.value) uniforms.uCharTexture.value.dispose();

            sceneRef.current = null;
            rendererRef.current = null;
            cameraRef.current = null;
            planeRef.current = null;
        };
    }, [grid, mouse, strength, relaxation, imageSrc, asciiMode, invertColors, asciiSize]);

    return (
        <div
            ref={containerRef}
            className={`distortion-container ${className}`}
            style={{
                width: "100%",
                minWidth: "0",
                minHeight: "0",
            }}
        />
    );
}
