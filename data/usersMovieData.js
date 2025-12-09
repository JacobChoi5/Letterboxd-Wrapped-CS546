
import {checkValidString, checkValidId,checkValidNumber} from "../helpers.js";
import { ObjectId } from "mongodb";
import { userMovieData } from '../config/mongoCollections.js';//still needs to be added in config. collection 3 according to db prop
import JSZip from "jszip";

// This take s the raw ZIP file the user uploads and opens it.
// Inside the ZIP, we need the  three files
// diary.csv, ratings.csv reviews.csv
// This function pulls each one out and returns the *text* inside them.
// We don’t parse anything here  we are extracting the files from the zip.
// ex return object:
//     {
//         diaryCSV:   "...csv text...",
//         ratingsCSV: "...csv text...",
//         reviewsCSV: "...csv text..."
//     }
// After this step, the caller will pass each CSV into parse() function.
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

// This turns a CSV file as a big string into a list of objects and so  each object represents one line/row from the CSV.
// ex the csv has 
//         Movie,Rating
//         Inception,5
//         Dune,4
// then parse() will return
//     [
//         { Movie: "Inception", Rating: "5" },
//         { Movie: "Dune",      Rating: "4" }
//     ]
// This makes it way easier for us to work with the CSV when inserting
// things into our database otherwise its a horrible issue.
export const parse = (csvText) => {
    if (!csvText) 
        {
        return [];
    }
    
    const lines = csvText.split("\n");
    if (lines.length < 2) 
        {
        return [];
    }
    
    // parse headers
    const firstLine = lines[0];
    const headers = [];
    let curr = "";
    let inQuotes = false;
    
    for (let i = 0; i < firstLine.length; i++) {
        const c = firstLine[i];
        
        if (c === '"') 
            {
            inQuotes = !inQuotes;
        } 
        else if (c === ',' && !inQuotes) 
            {
            headers.push(curr.trim().replace(/\r/g, "")); // regex from google
            curr = "";
        } 
        else 
            {
            curr += c;
        }
    }
    headers.push(curr.trim().replace(/\r/g, "")); // regex from google 
    
    const rows = [];
    
    for (let i = 1; i < lines.length; i++) 
        {
        const line = lines[i];
        if (!line.trim()) 
            {
            continue;
        }
        
        const vals = [];
        curr = "";
        inQuotes = false;
        
        for (let j = 0; j < line.length; j++) 
            {
            const c = line[j];
            if (c === '"') 
                {
                inQuotes = !inQuotes;
            } 
            else if (c === ',' && !inQuotes) 
                {
                vals.push(curr.trim().replace(/\r/g, ""));// I got this regex from google 
                curr = "";
            } 
            else 
                {
                curr += c;
            }
        }
        vals.push(curr.trim().replace(/\r/g, "")); // i got this regex from google 
        
        const row = {};
        for (let k = 0; k < headers.length; k++) 
            {
            row[headers[k]] = vals[k] || "";
        }
        rows.push(row);
    }
    return rows;
};

//  Returns the rating that this specfic user gave to this movie.
// it is used when showing a user their movie list
// Also lucas you need everyone’s ratings to compute averages
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
// Ex return "2024-03-14"
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

// Returns how many times the user has rewatched this movie. If we never recorded it, then we basically we assume 0.
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

// This will returns the text review the user wrote for this movie. And if they didn’t write a review, returns an empty string.
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

// This returns a list of all movies this user has in our database.
// Each entry/piece looks something like:
//     {
//         userId: "abc123",
//         movieId: "550",
//         movieName: "Name"
//         rating: 5,
//         dateWatched: "2024-01-01",
//         rewatchCount: 2,
//         reviewDescription: "Amazing movie!"
//     }
// Lucas you will  will loop through this to compute things like:
// average rating, the total movies watched and watch statistics
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
// More Info Lucas, this returns an array of all movie records this user has in the database.
// Each object includes movieName,movieId, rating, dateWatched, reviewDescription, etc.
// Other files (like accounts.js) will loop through this to compute stats
// such as total movies watched, total rewatches, average rating, and the rest of stuff. In accounts.js, lucas, you  can do  this
//const movies = await getAllMoviesWatched(userId);
//const totalMovies = movies.length; or something like that


// This will update the user's rating for this movie if they change it. This will returns whatever the new rating is.
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

// This is basically Uudating the date the user watched the movie. This returns the updated date.
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

// This will update how many times the user has rewatched the movie. THis is used when a user manually edits their movie details.
//This Returns the updated rewatch count.
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

// This will updates the written review the user left for this movie and returns the updated review text.
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

