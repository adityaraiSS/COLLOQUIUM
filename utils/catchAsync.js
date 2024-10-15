//  wrapper function to handle async errors in express
const catchAsync = function (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
};

module.exports = catchAsync;
