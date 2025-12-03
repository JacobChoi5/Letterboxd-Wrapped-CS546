import {checkValidString, checkValidId,checkValidNumber} from helpers.js
import { ObjectId } from "mongodb";
import { userMovieData } from '../config/mongoCollections.js';//still needs to be added in config. collection 3 according to db prop

export const unZip = async()=>
{
    let diaryText = null;
    let ratingsText = null;
    let reviewsText = null;
    //unzipping do later use jzip
    // return {
    //     diaryCSV: diaryText,
    //     ratingsCSV: ratingsText,
    //     reviewsCSV: reviewsText
    // };
    return;
};

export const parse = async() =>
{
    return; 
};

export const getRating = async (movieId,userId) => 
    {
    // validate both IDs
    checkValidId(movieId);
    checkValidId(userId);
    const userMovies = await userMovieData();

    const entry = await userMovies.findOne({
        userId: userId,
        movieId: movieId
    });

    if (!entry) 
        {
        throw "No user movie data found";
        }

    return entry.rating;
};

export const getDateWatched = async (movieId, userId)=>
{
    checkValidId(movieId);
    checkValidId(userId);
    const userMovies = await userMovieData();
    const entry = await userMovies.findOne({
        userId: userId,
        movieId:movieId
    });
    if(!entry)
    {
        throw "No User Movie data found";
    }
    return entry.dateWatched;
};

export const getRewatchCount = async (movieId, userId)=>
{
    checkValidId(movieId);
    checkValidId(userId);
    const userMovies = await userMovieData();
    const entry = await userMovies.findOne({
        userId: userId,
        movieId:movieId
    });
    if(!entry)
    {
        throw "No User Movie data found";
    }
    if(entry.rewatchCount === undefined)
    {
        return 0;
    }
    return entry.rewatchCount;
};

export const getReviewDescription = async (movieId, userId)=>
{
    checkValidId(movieId);
    checkValidId(userId);
    const userMovies = await userMovieData();
    const entry = await userMovies.findOne({
        userId: userId,
        movieId:movieId
    });
    if(!entry)
    {
        throw "No User Movie data found";
    }
    if(!entry.reviewDescription)
    {
        return "";
    }
    return entry.reviewDescription;
};

export const getAllMoviesWatched = async(userId) =>
{
    checkValidId(userId);
    const userMovies = await userMovieData();
    const entry = await userMovies.find({
        userId}).toArray();
    if(entry.length === 0)
    {
        throw "None found";
    }
    return entry;
};// gett all movies user has watched. put in touples wih the name of movie and the id of the movie so lucas can call getRating function or each of the mvpoies and get the average 
//in accounts.js. Still In progress. 

export const  setRating = async (movieId, userId, val)=>
{
    checkValidId(movieId);
    checkValidId(userId);
    checkValidNumber(val,"Rating");
    if(val < 0 || val > 5)
    {
        throw "Rating has to be betweeen 0 and 5";
    }
    const userMovies = await userMovieData();
    const entry = await userMovies.findOneAndUpdate(
        { userId: userId,movieId:movieId},
        {$set: {rating: val}}, 
        {returnDocument: "after"});
    if(!entry.value)
    {
        throw "No User Movie data found";
    }
    if(!entry.value.rating)
    {
        throw "No rating found";
    }
    return entry.value.rating;
};

export const setDateWatched = async (movieId, userId, val)=>
{
    checkValidId(movieId);
    checkValidId(userId);
    checkValidString(val);
    const userMovies = await userMovieData();
    const entry = await userMovies.findOneAndUpdate(
        { userId: userId,movieId:movieId},
        {$set: {dateWatched: val}}, 
        {returnDocument: "after"});
    if(!entry.value)
    {
        throw "No User Movie data found";
    }
    if(!entry.value.dateWatched)
    {
        throw "No Date Watched found";
    }
    return entry.value.dateWatched;
    return;
};

export const setRewatchCount = async (movieId, userId, val)=>
{
    checkValidId(movieId);
    checkValidId(userId);
    checkValidNumber(val);
    const userMovies = await userMovieData();
    let entry = await userMovies.findOne({
        userId: userId,
        movieId:movieId
    });
    if(!entry)
    {
        throw "No User Movie Data Found";
    }
    if(val > 999 || val < 0)
    {
        throw "You cannot watch it less than 0 times or greater than 999 times.";
    }
     entry = await userMovies.findOneAndUpdate(
        { userId: userId,movieId:movieId},
        {$set: {rewatchCount: val}}, 
        {returnDocument: "after"});
    if(entry.value.rewatchCount === undefined)
    {
        throw "Not updated correctly";
    }
    return entry.value.rewatchCount;
};

export const setReviewDescription = async (movieId, userId, val)=>
{
    checkValidId(movieId);
    checkValidId(userId);
    checkValidString(val);
    const userMovies = await userMovieData();
    const entry = await userMovies.findOneAndUpdate(
        { userId: userId,movieId:movieId},
        {$set: {reviewDescription: val}}, 
        {returnDocument: "after"});
    if(!entry.value)
    {
        throw "No User Movie data found";
    }
    if(!entry.value.reviewDescription)
    {
        throw "No rating found";
    }
    return entry.value.reviewDescription;
};

