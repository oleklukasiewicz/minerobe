export const ExportImage = function (texture, fileName) {
  const link = document.createElement("a");
  link.href = texture;
  link.download = fileName.toLowerCase() + ".png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
