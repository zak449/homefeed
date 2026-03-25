const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const ICONS_DIR = path.join(__dirname, "public", "icons");
fs.mkdirSync(ICONS_DIR, { recursive: true });

// --- SVG builders ---

function buildIconSvg(size, maskable = false) {
  // For maskable icons, the safe zone is the inner 80% circle,
  // so we scale the text down and keep it well within bounds.
  const padding = maskable ? size * 0.2 : size * 0.05;
  const fontSize = (size - padding * 2) * 0.52;
  const yPos = size / 2 + fontSize * 0.34; // vertical centre tweak

  return `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#0A0A0A"/>
  <text
    x="50%" y="${yPos}"
    text-anchor="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif"
    font-weight="900"
    font-size="${fontSize}px"
    letter-spacing="-${fontSize * 0.03}px"
  ><tspan fill="#FFFFFF">G</tspan><tspan fill="#FF4D00">y</tspan></text>
</svg>`;
}

function buildOgSvg() {
  const w = 1200;
  const h = 630;
  const logoSize = 96;
  const taglineSize = 28;
  const logoY = h / 2 - 10;
  const taglineY = logoY + 60;

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${w}" height="${h}" fill="#0A0A0A"/>
  <text
    x="50%" y="${logoY}"
    text-anchor="middle"
    font-family="Arial Black, Arial, Helvetica, sans-serif"
    font-weight="900"
    font-size="${logoSize}px"
    letter-spacing="-2px"
  ><tspan fill="#FFFFFF">Gwak</tspan><tspan fill="#FF4D00">y</tspan></text>
  <text
    x="50%" y="${taglineY}"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="400"
    font-size="${taglineSize}px"
    fill="#888888"
  >the comment section real estate never had</text>
</svg>`;
}

// --- Generate all files ---

async function main() {
  const jobs = [
    { file: "icon-192.png", size: 192, maskable: false },
    { file: "icon-512.png", size: 512, maskable: false },
    { file: "icon-maskable-192.png", size: 192, maskable: true },
    { file: "icon-maskable-512.png", size: 512, maskable: true },
  ];

  for (const { file, size, maskable } of jobs) {
    const svg = buildIconSvg(size, maskable);
    const outPath = path.join(ICONS_DIR, file);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log(`  ✔ ${file}  (${size}x${size}${maskable ? " maskable" : ""})`);
  }

  // OG image
  const ogSvg = buildOgSvg();
  const ogPath = path.join(__dirname, "public", "og-image.png");
  await sharp(Buffer.from(ogSvg)).png().toFile(ogPath);
  console.log(`  ✔ og-image.png  (1200x630)`);

  console.log("\nAll icons generated.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
