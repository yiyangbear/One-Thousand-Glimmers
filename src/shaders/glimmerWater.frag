precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform float uDensity;
uniform float uGlimmerSize;
uniform float uFlickerSpeed;
uniform float uHighlightIntensity;
uniform float uClustering;
uniform float uBloomIntensity;
uniform float uWaveStrength;
uniform float uFinePointRatio;
uniform float uWaterContrast;
uniform float uReflectionBandWidth;
uniform float uLocalCorrelation;

varying vec2 vUv;

const float PI = 3.14159265359;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
  float n = hash21(p);
  return vec2(n, hash21(p + n + 19.19));
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x),
    f.y
  );
}

float quietFbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.55;
  mat2 rotation = mat2(0.82, 0.57, -0.57, 0.82);

  for (int octave = 0; octave < 4; octave++) {
    value += amplitude * valueNoise(p);
    p = rotation * p * 2.03 + 7.31;
    amplitude *= 0.48;
  }

  return value;
}

float directionalRipple(vec2 p, float time) {
  vec2 direction = normalize(vec2(0.18, 0.98));
  vec2 across = vec2(-direction.y, direction.x);
  float warp = sin(dot(p, across) * 7.5 + time * 0.08) * 0.55;
  float primary = sin(dot(p, direction) * 58.0 + warp - time * 0.42);
  float secondary = sin(dot(p, direction) * 81.0 + sin(dot(p, across) * 11.0 - 1.4) * 0.35 - time * 0.55) * 0.45;
  float crossing = sin(dot(p, normalize(vec2(0.27, 0.96))) * 37.0 + time * 0.26) * 0.22;
  return (primary + secondary + crossing) / 1.67;
}

float waterHeight(vec2 p, float time) {
  vec2 warped = p + vec2(
    sin(p.y * 4.3 + time * 0.09),
    sin(p.x * 3.1 - time * 0.07)
  ) * 0.025;
  float broad = sin(dot(warped, normalize(vec2(0.84, 0.54))) * 8.5 + time * 0.17) * 0.46;
  broad += sin(dot(warped, normalize(vec2(-0.63, 0.78))) * 14.0 - time * 0.21 + 1.7) * 0.28;
  float middle = sin(dot(warped, normalize(vec2(0.25, 0.97))) * 31.0 + time * 0.34 + sin(p.x * 3.0)) * 0.17;
  float fine = directionalRipple(warped, time) * 0.105;
  return broad + middle + fine;
}

vec2 waterSlope(vec2 p, float time) {
  const float epsilon = 0.0025;
  float left = waterHeight(p - vec2(epsilon, 0.0), time);
  float right = waterHeight(p + vec2(epsilon, 0.0), time);
  float down = waterHeight(p - vec2(0.0, epsilon), time);
  float up = waterHeight(p + vec2(0.0, epsilon), time);
  return vec2(right - left, up - down) / (2.0 * epsilon) * 0.008;
}

float reflectionEnvelope(vec2 uv) {
  float vertical = smoothstep(0.01, 0.18, uv.y) * (1.0 - smoothstep(0.88, 1.03, uv.y));
  float center = 0.56 + (uv.y - 0.5) * 0.085 + sin(uv.y * 8.0 + 0.6) * 0.012;
  float width = mix(0.17, 0.045, smoothstep(0.04, 0.96, uv.y));
  width *= uReflectionBandWidth;
  float lateral = exp(-pow(abs(uv.x - center) / max(width, 0.001), 1.62));
  return vertical * lateral;
}

float regionalPulseCorner(vec2 id, float tier, float time) {
  float phase = hash21(id + tier * 17.3) * PI * 2.0;
  float rate = mix(0.34, 0.72, hash21(id + tier * 9.7 + 31.4));
  return sin(time * uFlickerSpeed * rate + phase + sin(time * 0.11 + phase) * 0.3) * 0.5 + 0.5;
}

float regionalPulse(vec2 uv, float tier, float time) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 region = vec2((uv.x - 0.5) * aspect, uv.y - 0.5) * vec2(7.0, 8.0);
  vec2 id = floor(region);
  vec2 f = fract(region);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(regionalPulseCorner(id, tier, time), regionalPulseCorner(id + vec2(1.0, 0.0), tier, time), f.x),
    mix(regionalPulseCorner(id + vec2(0.0, 1.0), tier, time), regionalPulseCorner(id + vec2(1.0), tier, time), f.x),
    f.y
  );
}

