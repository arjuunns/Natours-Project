class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString; // duration[gte]=5&difficulty=easy&price[lt]=1500
  }

  filter() {
    const queryObj = { ...this.queryString }; // shallow copy bnane ke liye spread operation use kiya hai , as otherwise in JS reference to original object is given to queryObj and changing one is reflected in other
    const excludeField = ['page', 'sort', 'limit', 'fields'];
    excludeField.forEach(el => delete queryObj[el]);

    // Advanced filtering =>
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this; // return the query as the result of query
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
