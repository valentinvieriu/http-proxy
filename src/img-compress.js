const sharp = require('sharp');
const path = require('path');
const header1ootPath = process.cwd() + '/public/content/dam/bmw/marketDE/bmw_de/teaser/large-teaser/18_efficientdynamics_header_1680x756.jpg/_jcr_content/renditions/';
sharp(path.join(header1ootPath, 'cq5dam.resized.img.1680.large.time1520604709705_original.jpg'))
  .jpeg({
    progressive: true,
    optimiseScans: true,
    trellisQuantisation: true,
    quality: 75
  })
  // .webp({
  //   quality: 80
  // })
  .toFile(path.join(header1ootPath, 'cq5dam.resized.img.1680.large.time1520604709705.jpg'), function(err) {
    // output.jpg is a 300 pixels wide and 200 pixels high image
    // containing a scaled and cropped version of input.jpg
    err && console.error(err);
  });

  const header1ootPathMobile = process.cwd() + '/public/content/dam/bmw/marketDE/bmw_de/teaser/large-teaser/18_efficientdynamics_header_1040x1040.jpg/_jcr_content/renditions/';
  sharp(path.join(header1ootPathMobile, 'cq5dam.resized.img.485.low.time1520604745095_original.jpg'))
    .jpeg({
      progressive: true,
      optimiseScans: true,
      trellisQuantisation: true,
      quality: 80
    })
    // .webp({
    //   quality: 80
    // })
    .toFile(path.join(header1ootPathMobile, 'cq5dam.resized.img.485.low.time1520604745095.jpg'), function(err) {
      // output.jpg is a 300 pixels wide and 200 pixels high image
      // containing a scaled and cropped version of input.jpg
      err && console.error(err);
    });