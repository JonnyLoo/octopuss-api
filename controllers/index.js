const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const Chance = require('chance');
const Octopuss = require('../models');
const config = require('../configs');

const { createCanvas, loadImage } = require("canvas");
const canvas = createCanvas(config.width, config.height);
const ctx = canvas.getContext('2d');

const getOctopuss = async (req, res) => {
  console.log('###################');
  console.log('# Get Octopuss');
  console.log('###################\n');

  try {
    const octopuss = await Octopuss.find({ dna: req.params.dna });

    return res.status(200).json(octopuss);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const generateOctopuss = async (req, res) => {
  console.log('###################');
  console.log('# Generate Octopuss');
  console.log('###################\n');

  // generate metadata
  const { metadata, imagedata } = generateMetadata(req.body.name);

  // at some point check for uniqueness based off dna

  // generate image
  const image = await generateImage(imagedata, metadata.dna);

  // upload to pinata
  try {
    // upload image
    const result = await uploadImageToPinata(image);
    if (result.error) {
      return res.status(500).json(result);
    }

    metadata.image = `${config.baseUri}/${result.IpfsHash}`;
    const jsonFilename = `${image.substring(0, image.lastIndexOf('.'))}.json`;

    // upload metadata
    const result2 = await uploadMetadataToPinata(metadata, jsonFilename);
    if (result2.error) {
      return res.status(500).json(result2);
    }

    const octopuss = new Octopuss(metadata);
    const created = await octopuss.save();

    return res.status(201).json({ success: true, octopuss: created, metadataHash: result2.IpfsHash });
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const generateMetadata = (name) => {
  const date = Date.now();
  const { attributes, imagedata } = generateAttributes();
  const dna = getDna(imagedata);
  return {
    metadata: {
      dna,
      name: name || config.name,
      description: config.description,
      date,
      attributes
    },
    imagedata
  };
};

const generateAttributes = () => {
  const rarities = {
    heads: [],
    eyes: [],
    mouths: [],
    bodies: []
  };
  const weights = {
    heads: [],
    eyes: [],
    mouths: [],
    bodies: []
  };

  config.rarities.heads.forEach(r => {
    rarities.heads.push(r.rarity);
    weights.heads.push(r.weight);
  });

  config.rarities.eyes.forEach(r => {
    rarities.eyes.push(r.rarity);
    weights.eyes.push(r.weight);
  });

  config.rarities.mouths.forEach(r => {
    rarities.mouths.push(r.rarity);
    weights.mouths.push(r.weight);
  });

  config.rarities.bodies.forEach(r => {
    rarities.bodies.push(r.rarity);
    weights.bodies.push(r.weight);
  });

  const chance = new Chance();
  const headRarity = chance.weighted(rarities.heads, weights.heads);
  const eyesRarity = chance.weighted(rarities.eyes, weights.eyes);
  const mouthRarity = chance.weighted(rarities.mouths, weights.mouths);
  const bodyRarity = chance.weighted(rarities.bodies, weights.bodies);
  const head = chance.pickone(config.HEADS[headRarity]);
  const eyes = chance.pickone(config.EYES[eyesRarity]);
  const mouth = chance.pickone(config.MOUTHS[mouthRarity]);
  const body = chance.pickone(config.BODIES[bodyRarity]);

  return {
    attributes: [
      { trait_type: 'Head', value: head.type },
      { trait_type: 'Eyes', value: eyes.type },
      { trait_type: 'Mouth', value: mouth.type },
      { trait_type: 'Body', value: body.type }
    ],
    imagedata: {
      head: { rarity: headRarity, filename: head.filename },
      eyes: { rarity: eyesRarity, filename: eyes.filename },
      mouth: { rarity: mouthRarity, filename: mouth.filename },
      body: { rarity: bodyRarity, filename: body.filename }
    }
  };
};

const getDna = (imagedata) => {
  const { head, eyes, mouth, body } = imagedata;

  const headDna = `${config.rarityToDna[head.rarity]}${head.filename}`;
  const eyesDna = `${config.rarityToDna[eyes.rarity]}${eyes.filename}`;
  const mouthDna = `${config.rarityToDna[mouth.rarity]}${mouth.filename}`;
  const bodyDna = `${config.rarityToDna[body.rarity]}${body.filename}`;

  const dna = `${config.dnaPrefix}${bodyDna}${eyesDna}${mouthDna}${headDna}`;

  return dna.split('.png').join('');
};

const generateImage = async (imagedata, dna) => {
  ctx.clearRect(0, 0, config.width, config.height);

  const body = await loadImage(`assets/bodies/${imagedata.body.rarity}/${imagedata.body.filename}`);
  const eyes = await loadImage(`assets/eyes/${imagedata.eyes.rarity}/${imagedata.eyes.filename}`);
  const mouth = await loadImage(`assets/mouths/${imagedata.mouth.rarity}/${imagedata.mouth.filename}`);
  const head = await loadImage(`assets/heads/${imagedata.head.rarity}/${imagedata.head.filename}`);

  const x = 0, y = 0;

  ctx.drawImage(body, x, y, config.width, config.height);
  ctx.drawImage(eyes, x, y, config.width, config.height);
  ctx.drawImage(mouth, x, y, config.width, config.height);
  ctx.drawImage(head, x, y, config.width, config.height);

  return saveImage(dna);
};

const saveImage = (dna) => {
  const imageName = `${dna}.png`;

  fs.writeFileSync(
    `${config.baseImagePath}/${imageName}`,
    canvas.toBuffer('image/png')
  );

  return imageName;
};

const uploadImageToPinata = async (image) => {
  const data = new FormData();
  data.append('file', fs.createReadStream(`${config.baseImagePath}/${image}`));

  try {
    const result = await axios.post(config.pinFileUrl, data, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: config.PINATA_API_KEY,
        pinata_secret_api_key: config.PINATA_API_SECRET
      }
    });

    return result.data;
  } catch (err) {
    console.log(err);
    return { error: 'Error uploading image to pinata', details: err };
  }
};

const uploadMetadataToPinata = async (metadata, jsonFilename) => {
  const data = {
    pinataContent: metadata,
    pinataMetadata: { name: jsonFilename }
  };

  try {
    const result = await axios.post(config.pinJsonUrl, data, {
      headers: {
        pinata_api_key: config.PINATA_API_KEY,
        pinata_secret_api_key: config.PINATA_API_SECRET
      }
    });

    return result.data;
  } catch (err) {
    return { error: 'Error uploading metadata to pinata', details: err };
  }
};

const gimmie = async (req, res) => {
  console.log('###################');
  console.log('# Octopuss');
  console.log('###################\n');

  const { metadata, imagedata } = generateMetadata(req.body.name);
  const image = await generateImage(imagedata, metadata.dna);

  return res.status(200).sendFile(path.resolve(`${config.baseImagePath}/${image}`));
}

module.exports = {
  getOctopuss,
  generateOctopuss,
  gimmie
};
