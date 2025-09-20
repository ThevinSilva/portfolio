
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
