import {movies, /*actors, crew, genres, posters, studios, themes*/} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb'
import * as helpers from "../helpers.js"

import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { fileURLToPath } from "url";


export const seedDatabase = async () => {  
  console.log("Starting to Seed")

  const moviesList = await loadCsvAsArray("./database/movies.csv")

  console.log("Movies has been loaded")

  const posters = await loadCsvAsArray("./database/posters.csv")
  const studios = await loadCsvAsArray("./database/studios.csv")
  const themes = await loadCsvAsArray("./database/themes.csv")
  const genres = await loadCsvAsArray("./database/genres.csv")
  const actors = await loadCsvAsArray("./database/actors.csv")
  const crew = await loadCsvAsArray("./database/crew.csv")
  
  console.log("csv's have been turned into arrays")
  
  const posterList = {}
  for (const poster of posters) 
  {
    posterList[poster.id] = poster.link
  }

  const studiosGrouped = groupById(studios, "studio")
  const themesGrouped = groupById(themes, "theme")
  const genresGrouped = groupById(genres, "genre")

  const directors = crew.filter((row) => row.role === "Director")
  const directorsGrouped = groupById(directors, "name")

  const actorsGrouped = {}

  for (const row of actors) {
    const id = row.id

    if (!actorsGrouped[id]) {
      actorsGrouped[id] = []
    }
    if (!row.role || row.role.trim() === ''){
      row.role = "Unknown Role"
    }
    actorsGrouped[id].push(
      {
        name: row.name,
        role: row.role
      }
    )
  }


  console.log("Arrays have been formatted")

  for (const movie of moviesList) {
    const id = movie.id
    movie.posterUrl = posterList[id]
    movie.studios = studiosGrouped[id] ?? ["Unknown Studios"];
    movie.themes  = themesGrouped[id]  ?? ["Unknown Themes"];
    movie.genres  = genresGrouped[id]  ?? ["Unknown Genres"];
    movie.actors  = actorsGrouped[id]  ?? [{name: "Unknown Actors", role: "Unknown Roles"}];
    movie.directors = directorsGrouped[id] ?? ["Unknown Directors"];


    if (!movie.tagline || movie.tagline.trim() === '') {
      movie.tagline = "No Tagline"
    }
    if (!movie.description || movie.description.trim() === '') {
      movie.description = "No Description"
    }
    if (!movie.posterUrl || movie.posterUrl.trim() === '') {
      movie.posterUrl = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg?20200913095930"
    }
    if (!movie.rating || movie.rating.trim() === '') {
      movie.rating = NaN
    }
    if (!movie.minute || movie.minute.trim() === '') {
      movie.minute = NaN
    }
    if (!movie.date || movie.date.trim() === '') {
      movie.date = NaN
    }

    console.log(movie)

    await createNewMovie(
      Number(movie.id),
      movie.name,
      Number(movie.date),
      movie.tagline ,
      movie.description,
      Number(movie.minute),
      Number(movie.rating),
      movie.directors,
      movie.actors,
      movie.genres,
      movie.posterUrl,
      movie.themes,
      movie.studios,
    )
  }

}

//https://www.npmjs.com/package/csv-parser
const loadCsvAsArray = (csvFilePath) => {
  return new Promise((resolve, reject) => {
    const arr = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on("data", (data) => arr.push(data))
      .on("end", () => resolve(arr))
      .on("error", reject);
  });
}

const groupById = (arr, key) => {
  const output = {};
  for (const row of arr) {
    const id = row.id;
    if (!output[id]) output[id] = [];
    output[id].push(row[key]);
  }
  return output;
}

export const createNewMovie = async (
  popularity,
  name,
  date,
  tagline,
  description,
  minute,
  rating,
  directors,//array
  actors,//array
  genres,//array
  posterUrl,
  themes,//array
  studios//array
) => {

  if (!Number.isInteger(popularity) || popularity <= 0) 
  {
    throw 'Movie ID must be a positive integer';
  }

  helpers.checkValidString(name, "Movie Name")

  if ((!Number.isInteger(date) || date < 1800 || date > 2050) && !Number.isNaN(date)) 
  {
    throw 'Invalid release year';
  }

  helpers.checkValidString(tagline, "Movie Tagline")
  helpers.checkValidString(description, "Movie Description")
  
  if (!Number.isInteger(minute) && !Number.isNaN(minute)) 
  {
    throw 'Movie minutes must be a positive integer';
  }

  if ((typeof rating !== "number" || rating < 0 || rating > 5) && !Number.isNaN(rating)) 
  {
    throw 'Rating must be a number between 0 and 5';
  }

  helpers.checkValidString(posterUrl, "Poster Url")
  helpers.checkValidStringArray(directors, "Directors")
  
  if (!Array.isArray(actors)) {
    throw "Actors must be an array";
  }
  if (actors.length === 0) {
    throw "Actors array cannot be empty";
  }
  actors.forEach((actor, index) => {
    if (typeof actor !== "object" || actor === null || Array.isArray(actor)) 
    {
      throw `Actor at index ${index} must be an object`;
    }
    if (!actor.name || typeof actor.name !== "string") 
    {
      throw `Actor at index ${index} must have a valid 'name' string`;
    }
    if (actor.name.trim().length === 0) 
    {
      throw `Actor name at index ${index} cannot be empty`;
    }
    if (!actor.role || typeof actor.role !== "string") 
    {
      throw `Actor at index ${index} must have a valid 'role' string`;
    }
    if (actor.role.trim().length === 0) 
    {
      throw `Actor role at index ${index} cannot be empty`;
    }
  })

  helpers.checkValidStringArray(genres, "Genres")
  helpers.checkValidStringArray(themes, "Themes")
  helpers.checkValidStringArray(studios, "Studios")

  let comments = []

  const movieCollection = await movies();
  let newMovie = 
  {
    popularity,
    name,
    date,
    tagline,
    description,
    minute,
    rating,
    directors,
    actors,
    genres,
    posterUrl,
    themes,
    studios, 
    comments
  }

  const insertInfo = await movieCollection.insertOne(newMovie);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
  {
    throw 'Error: Could not add movie';
  }
  const newId = insertInfo.insertedId.toString();

  // const movie = await getMovieById(newId);
  return newId;
}

