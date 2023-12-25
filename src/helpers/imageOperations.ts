import { FileData, OutfitPackage, OutfitLayer } from "$src/data/common";
import { GetDominantColorFromImageContext } from "./colorHelper";
import { GetContextFromBase64, GetOutfitType } from "./imageDataHelpers";
import { mergeImages } from "./imageMerger";

export const ExportImage = async function (
  layers: OutfitLayer[],
  modelType: string,
  fileName: string
) {
  const link = document.createElement("a");
  link.href = await mergeImages(
    [...layers.map((x) => x[modelType].content)].reverse(),
    undefined,
    modelType
  );
  link.download = fileName.toLowerCase() + ".png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export const ExportImageLayers = async function (
  layers: FileData[],
  modelType: string,
  fileName: string
) {
  const link = document.createElement("a");
  link.href = await mergeImages(
    [...layers.map((x) => x.content)].reverse(),
    undefined,
    modelType
  );
  link.download = fileName.toLowerCase() + ".png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
export const ExportImagePackageJson = async function (
  outfitPackage: OutfitPackage
) {
  const pack = outfitPackage;
  const json = JSON.stringify(pack);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = outfitPackage.name.toLowerCase() + "_package.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
export const ImportImagePackageJson = async function (context:OutfitPackage) {
  //create node for fle download
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.click();

  return new Promise<OutfitPackage>((resolve) => {
    input.onchange = (event: any) => {
      let file = event.target.files[0];
      resolve(ImportImagePackageJsonFromFile(file,context));
    };
  });
};
export const ImportImagePackageJsonFromFile = async function (file: File,context:OutfitPackage) {
  return new Promise<OutfitPackage>((resolve) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data: any = event.target.result;
      const jsonData = JSON.parse(base64Data);
      context.layers = jsonData.layers;
      context.name = jsonData.name;
      context.model = jsonData.model;
      resolve(context);
    };
    reader.readAsText(file);
  });
};
export const ImportImage = async function () {
  //create node for fle download
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple=true;
  input.click();

  return new Promise<FileData[]>((resolve) => {
    input.onchange = (event: any) => {
      let files = Array.from(event.target.files) as any[];
      event.target.value = null;
      const promises=Promise.all([...files].map(async (file) => await ImportLayerFromFile(file)));
      resolve(promises);
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
      var newLayer = new FileData(
        file.name.replace(/\.[^/.]+$/, ""),
        base64Data,
        outfitType,
        color
      );
      resolve(newLayer);
    };
    reader.readAsDataURL(file);
  });
};
