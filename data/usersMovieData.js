import {
  checkValidString,
  checkValidId,
  checkValidNumber,
} from "../helpers.js";
import * as helpers from "../helpers.js";
import { ObjectId } from "mongodb";
import { userMovieData } from "../config/mongoCollections.js";
import JSZip from "jszip";


export const unZip = async (zipBuffer) => {
  const zip = await JSZip.loadAsync(zipBuffer);
  //learned how to use jzip from google as wasn't sure how to unzip with current node
  const getFileText = async (fileName) => {
    const file = zip.file(fileName);
    if (!file) {
      return null;
    }
    return await file.async("string");
  };

  const diaryCSV = await getFileText("diary.csv");
  const ratingsCSV = await getFileText("ratings.csv");
  const reviewsCSV = await getFileText("reviews.csv");

  return {
    diaryCSV: diaryCSV,
    ratingsCSV: ratingsCSV,
    reviewsCSV: reviewsCSV,
  };
};


export const parse = (csvText) => {
  if (!csvText) {
    return [];
  }

  const lines = csvText.split("\n");
  if (lines.length < 2) {
    return [];
  }

  const firstLine = lines[0];
  const headers = [];
  let curr = "";
  let inQuotes = false;

  for (let i = 0; i < firstLine.length; i++) {
    const c = firstLine[i];

    if (c === '"') {
      inQuotes = !inQuotes;
    } else if (c === "," && !inQuotes) {
      headers.push(curr.trim().replace(/\r/g, "")); // regex from google
      curr = "";
    } else {
      curr += c;
    }
  }
  headers.push(curr.trim().replace(/\r/g, "")); // regex from google

  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) {
      continue;
    }

    const vals = [];
    curr = "";
    inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        vals.push(curr.trim().replace(/\r/g, "")); // I got this regex from google
        curr = "";
      } else {
        curr += c;
      }
    }
    vals.push(curr.trim().replace(/\r/g, "")); // i got this regex from google

    const row = {};
    for (let k = 0; k < headers.length; k++) {
      row[headers[k]] = vals[k] || "";
    }
    rows.push(row);
  }
  return rows;
};


export const getRating = async (movieId, userId) => {
  checkValidId(movieId);
  checkValidId(userId);
  const userMovies = await userMovieData();

  const entry = await userMovies.findOne({
    userId: new ObjectId(userId),
    movieId: new ObjectId(movieId),
  });

  if (!entry) {
    throw "No user movie data found";
  }

  return entry.rating;
};


export const getDateWatched = async (movieId, userId) => {
  checkValidId(movieId);
  checkValidId(userId);
  const userMovies = await userMovieData();
  const entry = await userMovies.findOne({
    userId: userId,
    movieId: movieId,
  });
  if (!entry) {
    throw "No User Movie data found";
  }
  return entry.dateWatched;
};

export const getRewatchCount = async (movieId, userId) => {
  checkValidId(movieId);
  checkValidId(userId);
  const userMovies = await userMovieData();
  const entry = await userMovies.findOne({
    userId: userId,
    movieId: movieId,
  });
  if (!entry) {
    throw "No User Movie data found";
  }
  if (entry.rewatchCount === undefined) {
    return 0;
  }
  return entry.rewatchCount;
};

export const getReviewDescription = async (movieId, userId) => {
  checkValidId(movieId);
  checkValidId(userId);
  const userMovies = await userMovieData();
  const entry = await userMovies.findOne({
    userId: userId,
    movieId: movieId,
  });
  if (!entry) {
    throw "No User Movie data found";
  }
  if (!entry.reviewDescription) {
    return "";
  }
  return entry.reviewDescription;
};


export const getAllMoviesWatched = async (userId) => {
  checkValidId(userId, "userId");
  const userMovies = await userMovieData();
  const entry = await userMovies
    .find({
      userId: new ObjectId(userId),
    })
    .toArray();
  if (entry.length === 0) {
    throw "None found";
  }
  return entry;
};

export const setRating = async (movieId, userId, val) => {
  checkValidId(movieId);
  checkValidId(userId, "userId");
  checkValidNumber(val, "Rating");
  if (val < 0 || val > 5) {
    throw "Rating has to be betweeen 0 and 5";
  }
  const userMovies = await userMovieData();
  const entry = await userMovies.findOneAndUpdate(
    { userId: userId, movieId: movieId },
    { $set: { rating: val } },
    { returnDocument: "after" }
  );
  if (!entry.value) {
    throw "No User Movie data found";
  }
  if (entry.value.rating === null || entry.value.rating === undefined) {
    throw "No rating found";
  }
  return entry.value.rating;
};

export const setDateWatched = async (movieId, userId, val) => {
  checkValidId(movieId, "movieId");
  checkValidId(userId, "userID");
  checkValidString(val, "val");
  const userMovies = await userMovieData();
  const entry = await userMovies.findOneAndUpdate(
    { userId: userId, movieId: movieId },
    { $set: { dateWatched: val } },
    { returnDocument: "after" }
  );
  if (!entry.value) {
    throw "No User Movie data found";
  }
  if (!entry.value.dateWatched) {
    throw "No Date Watched found";
  }
  return entry.value.dateWatched;
};


export const setRewatchCount = async (movieId, userId, val) => {
  checkValidId(movieId);
  checkValidId(userId);
  checkValidNumber(val);
  let userMovies = await userMovieData();
  let entry = await userMovies.findOne({
    userId,
    movieId,
  });
  if (!entry) {
    throw "No User Movie Data Found";
  }
  if (val > 999 || val < 0) {
    throw "You cannot watch it less than 0 times or greater than 999 times.";
  }
  entry = await userMovies.findOneAndUpdate(
    { userId, movieId },
    { $set: { rewatchCount: val } },
    { returnDocument: "after" }
  );
  if (entry.value.rewatchCount === undefined) {
    throw "Not updated correctly";
  }
  return entry.value.rewatchCount;
};

export const setReviewDescription = async (movieId, userId, val) => {
  checkValidId(movieId);
  checkValidId(userId);
  checkValidString(val);
  const userMovies = await userMovieData();
  const entry = await userMovies.findOneAndUpdate(
    { userId: userId, movieId: movieId },
    { $set: { reviewDescription: val } },
    { returnDocument: "after" }
  );
  if (!entry.value) {
    throw "No User Movie data found";
  }
  if (!entry.value.reviewDescription) {
    throw "No rating found";
  }
  return entry.value.reviewDescription;
};

export const addMovieForUser = async (movieId, userId, movieName, rating) => {
  helpers.checkValidId(movieId);
  helpers.checkValidId(userId);
  helpers.checkValidString(movieName);

  helpers.checkValidNumber(rating)

  if (rating < 0 || rating > 5) throw "invalid rating"


  const collection = await userMovieData();

  let date = new Date()
  let year = date.getFullYear();

  let month = date.getMonth() + 1;
  if (month < 10) {
    month = '0' + month;
  }

  let day = date.getDate();
  if (day < 10) {
    day = '0' + day;
  }

  let formattedDate = year + '-' + month + '-' + day;

  const newEntry = {
    userId: new ObjectId(userId),
    movieId: new ObjectId(movieId),
    movieName: movieName.trim(),
    rating: rating,
    dateWatched: formattedDate,
    rewatchCount: 0,
    reviewDescription: "",
  };

  const insertInfo = await collection.insertOne(newEntry);

  if (!insertInfo.acknowledged) {
    throw "Could not add movie for user";
  }

  return true;
};