export const getMovieById = async (id) => {
  if (!id)
  {
    throw "Id must be supplied"
  }
  if (typeof id !== "string") 
  {
    id = id.toString();
  }
  id = id.trim();
  if (!ObjectId.isValid(id)) 
  {
    throw "Movie ID must be a valid Object ID";
  }
  const movieCollection = await movies();
  const movie = await movieCollection.findOne({ _id: new ObjectId(id) });
  if (!movie) 
  {
    throw "No movie with that id";
  }
  return movie;
};

export const getMoviesByDirector = async (name) => {
  helpers.checkValidString(name, "Director name");
  const movieCollection = await movies();
  return movieCollection.find({directors: name.trim() }).toArray();
};

export const getMoviesByActor = async (name) => {
  helpers.checkValidString(name, "Actor name");
  const movieCollection = await movies();
  return movieCollection.find({"actors.name": name.trim() }).toArray();
};

export const getMoviesByGenre = async (genre) => {
  helpers.checkValidString(genre, "Genre");
  const movieCollection = await movies();
  return movieCollection.find({ genres: genre.trim() }).toArray();
};

export const getMoviesByStudio = async (studio) => {
  helpers.checkValidString(studio, "Studio");
  const movieCollection = await movies();
  return movieCollection.find({ studios: studio.trim() }).toArray();
};

export const getMoviesByTheme = async (theme) => {
  helpers.checkValidString(theme, "Theme");
  const movieCollection = await movies();
  return movieCollection.find({ themes: theme.trim() }).toArray();
};

export const getMoviesByYear = async (year) => {
  if (!Number.isInteger(year) || year < 1800 || year > 2050)
    throw "Invalid year";
  const movieCollection = await movies();
  return movieCollection.find({ date: year }).toArray();
};

export const getMoviesByName = async (name) => {
  helpers.checkValidString(name, "Name");
  const movieCollection = await movies();
  return movieCollection.find({ names: name.trim() }).toArray();
};

export const getMoviesByPopularity = async (popularity) => {
  helpers.checkValidString(popularity, "Popularity");
  const movieCollection = await movies();
  return movieCollection.findOne({ popularity });

};

//super comment is for when a comment is made under another comment rather than just on the movie
export const createComment = async (movieId, userId, username, text, superCommentId) => {
  if (!movieId || !ObjectId.isValid(movieId)) 
  {
    throw "Movie ID must be a valid ObjectId";
  }
  if (!userId || !ObjectId.isValid(userId)) 
  {
    throw "User ID must be a valid ObjectId";
  }
  helpers.checkValidString(username, "Username");
  helpers.checkValidString(text, "Comment Body");
  if (superCommentId && !ObjectId.isValid(superCommentId)) 
  {
    throw "Super Comment ID must be a valid ObjectId";
  }

  let comment = {
    _id: new ObjectId(),
    userId,
    username,
    text,
    postedAt: new Date(),
    likes: [],
    subcomments: []
  }

  let movie = await getMovieById(movieId);
  let comments = movie.comments

  if (superCommentId){
    replyToComment(comments, superCommentId, comment);
  } else {
    comments.push(comment);
  }
  const movieCollection = await movies();

  const awaitInfo = await movieCollection.updateOne({ _id: new ObjectId(movieId) }, {$set: {comments: comments}});
  if (!awaitInfo.acknowledged || awaitInfo.modifiedCount === 0)
  {
    throw 'Error: Could not add comment';
  }
  return comments;
}

