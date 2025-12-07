import {checkValidString, checkValidId,checkValidNumber} from "../helpers.js";
import { ObjectId } from "mongodb";
import { userMovieData } from '../config/mongoCollections.js';//still needs to be added in config. collection 3 according to db prop
import JSZip from "jszip";

// This takes the raw ZIP file the user uploads and opens it.
// Inside the ZIP, we expect three files:
// - diary.csv
// - ratings.csv
// - reviews.csv
// This function pulls each one out and returns the *text* inside them.
// We don’t parse anything here — we ONLY extract the files.
// Example return object:
//     {
//         diaryCSV:   "...csv text...",
//         ratingsCSV: "...csv text...",
//         reviewsCSV: "...csv text..."
//     }
// After this step, the caller will pass each CSV into parse().
export const unZip = async(zipBuffer)=>
{
    
    const zip = await JSZip.loadAsync(zipBuffer);

    // Helper to pull a single file out of the zip
    const getFileText = async (fileName) => {
        const file = zip.file(fileName);
        if (!file) return null;
        return await file.async("string");
    };

    // I’m splitting everything into separate variables
    // so it's easier to debug and follow.
    const diaryCSV     = await getFileText("diary.csv");
    const ratingsCSV   = await getFileText("ratings.csv");
    const reviewsCSV   = await getFileText("reviews.csv");

    return {
        diaryCSV: diaryCSV,
    ratingsCSV: ratingsCSV,
    reviewsCSV: reviewsCSV
    };
};

// This turns a CSV file (as a big string) into a list of objects.
// Each object represents one line/row from the CSV.
// For example, if the CSV has:
//         Movie,Rating
//         Inception,5
//         Dune,4
//     Then parse() returns:
//     [
//         { Movie: "Inception", Rating: "5" },
//         { Movie: "Dune",      Rating: "4" }
//     ]
// This makes it way easier for us to work with the CSV when inserting
// things into our database.
export const parse = (csvText) => {
    if (!csvText || typeof csvText !== "string") {
        return [];
    }

    // Split into lines
    const lines = csvText.split(/\r?\n/);

    // Need at least header + 1 row
    if (lines.length < 2) {
        return [];
    }

    // Parse headers
    const headerLine = lines[0];
    const headerParts = headerLine.split(",");
    const headers = [];

    for (let i = 0; i < headerParts.length; i++) {
        headers.push(headerParts[i].trim());
    }

    const rows = [];

    // Parse each data row
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line === "") {
            continue;
        }

        const parts = line.split(",");
        const obj = {};

        for (let j = 0; j < headers.length; j++) {
            let value = "";

            if (parts[j] !== undefined && parts[j] !== null) {
                value = parts[j].trim();
            }

            obj[headers[j]] = value;
        }

        rows.push(obj);
    }

    return rows;
};

//  Returns the rating that THIS user gave to THIS movie.
//Used when:
// - showing a user their movie list
// - Lucas needs everyone’s ratings to compute averages
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

// Returns the date the user originally watched the movie.
// Example return:
// "2024-03-14"
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

// Returns how many times the user has rewatched this movie.
// If we never recorded it, we assume 0.
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
// Returns the text review the user wrote for this movie.
// If they didn’t write a review, returns an empty string.
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

// Returns a list of ALL movies this user has in our database.

//     Each entry looks something like:
//     {
//         userId: "abc123",
//         movieId: "550",
//         rating: 5,
//         dateWatched: "2024-01-01",
//         rewatchCount: 2,
//         reviewDescription: "Amazing movie!"
//     }

//     Lucas will loop through this to compute things like:
//         - average rating
//         - total movies watched
//         - watch statistics
export const getAllMoviesWatched = async(userId) =>
{
    checkValidId(userId);
    const userMovies = await userMovieData();
    const entry = await userMovies.find({
        userId: userId}).toArray();
    if(entry.length === 0)
    {
        throw "None found";
    }
    return entry;
};
// Returns an array of ALL movie records this user has in the database.
// Each object includes movieId, rating, dateWatched, reviewDescription, etc.
// Other files (like accounts.js) will loop through this to compute stats
// such as total movies watched, total rewatches, average rating, etc. In accounts.js lucas can do  this
//const movies = await getAllMoviesWatched(userId);
//const totalMovies = movies.length;


// Updates the user's rating for this movie.
// Returns whatever the new rating is.
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

//  Updates the date the user watched the movie.
//  Returns the updated date.
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
};

// Updates how many times the user has rewatched the movie.
// Used when a user manually edits their movie details.
//Returns the updated rewatch count.
export const setRewatchCount = async (movieId, userId, val)=>
{
    checkValidId(movieId);
    checkValidId(userId);
    checkValidNumber(val);
    let userMovies = await userMovieData();
    let entry = await userMovies.findOne({
         userId,movieId
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
        {userId,movieId},
        {$set: {rewatchCount: val}}, 
        {returnDocument: "after"});
    if(entry.value.rewatchCount === undefined)
    {
        throw "Not updated correctly";
    }
    return entry.value.rewatchCount;
};

// Updates the written review the user left for this movie.
// Returns the updated review text.
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

