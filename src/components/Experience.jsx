"use client";

import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Plane, useVideoTexture } from "@react-three/drei";
import React, { Suspense, useEffect, useMemo, useRef } from "react";

/********************
 * GLSL SHADERS
 ********************/
const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec2 vUv;
  uniform sampler2D u_texture;
  uniform vec2 u_mouse;
  uniform vec2 u_prevMouse;
  uniform float u_aberrationIntensity;
  uniform float u_saturation;       // 0 = grayscale, 1 = full color
  uniform float u_shadowStrength;   // 0..1 amount of inner-edge darkening
  uniform float u_shadowWidth;      // how far inward the edge shadow fades
  uniform float u_brightness;       // 1.0 = original, <1 darker, >1 brighter
  uniform float u_warmth;           // -1..1, positive pushes warmer (more R/less B)

  void main() {
    // Pixelate into a 20x20 grid (same as original)
    vec2 gridUV = floor(vUv * vec2(20.0, 20.0)) / vec2(20.0, 20.0);
    vec2 centerOfPixel = gridUV + vec2(1.0/20.0, 1.0/20.0);

    // Mouse motion direction & per-pixel distance falloff
    vec2 mouseDirection = u_mouse - u_prevMouse;
    vec2 pixelToMouseDirection = centerOfPixel - u_mouse;
    float pixelDistanceToMouse = length(pixelToMouseDirection);
    float strength = smoothstep(0.3, 0.0, pixelDistanceToMouse);

    // Offset UVs opposite to mouse motion
    vec2 uvOffset = strength * -mouseDirection * 0.2;
    vec2 uv = vUv - uvOffset;

    // Simple RGB split based on strength and intensity
    vec4 colorR = texture2D(u_texture, uv + vec2(strength * u_aberrationIntensity * 0.01, 0.0));
    vec4 colorG = texture2D(u_texture, uv);
    vec4 colorB = texture2D(u_texture, uv - vec2(strength * u_aberrationIntensity * 0.01, 0.0));

    vec3 rgb = vec3(colorR.r, colorG.g, colorB.b);

    // --- Desaturation (luma mix) ---
    float luma = dot(rgb, vec3(0.2126, 0.7152, 0.0722));
    rgb = mix(vec3(luma), rgb, clamp(u_saturation, 0.0, 1.0));

    // --- Warmth & Brightness ---
    float w = clamp(u_warmth, -1.0, 1.0);
    // push red up, blue down, slight green lift for natural warmth
    rgb.r *= (1.0 + 0.25 * w);
    rgb.g *= (1.0 + 0.10 * w);
    rgb.b *= (1.0 - 0.25 * w);
    // overall brightness scalar
    rgb *= clamp(u_brightness, 0.0, 2.0);

    // --- Inner-edge "shadow" to make surrounding text pop ---
    float edgeDist = min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y));
    float edgeFactor = smoothstep(0.0, u_shadowWidth, edgeDist);
    rgb *= mix(1.0 - u_shadowStrength, 1.0, edgeFactor);

    gl_FragColor = vec4(clamp(rgb, 0.0, 1.0), 1.0);
  }
