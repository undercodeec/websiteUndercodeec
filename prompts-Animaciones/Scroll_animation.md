Help me implement this scroll animation component, as i scroll one of shape center, become bigger and connect to all other smaller shapes

animation
scroll animation
landing page

Page: Nexus Core Expansion

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nexus Core Expansion</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/1.0.7/iconify-icon.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&family=Space+Grotesk:wght@700&display=swap');
    
    :root {
      --accent: #FEE07A;
      --bg: #0a0a0a;
    }

    body {
      font-family: 'JetBrains Mono', monospace;
      background-color: var(--bg);
      color: #fff;
      margin: 0;
      overflow-x: hidden;
    }

    .scroll-height {
      height: 300vh;
    }

    .viewport {
      position: sticky;
      top: 0;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      background: radial-gradient(circle at center, #151515 0%, #0a0a0a 100%);
    }

    .cyber-grid {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(254, 224, 122, 0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(254, 224, 122, 0.05) 1px, transparent 1px);
      background-size: 60px 60px;
      z-index: 0;
    }

    .stage {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    /* Common Shape Styling */
    .node {
      position: absolute;
      border: 2px solid rgba(254, 224, 122, 0.3);
      background: rgba(20, 20, 20, 0.9);
      backdrop-filter: blur(8px);
      transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .node::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(transparent 50%, rgba(254, 224, 122, 0.05) 50%);
      background-size: 100% 4px;
      pointer-events: none;
    }

    /* Individual Node states - using CSS variables for transform data */
    .node-1 { width: 180px; height: 180px; transform: translate(-100px, -100px); border-radius: 24px; }
    .node-2 { width: 180px; height: 180px; transform: translate(100px, -100px); border-radius: 24px; background: rgba(254, 224, 122, 0.15); border-color: var(--accent); }
    .node-3 { width: 180px; height: 180px; transform: translate(-100px, 100px); border-radius: 24px; }
    .node-4 { width: 180px; height: 180px; transform: translate(100px, 100px); border-radius: 24px; }

    /* Expanded States */
    body.expanded .node-1 { transform: translate(-450px, -200px); width: 100px; height: 100px; border-radius: 12px; }
    body.expanded .node-2 { transform: translate(0, 0); width: 340px; height: 340px; border-radius: 50%; border-width: 6px; box-shadow: 0 0 60px rgba(254, 224, 122, 0.2); background: var(--accent); color: #000; }
    body.expanded .node-3 { transform: translate(-450px, 200px); width: 100px; height: 100px; border-radius: 12px; }
    body.expanded .node-4 { transform: translate(450px, 0); width: 100px; height: 100px; border-radius: 12px; }

    /* Connectors */
    .connector-svg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 5;
    }

    .path-line {
      stroke: var(--accent);
      stroke-width: 2;
      fill: none;
      stroke-dasharray: 1000;
      stroke-dashoffset: 1000;
      transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1);
      opacity: 0.4;
    }

    body.expanded .path-line {
      stroke-dashoffset: 0;
    }

    .glitch-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: url('https://grainy-gradients.vercel.app/noise.svg');
      opacity: 0.05;
      pointer-events: none;
      z-index: 100;
    }

    .status-bar {
      position: absolute;
      bottom: 40px;
      left: 40px;
      font-size: 10px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--accent);
      opacity: 0.6;
    }

    .scroll-indicator {
      position: absolute;
      bottom: 40px;
      right: 40px;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
    }

    .scroll-bar-track {
      width: 2px;
      height: 100px;
      background: rgba(254, 224, 122, 0.1);
    }

    .scroll-bar-fill {
      width: 100%;
      background: var(--accent);
      height: 0%;
      transition: height 0.1s linear;
    }
  </style>
</head>
<body>
  <div class="scroll-height">
    <div class="viewport">
      <div class="cyber-grid"></div>
      <div class="glitch-overlay"></div>

      <!-- Main Stage -->
      <div class="stage">
        <!-- Dynamic Connectors -->
        <svg class="connector-svg">
          <!-- Paths to satellites from center -->
          <path class="path-line" id="path1" d="M 720 450 L 520 450 L 370 300" />
          <path class="path-line" id="path2" d="M 720 450 L 520 450 L 370 600" />
          <path class="path-line" id="path3" d="M 720 450 L 1070 450" />
        </svg>

        <!-- The Nodes -->
        <div class="node node-1">
          <iconify-icon icon="lucide:cpu" class="text-4xl mb-2 opacity-50"></iconify-icon>
          <span class="text-xs font-bold tracking-widest">SAT.01</span>
        </div>

        <div class="node node-2">
          <div class="flex flex-col items-center">
            <iconify-icon icon="lucide:layers" class="text-5xl mb-4"></iconify-icon>
            <span class="text-xl font-black tracking-tighter uppercase mb-1">Nexus Core</span>
            <span class="text-[10px] opacity-70 tracking-[0.3em] font-bold">SYSTEM_ONLINE</span>
          </div>
        </div>

        <div class="node node-3">
          <iconify-icon icon="lucide:network" class="text-4xl mb-2 opacity-50"></iconify-icon>
          <span class="text-xs font-bold tracking-widest">SAT.02</span>
        </div>

        <div class="node node-4">
          <iconify-icon icon="lucide:radio" class="text-4xl mb-2 opacity-50"></iconify-icon>
          <span class="text-xs font-bold tracking-widest">SAT.03</span>
        </div>
      </div>

      <!-- HUD Elements -->
      <div class="status-bar">
        <div>Lat: 51.5074° N / Long: 0.1278° W</div>
        <div class="mt-1">Protocol: 882-X-GAMMA</div>
      </div>

      <div class="scroll-indicator">
        <span class="text-[10px] font-bold text-yellow-200/50 uppercase tracking-widest">Synchronize</span>
        <div class="scroll-bar-track">
          <div class="scroll-bar-fill" id="scroll-fill"></div>
        </div>
      </div>

      <div class="absolute top-10 left-10 flex items-center gap-4">
        <div class="w-8 h-8 border border-[#FEE07A] flex items-center justify-center">
          <div class="w-4 h-4 bg-[#FEE07A] animate-pulse"></div>
        </div>
        <div class="flex flex-col">
          <span class="text-xs font-bold text-[#FEE07A]">CORE_MODULE_01</span>
          <span class="text-[9px] opacity-40">STABLE_CONNECTION</span>
        </div>
      </div>
    </div>
  </div>

  <script>
    const scrollFill = document.getElementById('scroll-fill');
    const body = document.body;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = (scrollY / maxScroll) * 100;
      
      scrollFill.style.height = `${scrollPercent}%`;

      // Threshold for expansion
      if (scrollPercent > 35) {
        body.classList.add('expanded');
      } else {
        body.classList.remove('expanded');
      }

      // Parallax effect on grid
      document.querySelector('.cyber-grid').style.transform = `translateY(${scrollY * 0.1}px)`;
    });

    // Initial check
    const initScroll = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    if (initScroll > 35) body.classList.add('expanded');
  </script>
</body>
</html>
```

Please reference this design and implement it into our codebase; Try to understand the structure, which part of our codebase is relevant and implement
