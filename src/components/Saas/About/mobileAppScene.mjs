const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const smoothstep = (value) => value * value * (3 - 2 * value);

export function createMobileAppScene({
  width,
  height,
  elapsed = 0,
  pointerX = 0,
  pointerY = 0,
}) {
  const viewportWidth = Math.max(1, Number(width) || 1);
  const viewportHeight = Math.max(1, Number(height) || 1);
  const phase = Math.max(0, Number(elapsed) || 0) / 1000;
  const parallax = {
    x: clamp(Number(pointerX) || 0, -1, 1) * Math.min(10, viewportWidth * 0.025),
    y: clamp(Number(pointerY) || 0, -1, 1) * Math.min(8, viewportHeight * 0.018),
  };

  const deviceHeight = Math.min(viewportHeight * 0.78, viewportWidth * 1.18);
  const deviceWidth = deviceHeight * 0.515;
  const device = {
    x: (viewportWidth - deviceWidth) / 2 + parallax.x * 0.5,
    y: (viewportHeight - deviceHeight) / 2 + parallax.y * 0.5,
    width: deviceWidth,
    height: deviceHeight,
    radius: deviceWidth * 0.145,
  };

  const screenInset = Math.max(7, deviceWidth * 0.052);
  const screen = {
    x: device.x + screenInset,
    y: device.y + screenInset,
    width: device.width - screenInset * 2,
    height: device.height - screenInset * 2,
    radius: device.radius * 0.72,
  };

  const layers = [
    {
      kind: "overview",
      x: device.x - device.width * 0.45 - parallax.x * 0.85,
      y: device.y + device.height * 0.18 - parallax.y * 0.35,
      width: device.width * 0.84,
      height: device.height * 0.56,
      rotation: -0.055,
      alpha: 0.72,
    },
    {
      kind: "insights",
      x: device.x + device.width * 0.61 - parallax.x * 0.45,
      y: device.y + device.height * 0.11 - parallax.y * 0.7,
      width: device.width * 0.78,
      height: device.height * 0.52,
      rotation: 0.065,
      alpha: 0.66,
    },
    {
      kind: "actions",
      x: screen.x,
      y: screen.y,
      width: screen.width,
      height: screen.height,
      rotation: 0,
      alpha: 1,
    },
  ];

  const notificationCycle = (phase * 0.22) % 1;
  const notificationIn = smoothstep(clamp(notificationCycle / 0.16, 0, 1));
  const notificationOut = smoothstep(clamp((1 - notificationCycle) / 0.18, 0, 1));
  const notificationEase = Math.min(notificationIn, notificationOut);

  return {
    viewport: { width: viewportWidth, height: viewportHeight },
    phase,
    parallax,
    device,
    screen,
    layers,
    navigation: [
      { kind: "home", active: true },
      { kind: "chart", active: false },
      { kind: "wallet", active: false },
      { kind: "profile", active: false },
    ],
    notification: {
      label: "Pago confirmado",
      detail: "+ $1,280.00",
      progress: notificationEase,
    },
    touch: {
      x: screen.x + screen.width * (0.7 + Math.sin(phase * 0.7) * 0.08),
      y: screen.y + screen.height * 0.665,
      radius: Math.max(4, device.width * 0.035),
    },
    particles: Array.from({ length: 18 }, (_, index) => ({
      x: ((index * 73 + 31) % 100) / 100 * viewportWidth,
      y: ((index * 47 + 17) % 100) / 100 * viewportHeight,
      radius: 0.7 + (index % 3) * 0.55,
      alpha: 0.12 + (index % 4) * 0.07,
      drift: Math.sin(phase * 0.5 + index) * 4,
    })),
  };
}
