import {movies, /*actors, crew, genres, posters, studios, themes*/} from '../config/mongoCollections.js'
import {ObjectId} from 'mongodb'
import * as helpers from "../helpers.js"

export const seedDatabase = async () => {
  const movieCollection = await movies();
  //using all the csv's

  //for every line of csv create new x
}

export const createNewMovie = async (
  _id,
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

  if (!Number.isInteger(_id) || _id <= 0) 
  {
    throw 'Movie ID must be a positive integer';
  }

  helpers.checkValidString(name, "Movie Name")

  if (!Number.isInteger(date) || date < 1800 || date > new Date().getFullYear() + 1) 
  {
    throw 'Invalid release year';
  }

  helpers.checkValidString(tagline, "Movie Tagline")
  helpers.checkValidString(description, "Movie Description")
  
  if (!Number.isInteger(minute) || minute <= 0) 
  {
    throw 'Movie minutes must be a positive integer';
  }

  if (typeof rating !== "number" || rating < 0 || rating > 5) 
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

  const movieCollection = await movies();
  let newMovie = {
    _id,
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
    studios
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