const replyToComment = (comments, id, newComment) => {
  for (let comment of comments) 
  {
    if (comment._id.toString() === id.toString()) 
    {
      comment.subcomments.push(newComment)
      return comments
    }
    let newSubcomments = replyToComment(comment.subcomments, id, newComment)
    if (newSubcomments)
    {
      comment.subcomments = newSubcomments;
      return comments;
    }
  }
  return null;
}

export const toggleLike = async (movieId, commentId, userId) => {
  if (!movieId || !ObjectId.isValid(movieId)) 
  {
    throw "Movie ID must be a valid ObjectId";
  }
  if (!userId || !ObjectId.isValid(userId)) 
  {
    throw "User ID must be a valid ObjectId";
  }
  if (!commentId || !ObjectId.isValid(commentId)) 
  {
    throw "Comment ID must be a valid ObjectId";
  }

  let movie = await getMovieById(movieId);
  let comments = movie.comments

  comments = findAndToggle(comments, commentId, userId)

  const movieCollection = await movies();
  const awaitInfo = await movieCollection.updateOne({_id: movieId}, {$set: {comments: comments}});
  if (!awaitInfo.acknowledged || awaitInfo.modifiedCount === 0)
  {
    throw 'Error: Could not add comment';
  }
  return comments
}

const findAndToggle =  (comments, id, userId) => {
  for (let comment of comments) 
  {
    if (comment._id.toString() === id.toString()) 
    {
      let index = comment.likes.findIndex(u => u.toString() === userId.toString());
      if (index !== -1)
      {
        comment.likes.splice(index, 1)
      }
      else
      {
      comment.likes.push(userId)
      }
      return comments
    }
    let newSubcomments = findAndToggle(comment.subcomments, id, userId)
    if (newSubcomments != null)
    {
      comment.subcomments = newSubcomments;
      return comments;
    }
  }
  return null;
}

/*
These may be valuable for other search functions however may be unneccesary if all is held in the movie collection

export const createNewActor = async (
  movieId,
  name,
  role
) => {
  const actorCollection = await actors();
  let newActor = {
    movieId,
    name,
    role
  }

  helpers.checkValidNumber(movieId, "Movie ID")
  helpers.checkValidString(name, "Actor Name")
  helpers.checkValidString(role, "Actor Role")

  const insertInfo = await actorCollection.insertOne(newActor);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
  {
    throw 'Error: Could not add actor';
  }
  // const newId = insertInfo.insertedId.toString();

  // const movie = await getMovieById(newId);
  // return newId;
}

export const createNewCrew = async (
  movieId,
  role,
  name
) => {
  const crewCollection = await crew();
  let newCrew = {
    movieId,
    role,
    name
  }

  helpers.checkValidNumber(movieId, "Movie ID")
  helpers.checkValidString(name, "Crew Name")
  helpers.checkValidString(role, "Crew Role")

  const insertInfo = await crewCollection.insertOne(newCrew);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
  {
    throw 'Error: Could not add crew';
  }
  // const newId = insertInfo.insertedId.toString();

  // const movie = await getMovieById(newId);
  // return newId;
}

export const createNewGenre = async (
  movieId,
  genre
) => {
  const genreCollection = await genres();
  let newGenre = {
    movieId,
    genre
  }

  helpers.checkValidNumber(movieId, "Movie ID")
  helpers.checkValidString(genre, "Genre")

  const insertInfo = await genreCollection.insertOne(newGenre);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
  {
    throw 'Error: Could not add genre';
  }
  // const newId = insertInfo.insertedId.toString();

  // const movie = await getMovieById(newId);
  // return newId;
}

export const createNewPoster = async (
  movieId,
  poster
) => {
  const posterCollection = await posters();
  let newPoster = {
    movieId,
    poster
  }

  helpers.checkValidNumber(movieId, "Movie ID")
  helpers.checkValidString(poster, "Poster")

  const insertInfo = await posterCollection.insertOne(newPoster);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
  {
    throw 'Error: Could not add poster';
  }
  // const newId = insertInfo.insertedId.toString();

  // const movie = await getMovieById(newId);
  // return newId;
}

export const createNewStudio = async (
  movieId,
  studio
) => {
  const studioCollection = await studios();
  let newStudio = {
    movieId,
    studio
  }

  helpers.checkValidNumber(movieId, "Movie ID")
  helpers.checkValidString(studio, "Studio")

  const insertInfo = await studioCollection.insertOne(newStudio);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
  {
    throw 'Error: Could not add studio';
  }
  // const newId = insertInfo.insertedId.toString();

  // const movie = await getMovieById(newId);
  // return newId;
}

export const createNewTheme = async (
  movieId,
  theme
) => {
  const themeCollection = await themes();
  let newTheme = {
    movieId,
    theme
  }

  helpers.checkValidNumber(movieId, "Movie ID")
  helpers.checkValidString(theme, "Theme")

  const insertInfo = await themeCollection.insertOne(newTheme);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
  {
    throw 'Error: Could not add theme';
  }
  // const newId = insertInfo.insertedId.toString();

  // const movie = await getMovieById(newId);
  // return newId;
}
*/
