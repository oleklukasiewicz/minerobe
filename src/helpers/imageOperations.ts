import {
  FileData,
  GetContextFromBase64,
  GetOutfitType,
  OutfitPackage,
  OutfitLayer,
} from "$src/data/common";
import JSZip from "jszip";
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
export const ExportImagePackage = async function (
  layers: OutfitLayer[],
  modelType: string,
  itemName: string
) {
  let zip = new JSZip();
  let layerData: any[] = [];
  layers.forEach((layer, index) => {
    zip.file(
      "textures/" + index + "/" + layer.steve.fileName,
      layer.steve.content.split(",")[1],
      {
        base64: true,
      }
    );
    zip.file(
      "textures/" + index + "/" + layer.alex.fileName,
      layer.alex.content.split(",")[1],
      {
        base64: true,
      }
    );
    layerData.push({
      name: layer.name,
      folder: index,
      steve: layer.steve.fileName,
      alex: layer.alex.fileName,
    });
  });
  //generate json with data
  const packageData = {
    name: itemName,
    model: modelType,
    layers: layerData,
  }; // replace with your actual data
  zip.file("data.json", JSON.stringify(packageData));

  zip.generateAsync({ type: "base64" }).then((data) => {
    const link = document.createElement("a");
    link.href = "data:application/zip;base64," + data;
    link.download = itemName.toLowerCase() + "_package.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
};
export const ImportImagePackage = async function () {
  const input = document.createElement("input");
  input.type = "file";
  input.click();

  return new Promise<OutfitPackage>((resolve) => {
    input.onchange = (event: any) => {
      let file = event.target.files[0];
      event.target.value = null;
      if (file) {
        const reader = new FileReader();

        reader.onload = async function (event) {
          const zip = new JSZip();
          zip.loadAsync(event.target.result).then(async function (contents) {
            let jsonData = null;
            let importedPackage = new OutfitPackage("", "", []);
            if (contents.files["data.json"]) {
              await contents.files["data.json"]
                .async("string")
                .then(function (data) {
                  jsonData = JSON.parse(data);
                });

              importedPackage.name = jsonData.name;
              importedPackage.model = jsonData.model;

              const texturesFolder = "textures/";

              let layersToLoad = jsonData.layers.map(async (x: any) => {
                const layerFolder = x.folder + "/";
                //load content of file async with await
                let steve;
                if (x.steve)
                  steve = await contents.files[
                    texturesFolder + layerFolder + x.steve
                  ].async("base64");
                let alex;
                if (x.alex)
                  alex = await contents.files[
                    texturesFolder + layerFolder + x.alex
                  ].async("base64");
                if (steve == null) steve = alex;
                if (alex == null) alex = steve;

                var steveContext = await GetContextFromBase64(
                  "data:image/png;base64," + steve
                );
                var alexContext = await GetContextFromBase64(
                  "data:image/png;base64," + alex
                );
                const steveFileData = new FileData(
                  x.steve,
                  "data:image/png;base64," + steve,
                  GetOutfitType(steveContext)
                );
                const alexFileData = new FileData(
                  x.alex,
                  "data:image/png;base64," + alex,
                  GetOutfitType(alexContext)
                );
                return new OutfitLayer(x.name, steveFileData, alexFileData);
              });

              let newLayers = [];
              let l = await Promise.all(layersToLoad).then((layers) => {
                jsonData.layers.forEach((x) => {
                  const layerToInsert = layers.find((y) => y.name == x.name);
                  if (layerToInsert) {
                    newLayers.push(layerToInsert);
                  }
                });
              });
              importedPackage.layers = newLayers;
              resolve(importedPackage);
            } else {
              return;
            }
          });
        };
        reader.readAsArrayBuffer(file);
      }
    };
  });
};
export const ImportImage = async function () {
  let base64Data;
  //create node for fle download
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  return new Promise<FileData>((resolve) => {
    input.onchange = (event: any) => {
      let file = event.target.files[0];
      event.target.value = null;
      const reader = new FileReader();
      reader.onload = async (event) => {
        base64Data = event.target.result;
        var context = await GetContextFromBase64(base64Data);
        const outfitType = GetOutfitType(context);
        var newLayer = new FileData(
          file.name.replace(/\.[^/.]+$/, ""),
          base64Data,
          outfitType
        );
        resolve(newLayer);
      };
      reader.readAsDataURL(file);
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
  reader.readAsDataURL(file);
  //create new layer 
  return new Promise<FileData>((resolve) => {
    reader.onload = async (event) => {
      const base64Data:any = event.target.result;
      var context = await GetContextFromBase64(base64Data);
      const outfitType = GetOutfitType(context);
      var newLayer = new FileData(
        file.name.replace(/\.[^/.]+$/, ""),
        base64Data,
        outfitType
      );
      resolve(newLayer);
    };
  });
};