`;

/********************
 * Shader material that samples a VIDEO texture
 ********************/
function ShaderVideoMaterial({ src, saturation = 0.35, shadowStrength = 0.18, shadowWidth = 0.08, brightness = 0.88, warmth = 0.15 }, ref) {
    const videoTexture = useVideoTexture(src);
    const materialRef = useRef();

    const uniforms = useMemo(
        () => ({
            u_texture: { value: null },
            u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_prevMouse: { value: new THREE.Vector2(0.5, 0.5) },
            u_aberrationIntensity: { value: 0.0 },
            u_saturation: { value: saturation },
            u_shadowStrength: { value: shadowStrength },
            u_shadowWidth: { value: shadowWidth },
            u_brightness: { value: brightness },
            u_warmth: { value: warmth },
        }),
        []
    );

    useEffect(() => {
        if (videoTexture) {
            if ("colorSpace" in videoTexture) {
                videoTexture.colorSpace = THREE.SRGBColorSpace;
            } else {
                // @ts-ignore older three
                videoTexture.encoding = THREE.sRGBEncoding;
            }
            uniforms.u_texture.value = videoTexture;
        }
    }, [videoTexture, uniforms]);

    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.u_saturation.value = saturation;
            materialRef.current.uniforms.u_shadowStrength.value = shadowStrength;
            materialRef.current.uniforms.u_shadowWidth.value = shadowWidth;
            materialRef.current.uniforms.u_brightness.value = brightness;
            materialRef.current.uniforms.u_warmth.value = warmth;
        }
    }, [saturation, shadowStrength, shadowWidth, brightness, warmth]);

    React.useImperativeHandle(ref, () => materialRef.current, []);

    return <shaderMaterial ref={materialRef} key={fragmentShader} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} transparent={false} depthWrite={true} toneMapped={false} />;
}

const ForwardShaderVideoMaterial = React.forwardRef(ShaderVideoMaterial);

/********************
 * Child component INSIDE <Canvas/> that uses useFrame
 ********************/
function AberrationVideoPlane({ src, saturation, shadowStrength, shadowWidth, brightness, warmth }) {
    // Easing & mouse state (kept in refs to avoid rerenders)
    const easeFactor = useRef(0.02);
    const mouse = useRef(new THREE.Vector2(0.5, 0.5));
    const targetMouse = useRef(new THREE.Vector2(0.5, 0.5));
    const prevTarget = useRef(new THREE.Vector2(0.5, 0.5));
    const aberration = useRef(0.0);

    const materialRef = useRef();
    const planeRef = useRef();
    const raycasterRef = useRef(new THREE.Raycaster());
    const ndc = useRef(new THREE.Vector2());
    const { camera, gl } = useThree();

    // Per-frame updates for easing and uniform animation
    useFrame(() => {
        mouse.current.x += (targetMouse.current.x - mouse.current.x) * easeFactor.current;
        mouse.current.y += (targetMouse.current.y - mouse.current.y) * easeFactor.current;

        aberration.current = Math.max(0.0, aberration.current - 0.05);

        if (materialRef.current) {
            materialRef.current.uniforms.u_mouse.value.set(mouse.current.x, 1.0 - mouse.current.y);
            materialRef.current.uniforms.u_prevMouse.value.set(prevTarget.current.x, 1.0 - prevTarget.current.y);
            materialRef.current.uniforms.u_aberrationIntensity.value = aberration.current;
        }
    });

    // Global pointer tracking via raycast so overlays/z-index don't block
    useEffect(() => {
        const handleMove = (e) => {
            const rect = gl.domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            ndc.current.set(x, y);
            raycasterRef.current.setFromCamera(ndc.current, camera);
            const hit = planeRef.current ? raycasterRef.current.intersectObject(planeRef.current, false) : [];
            if (hit.length && hit[0].uv) {
                easeFactor.current = 0.02;
                prevTarget.current.copy(targetMouse.current);
                targetMouse.current.set(hit[0].uv.x, hit[0].uv.y);
                aberration.current = 1.0;
            }
        };

        const handleLeave = () => {
            easeFactor.current = 0.05;
            targetMouse.current.copy(prevTarget.current);
        };

        // Use pointer events, capture phase, and mirror options on remove
        const opts = { capture: true };
        window.addEventListener("pointermove", handleMove, opts);
        window.addEventListener("pointerleave", handleLeave, opts);
        window.addEventListener("blur", handleLeave, opts);

        return () => {
            window.removeEventListener("pointermove", handleMove, opts);
            window.removeEventListener("pointerleave", handleLeave, opts);
            window.removeEventListener("blur", handleLeave, opts);
        };
    }, [camera, gl]);

    return (
        <Plane ref={planeRef} position-y={0} scale={[1.69, 1, 1]}>
            <Suspense fallback={<meshStandardMaterial wireframe={false} />}>
                <ForwardShaderVideoMaterial ref={materialRef} src={src} saturation={saturation} shadowStrength={shadowStrength} shadowWidth={shadowWidth} brightness={brightness} warmth={warmth} />
            </Suspense>
        </Plane>
    );
}

/********************
 * EXPERIENCE (R3F scene)
 ********************/
export default function Experience({ src, saturation = 0.35, shadowStrength = 0.18, shadowWidth = 0.08, brightness = 0.88, warmth = 0.15 }) {
    // IMPORTANT: No R3F hooks (like useFrame) are called here,
    // only inside children rendered within <Canvas/>.
    return (
        <div className="video" style={{ width: "100%", height: "100%" }}>
            <Canvas camera={{ position: [0, 0, 0.5], fov: 80 }} dpr={[1, 2]}>
                <AberrationVideoPlane src={src} saturation={saturation} shadowStrength={shadowStrength} shadowWidth={shadowWidth} brightness={brightness} warmth={warmth} />
                <Environment preset="forest" />
            </Canvas>
        </div>
    );
}

/********************
 * USAGE
 * <Experience src="/path/to/video.mp4" />
 ********************/
