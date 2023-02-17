class APIFeatures{

    // Constructor to initialize the query and queryString
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    // Function to filter the query
    filter(){
        // Filtering

        // Creating a hard copy of the req.query object
        const queryObj = {...this.queryString};
        // Storing the excluded fields in an array
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        // Deleting the excluded fields from the queryObj
        excludedFields.forEach(el => delete queryObj[el]);

        // Advanced Filtering

        // Converting the object into the string
        let queryStr = JSON.stringify(queryObj);
        // Replacing the string with the $ before match
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}` );

        this.query = this.query.find(JSON.parse(queryStr));

        return this;  // Returning the object to be used in the next function
        
    }

    // Function to sort the query
    sort(){

        // Sorting the query
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ');
            // console.log(sortBy);
            this.query = this.query.sort(sortBy);
            // sort('price ratingsAverage')
        }else{
            this.query = this.query.sort('-createdAt');
        }

        return this;  // Returning the object to be used in the next function

    }

    // Function to limit the fields
    limitFields(){

        // Selecting the fields to be returned
        if(this.queryString.fields){
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        }else{
            this.query = this.query.select('-__v');
        }

        return this;  // Returning the object to be used in the next function

    }

    // Function to paginate the query
    paginate(){

        const page = this.queryString.page * 1 || 1;  // Converting the string to number and setting the default value to 1 (default page)
        const limit = this.queryString.limit * 1 || 100;  // Converting the string to number and setting the default value to 100 (default limit)
        const skip = (page - 1) * limit;  // Calculating the number of documents to be skipped

        this.query = this.query.skip(skip).limit(limit);  // Skipping the documents and limiting the number of documents to be returned

        return this;  // Returning the object to be used in the next function

    }
}

module.exports = APIFeatures;