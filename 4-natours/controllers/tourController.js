const Tour = require('../../4-natours/models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('./../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

// const tours = JSON.parse(  // we dont need it anymore ab hum mongoDB p kaam krenge :)
//   fs.readFileSync('./4-natours/dev-data/data/tours-simple.json')
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour ID is ${val}`);
//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };
// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'failed',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  // try {
  // BUILD QUERY =>
  // 1A =>  Filtering =>
  // const queryObj = { ...req.query }; // shallow copy bnane ke liye spread operation use kiya hai , as otherwise in JS refernce to original object is given to queryObj and changing one is reflected in other
  // // console.log(req.query); // console.log(req.query, queryObj); // req.query is an object of queries => {duration : 5,difficulty : "easy"}
  // const excludeField = ['page', 'sort', 'limit', 'fields'];
  // excludeField.forEach(el => delete queryObj[el]);

  // // 1B => Advanced filtering =>
  // let queryStr = JSON.stringify(queryObj);
  // queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
  // console.log(JSON.parse(queryStr));
  // FILTER OBJECT using MongoDb querying =>
  //{ difficulty : "easy" ,duration : { $gte : 5} }
  // { difficulty : "easy" ,duration : { gte : 5} }
  // Using special Mongoose methods =>
  // let query = Tour.find(JSON.parse(queryStr));

  // 2) SORTING =>
  // if (req.query.sort) {
  //   const sortBy = req.query.sort.split(',').join(' ');
  //   // console.log(sortBy);
  //   query = query.sort(sortBy);
  //   // sorting based on multiple fields : sort('price ratingsAverage')
  // } else {
  //   query = query.sort('createdAt');
  // }

  // FIELD LIMITING =>
  // if (req.query.fields) {
  //   const fields = req.query.fields.split(',').join(' ');
  //   query = query.select(fields);
  // } else {
  //   query = query.select('-__v');
  // }

  // PAGINATION =>
  // const page = req.query.page * 1 || 1;
  // const limit = req.query.limit * 1 || 100;
  // const skip = (page - 1) * limit;

  // query = query.skip(skip).limit(limit);

  // if (req.query.page) {
  //   const numTours = await Tour.countDocuments();
  //   if (skip >= numTours) throw new Error('This page does not exist');
  // }

  // EXECUTE QUERY =>

  // const query = await Tour.find()
  //   .where('duration')
  //   .equals(5)
  //   .where('difficulty')
  //   .equals('easy');
  //   // SEND THE RESPONSE =>

  //   res.status(200).json({
  //     status: 'success',
  //     results: tours.length,
  //     data: {
  //       tours: tours
  //     }
  //   });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }

  const features = new APIFeatures(Tour.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const tours = await features.query; // final query => query.sort().select().skip().limit()
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  // set optional variables using ?
  // console.log(req.params); // get all variables in form of an object
  // const id = req.params.id * 1;
  // const tour = tours.find(el => el.id === id);
  // try {
  // Tour.findOne({_id:req.params.id});
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      tour: tour
    }
  });
  // } catch (error) {
  //   res.status(404).json({
  //     status: 'fail',
  //     message: error
  //   });
  // }
});

exports.createTour = catchAsync(async (req, res, next) => {
  const newTour = await Tour.create(req.body);
  res.status(201).json({
    status: 'success',
    data: {
      tour: newTour
    }
  });
  // const newTour = new Tour({});
  // newTour.save();

  // Tour.create({}).then() // we will use async await instead

  // try {

  // } catch (error) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: error
  //   });
  // }
});

exports.updateTour = catchAsync(async (req, res, next) => {
  const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!updatedTour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour: updatedTour
    }
  });
  // try {
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: error
  //   });
  // }
});

exports.deleteTour = catchAsync(async (req, res, next) => {
  // try {
  const tour = await Tour.findByIdAndDelete(req.params.id);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }
  res.status(204).json({
    status: 'success',
    data: null
  });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: error
  //   });
});

// USING AGGREGATION PIPELINES => all the data passes through these pipelines step by step to get some stats,insights into the data.

exports.getTourStats = catchAsync(async (req, res, next) => {
  // try {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 3 }
      }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, // to calc avg ratings of all in one single group
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: {
        avgPrice: 1
      }
    }
    // { // we can also repeat the stages in a pipeline
    //   $match: {
    //     _id: { $ne: 'EASY' }
    //   }
    // }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: error
  //   });
  // }
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  // try {
  const year = req.params.year * 1; // 2021
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates' //  used to deconstruct an array field from the input documents to output a document for each element.
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
  // } catch (error) {
  //   res.status(400).json({
  //     status: 'failed',
  //     message: error
  //   });
  // }
});

// objects ki form me export hoga =>
// controller_name = {
//     getAllTours,
//     getTour,
//     createTour,
//     updateTour,
//     deleteTour,
// }
