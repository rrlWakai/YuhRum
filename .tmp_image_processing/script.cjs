const Jimp = require('jimp');

Jimp.read('../src/assets/yuhrumlogo.png').then(image => {
  // Autocrop the white border
  image.autocrop(0.1, false);
  
  // Make white transparent
  const targetColor = {r: 255, g: 255, b: 255};
  const colorDistance = (c1, c2) => Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
  
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
    const red   = this.bitmap.data[idx + 0];
    const green = this.bitmap.data[idx + 1];
    const blue  = this.bitmap.data[idx + 2];
    
    // Exact white or very close
    if (red > 245 && green > 245 && blue > 245) {
      this.bitmap.data[idx + 3] = 0;
    } else {
      // smooth alpha based on distance to white
      const dist = colorDistance({r: red, g: green, b: blue}, targetColor);
      if (dist < 40) {
        this.bitmap.data[idx + 3] = Math.floor((dist / 40) * 255);
      }
    }
  });
  
  return image.writeAsync('../src/assets/yuhrumlogo-clean.png');
}).then(() => {
  console.log('Image processed successfully');
}).catch(err => {
  console.error('Error processing image:', err);
});
