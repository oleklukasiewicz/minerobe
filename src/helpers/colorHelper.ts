import { closest } from "color-diff";
import { GetContextFromBase64 } from "./imageDataHelpers";
import { COLORS, COLORS_ARRAY } from "$src/data/consts";
import type { FileData } from "$src/data/common";
export const ConvertRGBToHex = (rgb: any) => {
    const { r, g, b } = rgb;
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };
  export const ConvertRGBToHSL = (rgb: any) => {
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
  export const GetDominantColorFromImage = async function (base64) {
    const ctx = (await GetContextFromBase64(base64)) as any;
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
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
  export const GetDominantColorFromImageContext = async function (ctx) {
    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
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
  export const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  };
  export const stringToRgb = (rgbString: string) => {
    const [r, g, b] = rgbString.split(",").map(Number);
    return { r, g, b };
  };
  export const FindClosestColorHex = (hexColor: string) => {
    // convert hex into rgb object
    const rgbColor = hexToRgb(hexColor);
    return closest(rgbColor, COLORS_ARRAY);
  };
  export const FindClosestColorString = (rgbString: string) => {
    // convert hex into rgb object
    const rgbColor = stringToRgb(rgbString);
    return closest(rgbColor, COLORS_ARRAY);
  };
  export const FindInColors = (rgb: any) => {
    return Object.keys(COLORS).find((key) => {
      const color = COLORS[key];
      return color.r === rgb.r && color.g === rgb.g && color.b === rgb.b && key;
    });
  };
  export const GetColorFromFileData = async function (fileData: FileData) {
    let dominantColor: any;
    dominantColor =
      fileData.color || (await GetDominantColorFromImage(fileData.content));
    let closestColor = FindClosestColorString(dominantColor);
    return closestColor;
  };