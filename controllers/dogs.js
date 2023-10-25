import { Dog } from '../models/dog.js'
import { Profile } from '../models/profile.js'
import { v2 as cloudinary } from 'cloudinary'

/* ------------------ DOG ------------------ */
//* Get/Indexing Functions

async function index(req, res) {
  try {
    const dogs = await Dog.find({})
    res.json(dogs)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}

//* Post/Create Functions

const create = async (req, res) => {
  try {
    req.body.owner = req.user.profile;
    const dog = await Dog.create(req.body);
    const profile = await Profile.findByIdAndUpdate(
      req.user.profile,
      { $push: { dogs: dog } },
      { new: true }
    );
    dog.owner = profile;

    res.status(201).json(dog);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
};


//* Put/Update Functions

async function addPhoto(req, res) {
  try {
    const imageFile = req.files.photo.path
    const dog = await Dog.findById(req.params.id)

    const image = await cloudinary.uploader.upload(
      imageFile, 
      { tags: `${req.user.email}` }
    )
    dog.photo = image.url
    
    await dog.save()
    res.status(201).json(dog.photo)
  } catch (err) {
    console.log(err)
    res.status(500).json(err)
  }
}


//* Delete Functions



/* ------------------ WALK ------------------ */

const createWalk = async (req, res) => {
  try {
    const dogId = req.params.dogId;
    const walkData = req.body;

    // Find dog by ID
    const dog = await Dog.findById(dogId);

    if (!dog) {
      return res.status(404).json({ message: 'Dog not found'});
    }

    // Create new walk w walkData
    const newWalk  = {
      frequency: walkData.frequency,
      walkTimes: walkData.walkTimes
    }

    // Add new walk to walking array
    dog.walking.push(newWalk);

    // Save the updated dog
    await dog.save();

    res.status(201).json(newWalk);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}


export { index, addPhoto, create }