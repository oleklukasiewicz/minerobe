import { closest } from "color-diff";
import { GetContextFromBase64 } from "./imageDataHelpers";
import { COLOR_TYPE } from "$src/data/enums/color";
import { COLORS, COLORS_ARRAY } from "$src/data/consts/color";
import type { RgbaColor } from "$src/data/models/color";

// export helper object

const GetDominantFromImage = async function (image: string): Promise<RgbaColor> {
  const ctx = await GetContextFromBase64(image);
  return await GetDominantFromImageContext(ctx);
}
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
const ToRgbaString = (color: RgbaColor) => `rgba(${color.r},${color.g},${color.b},${color.a ?? 255})`;
const ToRgbString = (color: RgbaColor) => `rgb(${color.r},${color.g},${color.b})`;
const ToHexString = (color: RgbaColor) => "#" + ((1 << 24) + (color.r << 16) + (color.g << 8) + color.b).toString(16).slice(1);
const GetClosestColor = (color: RgbaColor) => {
  const closestColor = closest(color, COLORS_ARRAY);
  return closestColor;
}
const FromHexToRgba = (hex: string): RgbaColor => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 255,
    }
    : null;
};
const FromRgbStringToRgba = (rgbString: string): RgbaColor => {
  let [r, g, b, a] = rgbString.split(",").map(Number);
  if (a === undefined) a = 255;
  return { r, g, b, a };
};
const GetColor = (color: RgbaColor) => {
  const closestColor = GetClosestColor(color);
  const foundColor = COLORS_ARRAY.find(c => c.r === closestColor.r && c.g === closestColor.g && c.b === closestColor.b);
  return { name: foundColor.name, normalizedName: foundColor.normalizedName, color: closestColor };
}
export const ColorHelper = {
  GetDominantFromImage,
  GetDominantFromImageContext,
  GetClosestColor,
  GetColor,
  ToRgbaString,
  ToRgbString,
  ToHexString,
  FromHexToRgba,
  FromRgbStringToRgba,
};