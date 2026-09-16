import {
  Clock, Color, FloatType, HalfFloatType, Mesh, PerspectiveCamera, PlaneGeometry,
  RawShaderMaterial, Raycaster, RepeatWrapping, RGBAFormat, Scene, SphereGeometry,
  TextureLoader, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget,
} from "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js";

const fullscreenVertexShader = `
precision mediump float;
attribute vec3 position;
attribute vec2 uv;
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position, 1.0); }
`;

const interactionFragmentShader = `
precision mediump float;
const float PI = 3.141592653589793;
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0); const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy)); vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz); vec3 l = 1.0 - g; vec3 i1 = min(g.xyz, l.zxy); vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx; vec3 x2 = x0 - i2 + C.xxx; vec3 x3 = x0 - D.yyy; i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857; vec3 ns = n_ * D.wyz - D.xzx; vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z); vec4 y_ = floor(j - 7.0 * x_); vec4 x = x_ * ns.x + ns.yyyy; vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y); vec4 b0 = vec4(x.xy, y.xy); vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0; vec4 s1 = floor(b1) * 2.0 + 1.0; vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy; vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x); vec3 p1 = vec3(a0.zw, h.y); vec3 p2 = vec3(a1.xy, h.z); vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3))); p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.5 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0); m = m * m;
  return 105.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
uniform sampler2D texture; uniform vec2 center; uniform vec2 center2; uniform float radius; uniform float strength;
uniform float time; uniform float noiseSpeed; uniform float noiseAmplitude; uniform float noiseFrequency; uniform bool mouseDown; varying vec2 vUv;
void main() {
  vec4 data = texture2D(texture, vUv); float dist = length(center - vUv); float drop = max(0.0, 1.0 - dist / radius); drop = 0.5 - cos(drop * PI) * 0.5;
  data.r += mouseDown ? -drop * strength : drop * strength;
  float dist2 = length(center2 - vUv); float drop2 = max(0.0, 1.0 - dist2 / radius); drop2 = 0.5 - cos(drop2 * PI) * 0.5;
  data.r += drop2 * strength; data.r += snoise(vec3(vUv, time * noiseSpeed) * noiseFrequency) * noiseAmplitude; gl_FragColor = data;
}
`;

const simulationFragmentShader = `
precision mediump float;
uniform sampler2D texture; uniform vec2 size; varying vec2 vUv;
void main() {
  vec4 data = texture2D(texture, vUv); vec2 dx = vec2(1.0 / size.x, 0.0); vec2 dy = vec2(0.0, 1.0 / size.y);
  float average = (texture2D(texture, vUv - dx).r + texture2D(texture, vUv - dy).r + texture2D(texture, vUv + dx).r + texture2D(texture, vUv + dy).r) * 0.25;
  data.g += (average - data.r) * 2.0; data.g *= 0.995; data.r += data.g; data.r *= 0.995; gl_FragColor = data;
}
`;

const sphereVertexShader = `
precision mediump float;
attribute vec3 position; attribute vec2 uv; attribute vec3 normal;
uniform mat4 projectionMatrix; uniform mat4 modelViewMatrix; uniform sampler2D texture;
varying vec2 vUv; varying vec3 vPosition;
void main() { vUv = uv; vec4 data = texture2D(texture, uv); vec3 transformed = position + normal * data.r * 0.7; gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0); vPosition = gl_Position.xyz; }
`;

