const Campground = require("../models/campgrounds");
const { cloudinary } = require("../cloudinary");
// SETTING UP MAPBOX API
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
};
module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const camp = await Campground.findById(id);
  if (!camp) {
    req.flash("error", "Cannot find campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
};
module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  // console.log(req.body);
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body,
  });
  const imgs = req.files.map((img) => {
    return { url: img.path, filename: img.filename };
  });
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated campground!");
  res.redirect(`/campgrounds/${id}`);
};
module.exports.createCampground = async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.location,
      limit: 1,
    })
    .send();
  const { title, description, price, location, image } = req.body;
  const camp = Campground({
    title,
    description,
    price,
    location,
    image,
    author: req.user._id,
  });
  camp.images = req.files.map((file) => {
    return { url: file.path, filename: file.filename };
  });
  camp.geometry = geoData.body.features[0].geometry;
  await camp.save();
  req.flash("success", "Added new campground successfuly!");
  res.redirect(`/campgrounds/${camp._id}`);
};
module.exports.deleteCampgrounds = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted campground!");
  res.redirect("/campgrounds");
};
module.exports.showCampground = async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { campground });
};
