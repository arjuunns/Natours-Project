const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equal than 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters']
      // validate: [validator.isAlpha,'Tour name must only contain characters'] // using external validator npm package
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      max: [5, 'Rating must be above 1.0'], // can also use on dates
      min: [1, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium or difficult'
      }
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(discount) {
          // this only points to current doc on NEW document creation
          return discount < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular Price'
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false // prevents this field from appearing in query results
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {}
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

tourSchema.virtual('durationWeeks').get(function() {
  // this property is not saved in database but only shown when we hit a get request
  return this.duration / 7;
});

// DOCUMENT MIDDLEWARE => // runs before .save() and .create() not on .insertMany()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true }); // this points to currently processed document , isko pre-save hook bhi bolte h
  next();
});

/* tourSchema.pre('save', function(next) {
  console.log('Will save document....');
  next();
}); 

tourSchema.post('save', function(doc, next) {
  console.log(doc);
  next();
});*/

// QUERY MIDDLEWARE / HOOK => // tourSchema.pre('find', function(next) { // this doesn't work on findbyId and other find methods
tourSchema.pre(/^find/, function(next) {
  // we used a regEx (regular expression).
  // we use regular express => /^find/ so that this middleware applies to all queries that start with find keyword
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// AGGREGATION MIDDLEWARE / HOOK =>
tourSchema.post(/^find/, function(docs, next) {
  // console.log(`Query took ${Date.now() - this.start} milliseconds!`);
  // console.log(docs);
  next();
});

tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
