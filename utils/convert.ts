export const convertImageToBase64 = (image: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener('load', () => {
      if (typeof reader.result !== 'string') {
        return reject('Failed reading image data');
      }

      resolve(reader.result);
    });

    reader.addEventListener('error', err => {
      reject(err);
    });

    reader.readAsDataURL(image);
  });
};
