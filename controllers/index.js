const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const Chance = require('chance');
const Octopuss = require('../models');
const { HEADS, EYES, MOUTHS, BODIES } = require('../constants');
const { PINATA_API_KEY, PINATA_API_SECRET } = require('../configs');

const getOctopuss = async (req, res) => {
  console.log('GET OCTOPUSS');

  try {
    const octopuss = await Octopuss.find({ _id: req.params.id });

    return res.status(200).json(octopuss);
  } catch (err) {
    return res.status(500).json({ error: err });
  }
};

const generateOctopuss = async (req, res) => {
  console.log('GENERATE OCTOPUSS');

  const attributes = generateAttributes();

  const metadata = {
    name: req.body.name || 'Octopuss',
    description: 'Your friendly neighborhood octopus',
    attributes
  };

  //image gen
  // const image = generateImage();
  const image = 'octopuss.png'

  //upload to pinata
  try {
    const result = await uploadImageToPinata(image);
    if (result.error) {
      return res.status(500).json(result);
    }
    metadata.image = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`;
    const name = `${image.substr(0, image.lastIndexOf('.'))}.json`;

    const result2 = await uploadMetadataToPinata(metadata, name);
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

const generateAttributes = () => {
  const chance = new Chance();
  const head = chance.weighted(Object.keys(HEADS), Object.values(HEADS));
  const eyes = chance.weighted(Object.keys(EYES), Object.values(EYES));
  const mouth = chance.weighted(Object.keys(MOUTHS), Object.values(MOUTHS));
  const body = chance.weighted(Object.keys(BODIES), Object.values(BODIES));

  return [
    { trait_type: 'Head', value: head },
    { trait_type: 'Eyes', value: eyes },
    { trait_type: 'Mouth', value: mouth },
    { trait_type: 'Body', value: body }
  ];
};

const generateImage = () => {

};

const uploadImageToPinata = async (image) => {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;

  const data = new FormData();
  data.append('file', fs.createReadStream(`assets/generated/${image}`));

  try {
    const result = await axios.post(url, data, {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET
      }
    });

    return result.data;
  } catch (err) {
    console.log(err.msg, err.message);
    return { error: 'Error uploading image to pinata', details: err };
  }
};

const uploadMetadataToPinata = async (metadata, name) => {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

  const data = {
    pinataContent: metadata,
    pinataMetadata: { name }
  };

  try {
    const result = await axios.post(url, data, {
      headers: {
        pinata_api_key: PINATA_API_KEY,
        pinata_secret_api_key: PINATA_API_SECRET
      }
    });

    return result.data;
  } catch (err) {
    return { error: 'Error uploading metadata to pinata', details: err };
  }
};

module.exports = {
  getOctopuss,
  generateOctopuss
};
