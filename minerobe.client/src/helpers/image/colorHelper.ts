import { closest } from "color-diff";
import { COLORS_ARRAY } from "$src/data/consts/color";
import type { RgbaColor, RgbColorDictionaryItem } from "$src/data/models/color";

const GetDominantFromImageContext = async function (ctx: CanvasRenderingContext2D): Promise<RgbaColor> {
  const data = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
  const colorMap = Object.create(null);

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue;

    const rgb = `${data[i]},${data[i + 1]},${data[i + 2]}`;
    colorMap[rgb] = { color: { r: data[i], g: data[i + 1], b: data[i + 2], a: data[i + 3] }, count: (colorMap[rgb]?.count || 0) + 1 };
  }

  const dominantColor = Object.keys(colorMap).reduce((dominant, color) =>
    colorMap[color].count > colorMap[dominant].count ? color : dominant
  );
  return colorMap[dominantColor].color as RgbaColor;
}
const GetClosestColor = (color: RgbaColor): RgbColorDictionaryItem => {
  const closestColor = closest(color, COLORS_ARRAY);
  return closestColor;
}
const ToRgbaString = (color: RgbaColor) => `rgba(${color.r},${color.g},${color.b},${color.a ?? 255})`;
export const ColorHelper = {
  GetDominantFromImageContext,
  GetClosestColor,
  ToRgbaString,
};