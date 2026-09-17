/**
 * Utility to compress a Base64 Image string using Canvas.
 * Resizes the image to fit within maxWidth/maxHeight and encodes it as JPEG with specified quality.
 */
export function compressImage(
  dataUrl: string,
  maxWidth = 160,
  maxHeight = 160,
  quality = 0.7
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith("data:image/")) {
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions to maintain aspect ratio
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } else {
        resolve(dataUrl); // Fallback
      }
    };
    img.onerror = () => {
      resolve(dataUrl); // Fallback
    };
  });
}
