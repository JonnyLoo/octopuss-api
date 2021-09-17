const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;

const Attribute = new mongoose.Schema({
  trait_type: String,
  value: String
});

const OctopussSchema = new mongoose.Schema({
  id: ObjectId,
  name: String,
  description: String,
  image: String,
  attributes: [Attribute]
});

const Octopuss = mongoose.model('Octopuss', OctopussSchema);

module.exports = Octopuss;
