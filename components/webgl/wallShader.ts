/**
 * Shader for the hero video wall.
 *
 * Each plane runs this once. When a real reel is supplied (uHasMap = 1) it
 * samples the video texture; otherwise it synthesises a drifting light-field
 * that reads as abstract footage. Both paths then run through the same grade,
 * vignette, bloom-edge and grain, so a wall mixing real and placeholder planes
 * still looks like one coherent piece.
 */

export const vertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uHue;      // per-plane colour offset, 0-1
  uniform float uSeed;     // decorrelates the motion between planes
  uniform float uFocus;    // 0-1, rises on hover
  uniform float uReveal;   // 0-1, entrance
  uniform float uHasMap;   // 1 when a real reel is bound
  uniform sampler2D uMap;
  // Sub-rectangle of uMap this plane shows: (offsetX, offsetY, scaleX, scaleY).
  // The placeholder reel is a 3x2 contact sheet of six angles, so the whole
  // wall runs off ONE video decode instead of one per plane.
  uniform vec4 uCell;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.05 + uSeed * 12.0;

    // Domain-warped fbm. The double warp is what stops it reading as
    // "noise texture" and starts it reading as something being filmed.
    vec2 q = vec2(
      fbm(uv * 2.6 + t),
      fbm(uv * 2.6 + vec2(5.2, 1.3) - t * 0.6)
    );
    float f = fbm(uv * 3.4 + q * 1.9 + t * 0.25);

    // Raw fbm clusters tightly around 0.5, which grades out as mud. Expanding
    // it across the full 0-1 range is what gives the frame real contrast.
    f = clamp((f - 0.32) / 0.36, 0.0, 1.0);

    vec3 shadow = vec3(0.006, 0.020, 0.017);
    vec3 mid = vec3(0.044, 0.245, 0.196);
    vec3 mint = vec3(0.106, 0.929, 0.675);

    // Rotate the midtone slightly per plane so the wall reads as different
    // pieces of footage rather than one repeated clip.
    mid = mix(mid, mid.gbr, uHue * 0.4);

    vec3 col = mix(shadow, mid, smoothstep(0.0, 0.8, f));
    col = mix(col, mint, pow(smoothstep(0.48, 1.0, f), 1.8) * (0.36 + uFocus * 0.5));

    if (uHasMap > 0.5) {
      vec3 video = texture2D(uMap, uCell.xy + uv * uCell.zw).rgb;
      // Keep a trace of the synthesised field in the blacks so real footage
      // still sits inside the studio's grade.
      col = mix(col, video, 0.88);
      col += mint * pow(max(video.r, max(video.g, video.b)), 3.0) * 0.06;
    }

    // Slow luminance bar — the ghost of a camera move across the frame.
    float bar = smoothstep(0.0, 0.45, sin(uv.y * 2.6 - uTime * 0.22 + uSeed * 6.283) * 0.5 + 0.5);
    col += mint * bar * 0.028;

    // NB: smoothstep is undefined when edge0 > edge1, so the falloff is written
    // ascending and inverted rather than as smoothstep(1.15, 0.28, r).
    float r = length((uv - 0.5) * vec2(1.05, 1.32));
    float vignette = 1.0 - smoothstep(0.34, 1.02, r);
    col *= vignette;

    // Grain, and a touch more of it in the shadows where sensors show it.
    float grain = hash(uv * vec2(1920.0, 1080.0) + fract(uTime));
    col += (grain - 0.5) * (0.03 + (1.0 - vignette) * 0.02);

    col *= uReveal;

    gl_FragColor = vec4(col, 1.0);
    #include <colorspace_fragment>
  }
`;
