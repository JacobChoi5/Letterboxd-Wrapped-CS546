import {checkValidString, checkValidId} from helpers.js
import { ObjectId } from "mongodb";

export const unZip = async()=>
{
return;
};

export const parse = async() =>
{
    return;
};

export const getRating = async (movieId, userId) => 
    {
    // validate both IDs
    checkValidId(movieId);
    checkValidId(userId);

    const userMovies = await userMovieDataCollection();

    const entry = await userMovies.findOne({
        userId: userId,
        movieId: movieId
    });

    if (!entry) throw "No user movie data found";

    return entry.rating;
};

export const getDateWatched = async ()=>
{
    return;
};

export const getRewatchCount = async ()=>
{
    return;
};

export const getReviewDescription = async ()=>
{
    return;
};

export const  setRating = async ()=>
{
    return;
};

export const setDateWatched = async ()=>
{
    return;
};

export const setRewatchCount = async ()=>
{
    return;
};

export const setReviewDescription = async ()=>
{
    return;
};