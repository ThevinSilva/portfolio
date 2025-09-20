
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
