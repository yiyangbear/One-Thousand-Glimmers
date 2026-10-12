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

float waterHeight(vec2 p, float time) {
  float broad = sin(dot(p, normalize(vec2(0.84, 0.54))) * 9.0 + time * 0.18) * 0.48;
  broad += sin(dot(p, normalize(vec2(-0.63, 0.78))) * 15.0 - time * 0.24 + 1.7) * 0.27;
  float middle = sin(dot(p, normalize(vec2(0.97, -0.25))) * 34.0 + time * 0.38 + sin(p.y * 3.0)) * 0.15;
  float fine = sin(dot(p, normalize(vec2(0.42, 0.91))) * 71.0 - time * 0.55) * 0.065;
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

float reflectionEnvelope(vec2 uv, float cluster) {
  float vertical = smoothstep(0.01, 0.18, uv.y) * (1.0 - smoothstep(0.88, 1.03, uv.y));
  float center = 0.56 + (uv.y - 0.5) * 0.085 + sin(uv.y * 8.0 + 0.6) * 0.012;
  float width = mix(0.19, 0.055, smoothstep(0.04, 0.96, uv.y));
  float lateral = exp(-pow(abs(uv.x - center) / width, 1.55));
  float broken = smoothstep(0.25, 0.78, cluster) * 0.72 + 0.28;
  float clustered = mix(1.0, broken, min(uClustering, 1.0));
  clustered *= mix(1.0, broken * broken, max(uClustering - 1.0, 0.0));
  return vertical * lateral * clustered;
}

float glimmerSites(vec2 uv, vec2 slope, float time, out float warmth, out float bloom) {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 field = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
  vec2 gridPosition = field * 76.0;
  vec2 baseCell = floor(gridPosition);
  vec2 local = fract(gridPosition) - 0.5;
  float total = 0.0;
  float warmTotal = 0.0;
  float bloomTotal = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 id = baseCell + offset;
      vec2 randomPair = hash22(id + 31.7);
      float identity = hash21(id + 8.13);
      vec2 jitter = (randomPair - 0.5) * 0.72;
      vec2 delta = local - offset - jitter;

      float rare = smoothstep(0.965, 0.997, identity);
      float size = (mix(0.16, 0.32, hash21(id + 71.4)) + rare * 0.18) * uGlimmerSize;
      float angle = (hash21(id - 13.2) - 0.5) * 0.52;
      mat2 turn = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
      vec2 shaped = turn * delta;
      shaped /= vec2(size * mix(1.0, 1.35, rare), size * mix(0.22, 0.42, rare));
      float shapedDistance = length(shaped);
      float facet = 1.0 - smoothstep(0.62, 1.15, shapedDistance);
      float halo = 1.0 - smoothstep(0.9, 3.2, shapedDistance);

      vec2 siteUv = uv + delta / vec2(76.0 * aspect, 76.0);
      float cluster = quietFbm(siteUv * vec2(3.1, 2.25) + vec2(4.7, -2.1));
      float envelope = reflectionEnvelope(siteUv, cluster);
      float density = clamp(mix(0.028, 0.39, envelope) * uDensity, 0.0, 0.95);
      float present = step(1.0 - density, hash21(id + 127.1));

      float rate = mix(0.38, 1.35, hash21(id + 92.8));
      float phase = hash21(id - 44.6) * PI * 2.0;
      float flickerTime = time * uFlickerSpeed;
      float breathing = 0.5 + 0.5 * sin(flickerTime * rate + phase + sin(flickerTime * 0.17 + phase) * 0.55);
      float flicker = smoothstep(mix(0.18, 0.48, identity), 0.95, breathing);

      vec2 desiredSlope = vec2(-0.105, 0.018);
      float normalMatch = exp(-dot(slope - desiredSlope, slope - desiredSlope) * 185.0);
      float luminance = facet * present * flicker * envelope;
      luminance *= mix(0.3, 1.15, normalMatch) * mix(0.58, 1.85, rare);

      total += luminance;
      bloomTotal += max(halo - facet * 0.45, 0.0) * present * flicker * envelope * mix(0.2, 0.7, normalMatch);
      warmTotal += luminance * smoothstep(0.88, 0.995, hash21(id + 241.9));
    }
  }

  warmth = warmTotal / max(total, 0.0001);
  bloom = bloomTotal;
  return total;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 waterPosition = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);
  vec2 slope = waterSlope(waterPosition, uTime) * uWaveStrength;

  float broadTone = quietFbm(waterPosition * vec2(1.45, 1.1) + vec2(uTime * 0.008, 0.0));
  float grazing = clamp(0.5 + slope.y * 2.2 - slope.x * 0.75, 0.0, 1.0);
  float surfaceDetail = waterHeight(waterPosition, uTime) * 0.5 * uWaveStrength + 0.5;
  vec3 deepWater = vec3(0.052, 0.105, 0.125);
  vec3 liftedWater = vec3(0.105, 0.185, 0.205);
  vec3 color = mix(deepWater, liftedWater, 0.19 + broadTone * 0.26 + grazing * 0.08 + surfaceDetail * 0.035);

  float warmth = 0.0;
  float bloom = 0.0;
  float glimmer = glimmerSites(vUv, slope, uTime, warmth, bloom);
  vec3 silver = vec3(0.83, 0.86, 0.82);
  vec3 softGold = vec3(0.94, 0.82, 0.58);
  vec3 lightColor = mix(silver, softGold, clamp(warmth * 0.55, 0.0, 0.32));
  color += lightColor * glimmer * 2.15 * uHighlightIntensity;
  color += lightColor * bloom * 0.38 * uBloomIntensity * uHighlightIntensity;

  float vignette = 1.0 - dot(vUv - 0.5, vUv - 0.5) * 0.22;
  color *= vignette;
  color = color / (1.0 + color * 0.42);
  color = pow(max(color, 0.0), vec3(1.0 / 2.2));

  gl_FragColor = vec4(color, 1.0);
}
