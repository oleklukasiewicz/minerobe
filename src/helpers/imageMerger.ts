// Defaults
const defaultOptions = {
  format: "image/png",
  quality: 0.92,
  width: undefined,
  height: undefined,
  Canvas: undefined,
  crossOrigin: undefined,
};

// Return Promise
export let mergeImages = function (
  sources,
  options,
  skinType
): Promise<string> {
  if (sources === void 0) sources = [];
  if (options === void 0) options = {};

  return new Promise(function (resolve) {
    options = Object.assign({}, defaultOptions, options);

    // Setup browser/Node.js specific variables
    var canvas = options.Canvas
      ? new options.Canvas()
      : window.document.createElement("canvas");
    var Image = options.Image || window.Image;

    // Load sources
    var images = sources.map(function (source) {
      return new Promise(function (resolve, reject) {
        // Convert sources to objects
        if (source.constructor.name !== "Object") {
          source = { src: source };
        }

        // Resolve source and img when loaded
        var img = new Image();
        img.crossOrigin = options.crossOrigin;
        img.onerror = function () {
          return reject(new Error("Couldn't load image"));
        };
        img.onload = function () {
          return resolve(Object.assign({}, source, { img: img }));
        };
        img.src = source.src;
      });
    });

    // Get canvas context
    var ctx = canvas.getContext("2d",{ willReadFrequently: true });
    var tempCanvas = window.document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d",{ willReadFrequently: true });

    // When sources have loaded
    resolve(
      Promise.all(images).then(function (images) {
        // Set canvas dimensions
        var getSize = function (dim) {
          return (
            options[dim] ||
            Math.max.apply(
              Math,
              images.map(function (image) {
                return image.img[dim];
              })
            )
          );
        };
        canvas.width = getSize("width");
        canvas.height = getSize("height");

        // Draw images to canvas
        images.forEach(function (image) {
          ctx.globalAlpha = image.opacity ? image.opacity : 1;
          //set temp canvas
          let tempDrawed = tempCtx.drawImage(
            image.img,
            image.x || 0,
            image.y || 0
          );
          //update image
          //head
          replaceLowerLayer(tempCtx, ctx, 0, 0, 32, 0, 32, 16);
          //body
          replaceLowerLayer(tempCtx, ctx, 16, 16, 16, 32, 24, 16);
          //legs
          replaceLowerLayer(tempCtx, ctx, 0, 16, 0, 32, 16, 16);
          replaceLowerLayer(tempCtx, ctx, 16, 48, 0, 48, 16, 16);
          //arms
          if (skinType == "alex") {
            replaceLowerLayer(tempCtx, ctx, 40, 16, 40, 32, 14, 16);
            replaceLowerLayer(tempCtx, ctx, 32, 48, 48, 48, 14, 16);
          } else {
            replaceLowerLayer(tempCtx, ctx, 40, 16, 40, 34, 16, 16);
            replaceLowerLayer(tempCtx, ctx, 32, 48, 48, 52, 16, 16);
          }
          tempCtx.clearRect(0, 0, canvas.width, canvas.height);

          let drawed = ctx.drawImage(image.img, image.x || 0, image.y || 0);

          return drawed;
        });
        // Resolve all other data URIs sync
        return canvas.toDataURL(options.format, options.quality);
      })
    );
  });
};
let replaceLowerLayer = function (
  imgContext,
  lowerLayerContext,
  sourceX,
  sourceY,
  x,
  y,
  width,
  height
) {
  let imageData = imgContext.getImageData(sourceX, sourceY, width, height);
  let sourcePixels = imageData.data;

  let destData = lowerLayerContext.getImageData(x, y, width, height);
  let destPixels = destData.data;
  for (let i = 0; i < sourcePixels.length; i += 4) {
    const r = sourcePixels[i];
    const g = sourcePixels[i + 1];
    const b = sourcePixels[i + 2];
    //detect if is not empty
    if (r != 0 || g != 0 || b != 0) {
      destPixels[i] = 0;
      destPixels[i + 1] = 0;
      destPixels[i + 2] = 0;
      destPixels[i + 3] = 0;
    }
  }
  lowerLayerContext.putImageData(destData, x, y);
};
