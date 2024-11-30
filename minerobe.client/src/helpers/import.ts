import type { OUTFIT_TYPE } from "$src/data/consts/data";
import { FileData, OutfitLayer } from "$src/model/package";
import {
  FindClosestColor,
  FindColorTitle,
  GetDominantColorFromImageContext,
} from "./image/colorHelper";
import { GetContextFromBase64, GetOutfitType } from "./image/imageDataHelpers";

export let ImportImages = async function (): Promise<OutfitLayer[]> {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.click();

  const inputPromise = new Promise<any[]>((resolve) => {
    input.onchange = (event: any) => {
      let files = Array.from(event.target.files) as any[];
      event.target.value = null;
      resolve(files);
    };
  });

  const files = await inputPromise;
  const layers = await ImportImagesFromFiles(files);
  return layers;
};
export const ImportImagesFromFiles = async function (
  files: File[]
): Promise<OutfitLayer[]> {
  return await Promise.all(
    files.map(async (file) => await ConvertFileToLayer(file))
  );
};
//helpers
const ConvertFileToLayer = async function (file: any): Promise<OutfitLayer> {
  const reader = new FileReader();
  const readerPromise = new Promise<any>((resolve) => {
    reader.onload = (event: any) => {
      resolve(event.target.result);
    };
  });
  reader.readAsDataURL(file);
  const base64Data = await readerPromise;
  const context = await GetContextFromBase64(base64Data);
  const outfitType = await GetOutfitType(context);
  const color = await GetDominantColorFromImageContext(context);
  const colorName = await FindColorTitle(color);
  const layerName = file.name.replace(/\.[^/.]+$/, "");
  const newLayer = new OutfitLayer();

  newLayer.id = layerName + Math.random(); //only for testing
  newLayer.name = layerName;
  newLayer.alex = new FileData(layerName, base64Data);
  newLayer.steve = new FileData(layerName, base64Data);
  newLayer.colorName = colorName;
  newLayer.outfitType = outfitType as OUTFIT_TYPE;

  return newLayer;
};

export const ConvertFileToFileData = async function (
  file: any
): Promise<FileData> {
  const reader = new FileReader();
  const readerPromise = new Promise<any>((resolve) => {
    reader.onload = (event: any) => {
      resolve(event.target.result);
    };
  });
  reader.readAsDataURL(file);
  const base64Data = await readerPromise;
  const fileName = file.name.replace(/\.[^/.]+$/, "");
  const newFileData = new FileData(fileName, base64Data);

  return newFileData;
};
