import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const input = path.join(root, 'saveweb2zip-com-www-auros-global/js/main.js');
const output = path.join(root, 'public/landing-primary/js/auros-hero-particles.bundle.js');
const entry = 'document.readyState==="loading"?document.addEventListener("DOMContentLoaded",ZC,{once:!0}):ZC();';
const initialization = 'this.particles.init().then(()=>{this.parentElement&&IE(this.parentElement,this.onElementInViewport)})';
const positionNode = 'return mZ("position").mul(this.instanceScaleUniform).add(e)';
let source = fs.readFileSync(input, 'utf8');

for (const [original, replacement] of [
  [entry, 'window.__createHeroParticleExperience=(host,onReady,onError)=>{const experience=new $se;experience.parentElement=host;Hse.runTests().then(()=>{if(!host.isConnected)return;experience.setupWebGPU(onReady,onError)}).catch(onError);return experience};'],
  [initialization, 'this.particles.init().then(()=>{this.parentElement&&(this.viewportObserver=IE(this.parentElement,this.onElementInViewport)),this.onReady?.(this)}).catch(error=>this.onError?.(error))'],
  ['this.parentElement=document.querySelector(".webgpu-container"),this.parentElement&&(this.parentElement.classList.add("webgpu-app")', 'this.parentElement=this.parentElement||document.querySelector(".webgpu-container"),this.parentElement&&(this.parentElement.classList.add("webgpu-app")'],
  ['setupWebGPU=()=>{', 'setupWebGPU=(onReady,onError)=>{this.onReady=onReady,this.onError=onError,'],
  ['instanceScaleUniform=ms(zp.device.desktop?1:1.25);', 'instanceScaleUniform=ms(zp.device.desktop?1:1.25);scrollExplosionUniform=ms(0);'],
  [positionNode, 'return mZ("position").mul(this.instanceScaleUniform).add(e).add(e.sub(.5).mul(this.scrollExplosionUniform)).add(e.mul(31.7).sin().mul(this.scrollExplosionUniform).mul(.12))'],
  ['setupMesh(){this.material=new rT', 'setupMesh(){const heroParticleScale=zp.device.desktop?1.5:1.35;this.material=new rT'],
  ['this.particleMesh.position.set(-.5,-.5,-.5)', 'this.particleMesh.scale.setScalar(heroParticleScale),this.particleMesh.position.set(-heroParticleScale/2,-heroParticleScale/2,-heroParticleScale/2)'],
  ['dispose(){this.particles&&this.particles.dispose(),window.removeEventListener("resize",this.onResize)}', 'dispose(){this.viewportObserver?.disconnect(),this.particles?.render(false),this.particles?.dispose(),window.removeEventListener("resize",this.onResize)}'],
]) {
  if (source.split(original).length !== 2) throw new Error(`Expected one Auros source occurrence: ${original}`);
  source = source.replace(original, replacement);
}

// Keep the reference's particle simulation and renderer, but never run its page setup.
fs.writeFileSync(output, `/* Auros hero particle experience, isolated from the reference page bootstrap. */\n(function(){\n${source}\n})();\n`);
console.log(`Built ${path.relative(root, output)}`);