const sphereFragmentShader = `
precision mediump float;
uniform sampler2D texture; uniform sampler2D matcapTexture; uniform sampler2D matcapTexture2; uniform float textureMix;
uniform vec3 colorTint; uniform float colorTintAmount; uniform vec2 size; uniform vec3 eye; uniform vec3 lightDirection; uniform float angle;
varying vec2 vUv; varying vec3 vPosition;
vec2 matcap(vec3 eyeVector, vec3 surfaceNormal) { vec3 reflected = reflect(eyeVector, surfaceNormal); float m = 2.8284271247461903 * sqrt(reflected.z + 1.0); return reflected.xy / m + 0.5; }
float lambert(vec3 normalVector, vec3 lightVector) { return max(dot(normalize(normalVector), normalize(lightVector)), 0.0); }
float blendOverlay(float base, float blend) { return base < 0.5 ? 2.0 * base * blend : 1.0 - 2.0 * (1.0 - base) * (1.0 - blend); }
vec3 blendOverlay(vec3 base, vec3 blend) { return vec3(blendOverlay(base.r, blend.r), blendOverlay(base.g, blend.g), blendOverlay(base.b, blend.b)); }
vec2 rotateUV(vec2 uv, float rotation) { float mid = 0.5; return vec2(cos(rotation) * (uv.x - mid) + sin(rotation) * (uv.y - mid) + mid, cos(rotation) * (uv.y - mid) - sin(rotation) * (uv.x - mid) + mid); }
void main() {
  vec4 data = texture2D(texture, vUv); vec3 tangent = vec3(1.0 / size.x, texture2D(texture, vec2(vUv.x + 1.0 / size.x, vUv.y)).r - data.r, 0.0);
  vec3 bitangent = vec3(0.0, texture2D(texture, vec2(vUv.x, vUv.y + 1.0 / size.y)).r - data.r, 1.0 / size.y);
  vec3 normalVector = normalize(cross(tangent, bitangent)); normalVector = vec3(normalVector.x, sqrt(max(0.0, 1.0 - dot(normalVector.xz, normalVector.xz))), normalVector.z);
  vec2 matcapUv = matcap(eye, normalVector).xy; float light = lambert(normalVector, lightDirection); vec3 viewDirection = normalize(eye - vPosition);
  vec3 reflectDirection = reflect(lightDirection, normalVector); float spec = pow(max(dot(viewDirection, reflectDirection), 0.0), 8.0);
  vec3 specular = 0.025 * spec * mix(vec3(0.47, 0.729, 0.9), vec3(1.0), colorTintAmount); vec2 rotatedUv = rotateUV(vUv, angle);
  vec3 color = mix(texture2D(matcapTexture, rotatedUv).rgb, texture2D(matcapTexture2, rotatedUv).rgb, textureMix); color = mix(color, colorTint, colorTintAmount);
  gl_FragColor = vec4(blendOverlay(color, vec3(light)) + specular, 1.0);
}
`;

const mapRange = (value, inMin, inMax, outMin, outMax) => outMin + ((value - inMin) * (outMax - outMin)) / (inMax - inMin);
const randomBetween = (min, max) => min + Math.random() * (max - min);

