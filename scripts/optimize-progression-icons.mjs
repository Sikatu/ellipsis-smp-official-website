/**
 * One-time script to optimize oversized progression icon PNGs.
 *
 * These are Minecraft pixel art icons displayed at 160×160px.
 * The originals are 400–793KB each; this resizes them to 320×320px
 * (2× retina) using nearest-neighbor interpolation to preserve
 * crisp pixel edges, then re-encodes as optimized PNG.
 *
 * Run once:  node scripts/optimize-progression-icons.mjs
 */

import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";

const iconsDir = join(import.meta.dirname, "..", "public", "progression", "icons");
const TARGET_SIZE = 320; // 2× retina for 160px display

async function optimizeIcons() {
    const files = await readdir(iconsDir);
    const pngFiles = files.filter((f) => f.endsWith(".png"));

    console.log(`Found ${pngFiles.length} PNG files to optimize\n`);

    for (const file of pngFiles) {
        const filePath = join(iconsDir, file);
        const beforeStat = await stat(filePath);
        const beforeKB = (beforeStat.size / 1024).toFixed(1);

        await sharp(filePath)
            .resize(TARGET_SIZE, TARGET_SIZE, {
                kernel: sharp.kernel.nearest, // preserve pixel art
                fit: "contain",
                background: { r: 0, g: 0, b: 0, alpha: 0 },
            })
            .png({ compressionLevel: 9, effort: 10 })
            .toBuffer()
            .then(async (buffer) => {
                const { default: fs } = await import("node:fs/promises");
                await fs.writeFile(filePath, buffer);
                const afterKB = (buffer.length / 1024).toFixed(1);
                console.log(`  ${file}: ${beforeKB} KB → ${afterKB} KB`);
            });
    }

    console.log("\nDone! All progression icons optimized.");
}

optimizeIcons().catch(console.error);
