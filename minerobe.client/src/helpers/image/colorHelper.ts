import { closest } from "color-diff";
import { GetContextFromBase64 } from "./imageDataHelpers";
import { COLOR_TYPE } from "$src/data/enums/color";
import { COLORS, COLORS_ARRAY } from "$src/data/consts/color";
const ConvertRGBToHex = (rgb: any) => {
  const { r, g, b } = rgb;
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};
const ConvertRGBToHSL = (rgb: any) => {
  let r = rgb.r;
  let g = rgb.g;
  let b = rgb.b;
  r /= 255;
  g /= 255;
  b /= 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;
  if (max != min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
      case g:
        h = ((b - r) / d + 2) / 6;
      case b:
        h = ((r - g) / d + 4) / 6;
    }
  }
  return { h, s, l };
};
const ConvertHexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};
const StringToRgb = (rgbString: string) => {
  const [r, g, b] = rgbString.split(",").map(Number);
  return { r, g, b };
};
export const GetDominantColorFromImage = async function (base64) {
  const ctx = (await GetContextFromBase64(base64)) as any;
  return await GetDominantColorFromImageContext(ctx);
};
export const GetDominantColorTitleFromImage = async function (base64) {
  const ctx = (await GetContextFromBase64(base64)) as any;
  const dominantColor = await GetDominantColorFromImageContext(ctx);
  return FindColorTitle(dominantColor);
}
export const GetDominantColorFromImageContext = async function (ctx) {
  const imageData = ctx.getImageData(
    0,
    0,
    ctx.canvas.width,
    ctx.canvas.height,
    {
      willReadFrequently: true,
    }
  );
  const colorMap = {};
  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    const a = imageData.data[i + 3]; // Alpha channel
    if (a === 0) continue; // Skip transparent pixels
    const rgb = `${r},${g},${b}`;
    if (colorMap[rgb]) {
      colorMap[rgb]++;
    } else {
      colorMap[rgb] = 1;
    }
  }

  const dominantColor = Object.keys(colorMap).reduce((a, b) =>
    colorMap[a] > colorMap[b] ? a : b
  );
  return dominantColor;
};
export const FindClosestColor = (color: any, from: string) => {
  let rgbColor;
  if (from != COLOR_TYPE.RGB) {
    rgbColor = ConvertColor(color, from, COLOR_TYPE.RGB);
  }
  return closest(rgbColor, COLORS_ARRAY);
};
export const FindInColors = (rgb: any) => {
  return Object.keys(COLORS).find((key) => {
    const color = COLORS[key];
    return color.r === rgb.r && color.g === rgb.g && color.b === rgb.b && key;
  });
};
export const FindColorTitle = function (rgbString: string) {
  const cr = FindClosestColor(rgbString, COLOR_TYPE.STRING_COLOR);
  return FindInColors(cr);
};
export const FindColor = function (
  rgbString: string,
  to: string = COLOR_TYPE.HEX
) {
  const cr = FindClosestColor(rgbString, COLOR_TYPE.STRING_COLOR);
  return ConvertColor(cr, COLOR_TYPE.RGB, to);
};
export const ConvertColor = function (color: string, from: string, to: string) {
  if (from == COLOR_TYPE.RGB && to == COLOR_TYPE.HEX) {
    if (typeof color == "string") {
      return ConvertRGBToHex(StringToRgb(color));
    }
    return ConvertRGBToHex(color);
  }
  if (from == COLOR_TYPE.RGB && to == COLOR_TYPE.HSL) {
    if (typeof color == "string") {
      return ConvertRGBToHSL(StringToRgb(color));
    }
    return ConvertRGBToHSL(color);
  }
  if (from == COLOR_TYPE.HEX && to == COLOR_TYPE.RGB) {
    return ConvertHexToRgb(color);
  }
  if (from == COLOR_TYPE.STRING_COLOR && to == COLOR_TYPE.HEX) {
    return ConvertRGBToHex(StringToRgb(color));
  }
  if (from == COLOR_TYPE.STRING_COLOR && to == COLOR_TYPE.RGB) {
    return StringToRgb(color);
  }
  if (from == COLOR_TYPE.STRING_COLOR && to == COLOR_TYPE.HSL) {
    return ConvertRGBToHSL(StringToRgb(color));
  }
  return color;
};
export const ConvertToStringColor = function (color: any) {
  if (color == null) return "";
  return `rgb(${color.r},${color.g},${color.b})`;
};