export function createPrimaryOrb(viewport, { color, textureUrl = "/landing-primary/images/ob_texture-old.webp" } = {}) {
  if (!viewport) throw new Error("PrimaryOrb requires a viewport element.");
  const renderer = new WebGLRenderer({ antialias: true, alpha: true });
  const gl = renderer.getContext();
  const extensions = gl.getSupportedExtensions() || [];
  const targetType = extensions.includes("EXT_color_buffer_float") ? FloatType : extensions.includes("EXT_color_buffer_half_float") ? HalfFloatType : null;
  if (!targetType) { renderer.dispose(); throw new Error("PrimaryOrb requires floating-point render targets."); }

  renderer.setPixelRatio(window.devicePixelRatio || 1); renderer.setClearColor(0x000000, 0); renderer.domElement.setAttribute("aria-hidden", "true"); renderer.domElement.dataset.primaryOrbTextureReady = "false"; viewport.appendChild(renderer.domElement);
  const camera = new PerspectiveCamera(60, 1, 0.1, 2); camera.position.z = 2.4;
  const scene = new Scene(); const raycaster = new Raycaster(); const clock = new Clock(); const mousePosition = new Vector2(-1, -1); const normalizedMousePosition = new Vector2(-1, -1);
  const renderTargetOptions = { format: RGBAFormat, type: targetType, wrapS: RepeatWrapping, wrapT: RepeatWrapping, depthBuffer: false, stencilBuffer: false };
  const interactionTarget = new WebGLRenderTarget(256, 256, renderTargetOptions); const simulationTarget = new WebGLRenderTarget(128, 128, renderTargetOptions);
  const interactionMaterial = new RawShaderMaterial({ vertexShader: fullscreenVertexShader, fragmentShader: interactionFragmentShader, uniforms: { time: { value: 0 }, texture: { value: simulationTarget.texture }, center: { value: new Vector2(-1, -1) }, center2: { value: new Vector2(-1, -1) }, radius: { value: 0.05 }, strength: { value: 0.05 }, noiseSpeed: { value: 0.1 }, noiseAmplitude: { value: 0.005 }, noiseFrequency: { value: 3 }, mouseDown: { value: false } } });
  const simulationMaterial = new RawShaderMaterial({ vertexShader: fullscreenVertexShader, fragmentShader: simulationFragmentShader, uniforms: { texture: { value: interactionTarget.texture }, size: { value: new Vector2(interactionTarget.width / 2, interactionTarget.height / 2) } } });
  const renderingMaterial = new RawShaderMaterial({ vertexShader: sphereVertexShader, fragmentShader: sphereFragmentShader, transparent: true, uniforms: { texture: { value: simulationTarget.texture }, matcapTexture: { value: null }, matcapTexture2: { value: null }, textureMix: { value: 0 }, colorTint: { value: new Color(color || "#ffffff") }, colorTintAmount: { value: color ? 1 : 0 }, size: { value: new Vector2(simulationTarget.width, simulationTarget.height) }, eye: { value: new Vector3().copy(camera.position).normalize() }, lightDirection: { value: new Vector3() }, angle: { value: Math.PI / 2 } } });
  const fboScene = new Scene(); const fboPlane = new Mesh(new PlaneGeometry(2, 2), interactionMaterial); fboScene.add(fboPlane);
  const sphere = new Mesh(new SphereGeometry(1, 100, 100, 0, Math.PI), renderingMaterial); scene.add(sphere);
  let appliedWidth = 0; let appliedHeight = 0; let angle = Math.PI / 2; let angleDirection = 1; let frameId; let disposed = false; let pulseTimeout;
  const resize = () => { const width = viewport.offsetWidth; const height = viewport.offsetHeight; if (!width || !height || (width === appliedWidth && height === appliedHeight)) return; appliedWidth = width; appliedHeight = height; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix(); };
  const onMouseMove = (event) => mousePosition.set(event.clientX, event.clientY); const onMouseDown = () => { interactionMaterial.uniforms.mouseDown.value = true; }; const onMouseUp = () => { interactionMaterial.uniforms.mouseDown.value = false; };
  const render = () => {
    if (disposed) return; resize(); const bounds = viewport.getBoundingClientRect(); normalizedMousePosition.set(mapRange((mousePosition.x - bounds.left) / bounds.width, 0, 1, -1, 1), mapRange((mousePosition.y - bounds.top) / bounds.height, 0, 1, 1, -1));
    if (normalizedMousePosition.x !== -1 && normalizedMousePosition.y !== -1) { raycaster.setFromCamera(normalizedMousePosition, camera); const intersection = raycaster.intersectObject(sphere)[0]; if (intersection?.uv) interactionMaterial.uniforms.center.value.copy(intersection.uv); else interactionMaterial.uniforms.center.value.set(-1, -1); }
    interactionMaterial.uniforms.time.value = clock.getElapsedTime(); angle += 0.01 * angleDirection; if (angle > Math.PI - 0.5 || angle < 0.5) angleDirection *= -1; renderingMaterial.uniforms.lightDirection.value.set(Math.cos(angle), Math.sin(angle), 1); renderingMaterial.uniforms.angle.value = angle;
    fboPlane.material = interactionMaterial; renderer.setRenderTarget(interactionTarget); renderer.render(fboScene, camera); fboPlane.material = simulationMaterial; renderer.setRenderTarget(simulationTarget); renderer.render(fboScene, camera); renderer.setRenderTarget(null); renderer.render(scene, camera); frameId = window.requestAnimationFrame(render);
  };
  const pulseInterval = window.setInterval(() => { interactionMaterial.uniforms.center2.value.set(randomBetween(0.5, 1), randomBetween(0, 1)); pulseTimeout = window.setTimeout(() => interactionMaterial.uniforms.center2.value.set(-1, -1), 10); }, 200);
  const textureLoader = new TextureLoader(); let matcapTexture;
  textureLoader.load(textureUrl, (texture) => { if (disposed) { texture.dispose(); return; } matcapTexture = texture; renderingMaterial.uniforms.matcapTexture.value = texture; renderingMaterial.uniforms.matcapTexture2.value = texture; renderer.domElement.dataset.primaryOrbTextureReady = "true"; });
  window.addEventListener("resize", resize); window.addEventListener("mousemove", onMouseMove, { passive: true }); window.addEventListener("mousedown", onMouseDown); window.addEventListener("mouseup", onMouseUp); resize(); clock.start(); frameId = window.requestAnimationFrame(render);
  return { destroy() { disposed = true; clock.stop(); window.cancelAnimationFrame(frameId); window.clearInterval(pulseInterval); window.clearTimeout(pulseTimeout); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mousedown", onMouseDown); window.removeEventListener("mouseup", onMouseUp); matcapTexture?.dispose(); interactionTarget.dispose(); simulationTarget.dispose(); sphere.geometry.dispose(); fboPlane.geometry.dispose(); interactionMaterial.dispose(); simulationMaterial.dispose(); renderingMaterial.dispose(); renderer.dispose(); renderer.domElement.remove(); } };
}
