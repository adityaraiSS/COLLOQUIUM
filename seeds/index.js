const mongoose = require("mongoose");
const Campground = require("../models/campgrounds");
const { descriptors, places } = require("./seedHelpers");
const cities = require("./cities");

mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Mongo connection established");
  })
  .catch((err) => {
    console.log("Mongo connection error");
    console.log(err);
  });

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 300; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const randPrice = Math.floor(Math.random() * 50) + 20;
    const camp = Campground({
      author: "64e435eb45fcfa724942b9cc",
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Facilis necessitatibus, aut quisquam totam dolor architecto facere perferendis eum! Tempore sunt aperiam quasi labore nobis cum, sed dolor modi at, perferendis delectus, nam obcaecati laudantium! Neque voluptatibus earum nulla, assumenda laudantium sunt ullam ut, autem distinctio doloremque mollitia eveniet quae amet.",
      price: randPrice,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      images: [
        {
          url: "https://res.cloudinary.com/dt5ajje7a/image/upload/v1692989653/YelpCamp/q0dwrqpwcxmulfhhv8s8.jpg",
          filename: "YelpCamp/q0dwrqpwcxmulfhhv8s8",
        },
        {
          url: "https://res.cloudinary.com/dt5ajje7a/image/upload/v1692989662/YelpCamp/btyofajjnlryfse78ekx.jpg",
          filename: "YelpCamp/btyofajjnlryfse78ekx",
        },
        {
          url: "https://res.cloudinary.com/dt5ajje7a/image/upload/v1692989677/YelpCamp/rxexybe6dscvqbqs4stz.jpg",
          filename: "YelpCamp/rxexybe6dscvqbqs4stz",
        },
      ],
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
