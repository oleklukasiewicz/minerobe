import {
  FindClosestColor,
  GetDominantColorFromImageContext,
} from "../image/colorHelper";
import { GetContextFromBase64, GetOutfitType } from "../image/imageDataHelpers";
import { MergeFileDataToImage } from "../../data/imageMerger";
import type { OutfitPackageRenderConfig } from "$model/render";
import { FileData } from "$src/model/package";
import { COLOR_TYPE } from "$src/data/consts";

export const ExportImageLayers = async function (
  layers: FileData[],
  config: OutfitPackageRenderConfig,
  fileName: string
) {
  const link = document.createElement("a");
  link.href = await MergeFileDataToImage(layers, config);
  link.download = fileName.toLowerCase() + ".png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export const ExportImageString = async function (
  base64: string,
  fileName: string
) {
  const link = document.createElement("a");
  link.href = base64;
  link.download = fileName.toLowerCase() + ".png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export const ImportImage = async function () {
  //create node for fle download
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.click();

  return new Promise<FileData[]>((resolve) => {
    input.onchange = (event: any) => {
      let files = Array.from(event.target.files) as any[];
      event.target.value = null;
      const promises = Promise.all(
        [...files].map(async (file) => await ImportLayerFromFile(file))
      );
      resolve(promises);
    };
  });
};
export const ImportSingleImage = async function () {
  //create node for fle download
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = false;
  input.click();

  return new Promise<FileData>((resolve) => {
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      resolve(ImportLayerFromFile(file));
    };
  });
};
export const ImportImageFromUrl = async function (url: string) {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result);
        };
        reader.onerror = () => {
          reject("Error occurred while reading the image.");
        };
        reader.readAsDataURL(blob);
      });
    });
};
export const ImportLayerFromFile = async function (file: File) {
  //convert to base64
  const reader = new FileReader();
  return new Promise<FileData>((resolve) => {
    reader.onload = async (event) => {
      const base64Data: any = event.target.result;
      var context = await GetContextFromBase64(base64Data);
      const outfitType = GetOutfitType(context);
      const color = await GetDominantColorFromImageContext(context);
      const colorName = await FindClosestColor(color, COLOR_TYPE.STRING_COLOR);
      var newLayer = new FileData(
        file.name.replace(/\.[^/.]+$/, ""),
        base64Data,
        outfitType,
        color,
        colorName.name
      );
      resolve(newLayer);
    };
    reader.readAsDataURL(file);
  });
};
