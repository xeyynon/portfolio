import { CanvasTexture, LinearMipmapLinearFilter, SRGBColorSpace } from "three";

/**
 * The relief on the body, drawn once into a small canvas. The film prop's
 * sphere is not smooth: raised ribs sweep round it in long art nouveau
 * curves, with a band near the bottom. This is a height map (white is
 * raised, dark is a groove), used both to bump the surface and to darken
 * the gold in the grooves. The greys are heights, not colours of the page.
 *
 * The sphere is six segments and each segment carries the whole map, so the
 * relief repeats six times round the body. Each rib leaves the right edge
 * exactly where the next one enters the left edge of the neighbouring
 * segment, so the ribs run on round the sphere as spirals.
 */

const W = 256;
const H = 512;
const SPACING = 128; // px between ribs; also the drop of one rib across a segment
const grey = (v: number) => `rgb(${v},${v},${v})`;

export function createBodyRelief(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is not available for the body relief");

  ctx.fillStyle = grey(214);
  ctx.fillRect(0, 0, W, H);

  const stroke = (draw: () => void, width: number, shade: number, blur: number) => {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineWidth = width;
    ctx.strokeStyle = grey(shade);
    ctx.shadowColor = grey(shade);
    ctx.shadowBlur = blur;
    ctx.beginPath();
    draw();
    ctx.stroke();
    ctx.restore();
  };

  // One rib: enters low on the left, swells, and leaves high on the right.
  const rib = (y: number, shift: number) => () => {
    ctx.moveTo(-12, y + SPACING + shift);
    ctx.bezierCurveTo(70, y + SPACING + 34 + shift, 120, y - 48 + shift, W + 12, y + shift);
  };

  for (let y = -SPACING; y < H + SPACING; y += SPACING) {
    stroke(rib(y, 30), 30, 58, 14); // the groove under the rib
    stroke(rib(y, 0), 30, 255, 12); // the rib itself
    stroke(rib(y, -21), 4, 96, 3); // a fine line along its upper edge
  }

  // The band near the bottom: a ridge between two grooves, right round.
  const level = (y: number) => () => {
    ctx.moveTo(-12, y);
    ctx.lineTo(W + 12, y);
  };
  ctx.fillStyle = grey(214);
  ctx.fillRect(0, 392, W, 52);
  stroke(level(400), 9, 52, 5);
  stroke(level(418), 11, 255, 4);
  stroke(level(436), 9, 52, 5);

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.minFilter = LinearMipmapLinearFilter;
  texture.anisotropy = 4;
  return texture;
}
