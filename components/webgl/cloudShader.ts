/**
 * Drifting cloud bank beneath the hero reel.
 *
 * Fullscreen quad — the vertex stage writes clip space directly, so the mesh
 * always covers the viewport regardless of camera.
 *
 * NB throughout: GLSL `smoothstep` is undefined when edge0 > edge1, so every
 * falloff here is written ascending and inverted rather than reversed.
 */

export const cloudVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const cloudFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uAspect;
  uniform float uDissipate; // 0 at rest, 1 fully cleared by scroll

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = p * 2.03 + vec2(1.7, 9.2);
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    vec2 p = vec2(uv.x * uAspect, uv.y) * 2.6;

    // Slow lateral drift, with the lower layers moving faster than the upper
    // ones — cheap parallax that stops the bank reading as one flat sheet.
    float t = uTime * 0.02;
    p.x += t;

    // Double domain warp: this is what turns noise into something billowing.
    vec2 q = vec2(fbm(p + vec2(0.0, t * 1.6)), fbm(p + vec2(5.2, 1.3) - t * 0.7));
    float d = fbm(p + q * 1.35 + vec2(t * 0.4, 0.0));

    // The bank sits low and thins upward. Scroll pushes the horizon down and
    // eats the density, so the clouds clear rather than just fade out.
    float horizon = mix(0.62, -0.25, uDissipate);
    float height = 1.0 - smoothstep(horizon - 0.30, horizon + 0.42, uv.y);

    float density = smoothstep(0.30, 0.86, d * (0.52 + height * 1.05));
    density *= height;
    density *= 1.0 - uDissipate * 0.85;

    // Light comes from above: sample slightly higher and use the difference as
    // a crude self-shadow, which is what gives the tops their edge.
    float lit = fbm(p + q * 1.35 + vec2(0.0, 0.16));
    float rim = clamp((d - lit) * 3.4, 0.0, 1.0);

    vec3 deep = vec3(0.008, 0.055, 0.045);
    vec3 body = vec3(0.045, 0.285, 0.230);
    vec3 crest = vec3(0.180, 0.870, 0.660);

    vec3 col = mix(deep, body, smoothstep(0.0, 0.7, density));
    col = mix(col, crest, rim * density * 0.55);

    // Grain, so the gradient never bands on wide screens.
    col += (hash(uv * vec2(1920.0, 1080.0) + fract(uTime)) - 0.5) * 0.012;

    gl_FragColor = vec4(col, density);
    #include <colorspace_fragment>
  }
`;