float temporalEnvelope(vec2 id, vec2 uv, float tier, float time) {
  float phase = hash21(id - 44.6) * PI * 2.0;
  float rate = mix(0.48, 1.72, hash21(id + 92.8));
  float localTime = time * uFlickerSpeed;
  float signal = sin(localTime * rate + phase) * 0.52;
  signal += sin(localTime * rate * 0.413 + phase * 1.71) * 0.31;
  signal += sin(localTime * 0.13 + phase * 0.37) * 0.17;
  signal = signal * 0.5 + 0.5;

  float individual;
  if (tier < 0.5) individual = 0.18 + smoothstep(0.14, 0.88, signal) * 0.82;
  else if (tier < 1.5) individual = smoothstep(0.26, 0.93, signal);
  else individual = pow(smoothstep(0.57, 0.97, signal), 1.45);

  float shared = mix(0.42, 1.22, regionalPulse(uv, tier, time));
  return clamp(individual * mix(1.0, shared, uLocalCorrelation), 0.0, 1.24);
}

float glimmerLayer(
  vec2 uv,
  vec2 slope,
  float time,
  float activity,
  float tier,
  out float halo,
  out float warmth
) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 field = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  float gridScale = 168.0;
  float density = mix(0.0015, 0.62, pow(activity, 0.8)) * mix(0.35, 1.2, uFinePointRatio);
  float minSize = 0.068;
  float maxSize = 0.128;

  if (tier > 0.5) {
    gridScale = 92.0;
    density = mix(0.00025, 0.18, pow(activity, 1.05)) * mix(1.25, 0.72, uFinePointRatio);
    minSize = 0.09;
    maxSize = 0.18;
  }
  if (tier > 1.5) {
    gridScale = 48.0;
    density = mix(0.00003, 0.045, pow(activity, 1.25)) * mix(1.3, 0.78, uFinePointRatio);
    minSize = 0.095;
    maxSize = 0.19;
  }

  density = clamp(density * uDensity, 0.0, 0.94);
  vec2 gridPosition = field * gridScale;
  vec2 baseCell = floor(gridPosition);
  vec2 local = fract(gridPosition) - 0.5;
  float total = 0.0;
  float warmTotal = 0.0;
  float haloTotal = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 id = baseCell + offset;
      vec2 randomPair = hash22(id + 31.7);
      float identity = hash21(id + 8.13);
      vec2 jitter = (randomPair - 0.5) * 0.72;
      vec2 delta = local - offset - jitter;

      float rare = smoothstep(0.972, 0.998, identity);
      float size = mix(minSize, maxSize, hash21(id + 71.4)) * uGlimmerSize;
      size *= mix(1.0, 1.42, rare * step(1.5, tier));
      float roundness = mix(0.84, 1.08, hash21(id - 13.2));
      vec2 shaped = delta / vec2(size, size * roundness);
      float shapedDistance = length(shaped);
      float edge = clamp(fwidth(shapedDistance) * 0.72, 0.03, 0.16);
      float core = 1.0 - smoothstep(0.72 - edge, 1.0 + edge, shapedDistance);
      float present = step(1.0 - density, hash21(id + 127.1));
      float flicker = temporalEnvelope(id, uv, tier, time);

      vec2 desiredSlope = vec2(-0.105, 0.018);
      float normalMatch = exp(-dot(slope - desiredSlope, slope - desiredSlope) * 185.0);
      float slopeResponse = mix(0.45, 1.0, normalMatch);
      if (tier > 0.5) slopeResponse = mix(0.32, 1.16, normalMatch);
      if (tier > 1.5) slopeResponse = mix(0.18, 1.42, normalMatch);
      float luminance = core * present * flicker * slopeResponse;
      luminance *= mix(0.78, 1.55, rare * step(1.5, tier));

      total += luminance;
      if (tier > 1.5) {
        float softHalo = exp(-shapedDistance * shapedDistance * 0.34);
        softHalo *= smoothstep(0.48, 0.94, flicker) * present * mix(0.2, 0.82, normalMatch);
        haloTotal += max(softHalo - core * 0.38, 0.0) * mix(0.55, 1.2, rare);
      }
      warmTotal += luminance * smoothstep(0.91, 0.998, hash21(id + 241.9));
    }
  }

  warmth = warmTotal / max(total, 0.0001);
  halo = haloTotal;
  return total;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 waterPosition = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
  vec2 slope = waterSlope(waterPosition, uTime) * uWaveStrength;

  float depthField = quietFbm(waterPosition * vec2(1.25, 0.92) + vec2(uTime * 0.006, -1.7));
  float crossField = quietFbm(waterPosition * vec2(3.4, 5.2) + vec2(-2.3, uTime * 0.009));
  float microField = valueNoise(waterPosition * vec2(19.0, 31.0) + vec2(uTime * 0.022, -uTime * 0.015));
  float rippleField = directionalRipple(waterPosition, uTime);
  float slopeShade = clamp(0.5 + slope.y * 1.65 - slope.x * 0.58, 0.0, 1.0);
  float tone = 0.35;
  tone += (depthField - 0.5) * 0.58 * uWaterContrast;
  tone += (crossField - 0.5) * 0.16 * uWaterContrast;
  tone += (microField - 0.5) * 0.052 * uWaterContrast;
  tone += rippleField * 0.041 * uWaveStrength;
  tone += (slopeShade - 0.5) * 0.11 * uWaveStrength;
  vec3 deepWater = vec3(0.018, 0.052, 0.068);
  vec3 liftedWater = vec3(0.068, 0.132, 0.15);
  vec3 color = mix(deepWater, liftedWater, clamp(tone, 0.02, 0.9));
  color += vec3(-0.004, 0.006, 0.01) * (crossField - 0.45) * uWaterContrast;
  color += vec3(0.009, 0.012, 0.01) * rippleField * uWaveStrength;

  float envelope = reflectionEnvelope(vUv);
  float patchNoise = quietFbm(vec2(vUv.x * 4.2 + vUv.y * 0.65, vUv.y * 6.4) + vec2(4.7, -2.1));
  float rippleAffinity = smoothstep(0.28, 0.8, rippleField * 0.5 + 0.5);
  float patchMask = smoothstep(0.38, 0.76, patchNoise + rippleAffinity * 0.13);
  float brokenField = mix(0.54 + patchMask * 0.46, 0.12 + patchMask * 0.88, clamp(uClustering, 0.0, 1.0));
  brokenField *= mix(1.0, 0.55 + patchMask * patchMask * 0.75, max(uClustering - 1.0, 0.0));
  vec2 desiredSlope = vec2(-0.105, 0.018);
  float normalMatch = exp(-dot(slope - desiredSlope, slope - desiredSlope) * 150.0);
  float surfaceAttachment = mix(0.28, 1.0, normalMatch) * mix(0.42, 1.0, rippleAffinity);
  float activity = clamp(envelope * brokenField * surfaceAttachment, 0.0, 1.0);
  float fineHalo = 0.0;
  float fineWarmth = 0.0;
  float mediumHalo = 0.0;
  float mediumWarmth = 0.0;
  float brightHalo = 0.0;
  float brightWarmth = 0.0;
  float fine = glimmerLayer(vUv, slope, uTime, activity, 0.0, fineHalo, fineWarmth);
  float medium = glimmerLayer(vUv, slope, uTime, activity, 1.0, mediumHalo, mediumWarmth);
  float bright = glimmerLayer(vUv, slope, uTime, activity, 2.0, brightHalo, brightWarmth);

  vec3 coolSilver = vec3(0.72, 0.8, 0.82);
  vec3 clearSilver = vec3(0.9, 0.93, 0.89);
  vec3 softGold = vec3(0.96, 0.84, 0.61);
  vec3 brightColor = mix(clearSilver, softGold, clamp(brightWarmth * 0.42, 0.0, 0.24));
  color += coolSilver * fine * 0.72 * uHighlightIntensity;
  color += clearSilver * medium * 1.28 * uHighlightIntensity;
  color += brightColor * bright * 2.25 * uHighlightIntensity;
  color += brightColor * brightHalo * 0.34 * uBloomIntensity * uHighlightIntensity;

  float vignette = 1.0 - dot(vUv - 0.5, vUv - 0.5) * 0.22;
  color *= vignette;
  color = color / (1.0 + color * 0.42);
  color = pow(max(color, 0.0), vec3(1.0 / 2.2));

  gl_FragColor = vec4(color, 1.0);
}
