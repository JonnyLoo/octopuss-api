const PORT = 8081;

const DB_URI = 'mongodb+srv://octopuss:admin@octopuss.56va9.mongodb.net/octopuss?retryWrites=true&w=majority';
const DB_URI_LOCAL = 'mongodb://localhost/octopuss';

const PINATA_API_KEY = "86efcb1795ac18715355";
const PINATA_API_SECRET = "b1c6cd6b5cab7535b2800d5827eccf74c4636a81f884e9d16a11fd4f994f71e3";

const width = 1000;
const height = 1000;

const name = 'Octopuss';
const description = 'Your friendly neighborhood octopus';
const baseUri = 'https://gateway.pinata.cloud/ipfs';

const pinFileUrl = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
const pinJsonUrl = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';

const baseImagePath = 'assets/generated';

const dnaPrefix = '0';

const rarityToDna = {
  common: 'c',
  rare: 'r'
}

const rarities = {
  heads: [
    { rarity: 'common', weight: 90 },
    { rarity: 'rare', weight: 9 },
    { rarity: 'spicy', weight: 1 }
  ],
  eyes: [
    { rarity: 'common', weight: 95 },
    { rarity: 'rare', weight: 5 }
  ],
  mouths: [
    { rarity: 'common', weight: 99 },
    { rarity: 'rare', weight: 1 }
  ],
  bodies: [
    { rarity: 'common', weight: 95 },
    { rarity: 'rare', weight: 5 }
  ]
};

const HEADS = {
  common: [
    { type: 'None', filename: '0.png' }
  ],
  rare: [
    { type: 'Bow', filename: '0.png' },
    { type: 'Top Bow', filename: '1.png' },
    { type: 'Black Horns', filename: '2.png' },
    { type: 'Red Horns', filename: '3.png' }
  ],
  spicy: [
    { type: 'Yellow Flower Bow', filename: '0.png' },
    { type: 'Red Plaid Bow', filename: '1.png' }
  ]
};

const EYES = {
  common: [
    { type: 'Gray 1', filename: '0.png' },
    { type: 'Red 1', filename: '1.png' },
    { type: 'Blue 1', filename: '2.png' },
    { type: 'Green 1', filename: '3.png' },
    { type: 'Brown 1', filename: '4.png' }
  ],
  rare: [
    { type: 'Gray 2', filename: '0.png' }
  ]
};

const MOUTHS = {
  common: [
    { type: 'W', filename: '0.png' },
    { type: 'Silly', filename: '1.png' }
  ],
  rare: [
    { type: 'Surprised', filename: '0.png' }
  ]
};

const BODIES = {
  common: [
    { type: 'Pink', filename: '0.png' },
    { type: 'Purple', filename: '1.png' },
    { type: 'Blue', filename: '2.png' },
    { type: 'Gray', filename: '3.png' }
  ],
  rare: [
    { type: 'Blue Sky', filename: '0.png' },
    { type: 'Inky', filename: '1.png' }
  ]
};

module.exports = {
  PORT,
  DB_URI,
  DB_URI_LOCAL,
  PINATA_API_KEY,
  PINATA_API_SECRET,
  width,
  height,
  name,
  description,
  baseUri,
  pinFileUrl,
  pinJsonUrl,
  baseImagePath,
  dnaPrefix,
  rarityToDna,
  rarities,
  HEADS,
  EYES,
  MOUTHS,
  BODIES
};
