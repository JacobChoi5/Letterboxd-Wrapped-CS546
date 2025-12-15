import { checkValidString, checkValidAge, checkValidId } from "../helpers.js";
import * as csvData from "../data/usersMovieData.js";
import * as movieData from "../data/movies.js";
import { accounts, userMovieData } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";

//fix statistics
//ensure top actors does not have a logic issue

export const createAccount = async (
  username,
  password,
  age,
  isAdmin,
  isPrivate,
  profile_description,
  zip_files,
  followers,
  following
) => {
  //validate string parameters
  checkValidString(username, "username");
  checkValidString(password, "password");

  //valide age
  checkValidAge(age);

  isPrivate = false;

  if (typeof isPrivate != "boolean") {
    isPrivate = false;
  }

  if (profile_description != "" && typeof profile_description == "string") {
    checkValidString(profile_description);
  }

  if (!Array.isArray(zip_files)) {
    zip_files = [];
  }

  followers = [];
  following = [];

  let newAccount = {
    username: username,
    password: password,
    age: age,
    isAdmin: isAdmin,
    isPrivate: isPrivate,
    profile_description: profile_description,
    zip_files: zip_files,
    followers: followers,
    following: following,
  };

  const accountCollection = await accounts();
  //Source: https://www.geeksforgeeks.org/mongodb/mongodb-query-with-case-insensitive-search/
  const checkUser = await accountCollection.findOne({
    username: { $regex: `^${username}$`, $options: "i" },
  });

  if (checkUser) {
    throw "You may not make an account with a username that has been claimed by another user. Try a different username.";
  }

  const insertInfo = await accountCollection.insertOne(newAccount);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not create account. Try again later.";

  const newId = insertInfo.insertedId.toString();

  const account = await getAccountById(newId);
  return account;
};

export const createStatsObject = async (id) => {
  let all_time = await calculateStatistics(id, "all");
  let year = await calculateStatistics(id, "year");
  let month = await calculateStatistics(id, "month");

  let statistics_object = { all_time, year, month };
  return statistics_object;
};

/* Issues: allegedly the zip_files parameter is never anything but empty. jacob may be calling calcstats 
right when the user logs in. but if there are no zip files uploaded, then it would error */
export const calculateStatistics = async (id, period) => {
  // all, year, month

  //movie data is in the userMovieData Collection

  checkValidId(id, "id");
  checkValidString(period);

  if (period != "all" && period != "year" && period != "month") {
    throw "The period parameter in calcStats must be all, year, or month";
  }

  let movies_watched = await csvData.getAllMoviesWatched(id);
  if (!movies_watched) throw "Could not get all movies";

  let currentDate = new Date();

  if (period == "year") {
    let lastYearDate = new Date();
    lastYearDate.setFullYear(currentDate.getFullYear() - 1);
    movies_watched = movies_watched.filter((movie) => {
      let watchedDate = new Date(movie.dateWatched);
      return watchedDate >= lastYearDate;
    });
  } else if (period == "month") {
    let lastMonthDate = new Date();
    lastMonthDate.setMonth(currentDate.getMonth() - 1);
    movies_watched = movies_watched.filter((movie) => {
      let watchedDate = new Date(movie.dateWatched);
      return watchedDate >= lastMonthDate;
    });
  } else {
  }

  let genre_list = [];
  let director_list = [];
  let actor_list = [];
  let global_rating_list = [];
  let duration_list = [];

  //could instead loop over getMovieById for each movie, save to list, then loop over the result so we do not keep making database calls
  for (let movie of movies_watched) {
    let the_movie = 0;
    if (movie.movieId != null) {
      the_movie = await movieData.getMovieById(movie.movieId);
    } else {
      continue;
    }

    if (the_movie["genres"] !== "Unknown Genres") {
      genre_list.push(the_movie["genres"]);
    }

    if (the_movie["directors"] !== "Unknown Directors") {
      director_list.push(the_movie["directors"]);
    }

    actor_list.push(the_movie["actors"]);

    if (!Number.isNaN(the_movie["rating"])) {
      global_rating_list.push(the_movie["rating"]);
    }

    if (!Number.isNaN(the_movie["minute"])) {
      duration_list.push(the_movie["minute"]);
    }
  }

  genre_list = genre_list.flat();
  director_list = director_list.flat();
  actor_list = actor_list.flat();

  //Top 3 genres: top_3_genres
  let genre_count = {};
  for (let genre of genre_list) {
    genre_count[genre] = (genre_count[genre] || 0) + 1;
  }

  let top_genre = "";
  let top_genre_count = 0;

  for (let str in genre_count) {
    if (genre_count[str] > top_genre_count) {
      top_genre_count = genre_count[str];
      top_genre = str;
    }
  }
  let genre1 = top_genre;
  delete genre_count[top_genre];
  top_genre = "";
  top_genre_count = 0;

  for (let str in genre_count) {
    if (genre_count[str] > top_genre_count) {
      top_genre_count = genre_count[str];
      top_genre = str;
    }
  }
  let genre2 = top_genre;
  delete genre_count[top_genre];
  top_genre = "";
  top_genre_count = 0;

  for (let str in genre_count) {
    if (genre_count[str] > top_genre_count) {
      top_genre_count = genre_count[str];
      top_genre = str;
    }
  }
  let genre3 = top_genre;
  let top_3_genres = [genre1, genre2, genre3];

  //Top 3 directors: top_3_directors
  //Top 3 genres: top_3_genres
  let director_count = {};
  for (let director of director_list) {
    director_count[director] = (director_count[director] || 0) + 1;
  }

  let top_director = "";
  let top_director_count = 0;

  for (let str in director_count) {
    if (director_count[str] > top_director_count) {
      top_director_count = director_count[str];
      top_director = str;
    }
  }
  let director1 = top_director;
  delete director_count[top_director];
  top_director = "";
  top_director_count = 0;

  for (let str in director_count) {
    if (director_count[str] > top_director_count) {
      top_director_count = director_count[str];
      top_director = str;
    }
  }
  let director2 = top_director;
  delete director_count[top_director];
  top_director = "";
  top_director_count = 0;

  for (let str in director_count) {
    if (director_count[str] > top_director_count) {
      top_director_count = director_count[str];
      top_director = str;
    }
  }
  let director3 = top_director;
  let top_3_director = [director1, director2, director3];

  //Top 3 actors: top_3_actors
  let actor_count = {};
  for (let actor of actor_list) {
    let name = actor.name;
    actor_count[name] = (actor_count[name] || 0) + 1;
  }

  let top_actor = "";
  let top_count = 0;

  for (let str in actor_count) {
    if (actor_count[str] > top_count) {
      top_count = actor_count[str];
      top_actor = str;
    }
  }
  let actor1 = top_actor;
  delete actor_count[actor1];
  top_actor = "";
  top_count = 0;

  for (let str in actor_count) {
    if (actor_count[str] > top_count) {
      top_count = actor_count[str];
      top_actor = str;
    }
  }
  let actor2 = top_actor;
  delete actor_count[actor2];
  top_actor = "";
  top_count = 0;

  for (let str in actor_count) {
    if (actor_count[str] > top_count) {
      top_count = actor_count[str];
      top_actor = str;
    }
  }
  let actor3 = top_actor;

  let top_3_actors = [actor1, actor2, actor3];

  //Average User Movie Rating: average_movie_rating
  let rating_list = [];
  for (let movie of movies_watched) {
    rating_list.push(movie["rating"]);
  }

  let rating_count = 0;
  let total = 0;
  for (let moving_rating of rating_list) {
    total += moving_rating;
    rating_count++;
  }

  let average_movie_rating = 0;
  if (rating_count !== 0) {
    average_movie_rating = total / rating_count;
  }

  average_movie_rating = Number(average_movie_rating.toFixed(2));
  //Average Different between user's rating and global movie averages: rating_difference
  let global_rating_count = 0;
  let global_total = 0;
  for (let global_movie_rating of global_rating_list) {
    global_total += global_movie_rating;
    global_rating_count++;
  }

  let global_average_movie_rating =
    "No movies you have watched have global ratings";
  if (global_rating_count != 0) {
    global_average_movie_rating = global_total / global_rating_count;
  }

  let rating_difference = 0;
  if (average_movie_rating == 0) {
    rating_difference = "You have not made any reviews.";
  } else {
    rating_difference = average_movie_rating - global_average_movie_rating;
  }

  rating_difference = rating_difference.toFixed(2);
  //Hours spent watching movies: hours_watching_movies
  let duration_count = 0;
  for (let duration of duration_list) {
    duration_count += duration;
  }

  let hours_watching_movies = duration_count / 60;

  hours_watching_movies = Number(hours_watching_movies.toFixed(2));

  //Recomendations

  //Recommendations based on genres
  let popularity_number = 1000001;
  let movie_genre_recommendation_list = [];

  while (true) {
    let popular_movie = await movieData.getMoviesByPopularity(
      popularity_number
    );

    if (!popular_movie) break;

    if (
      popular_movie.genres.includes(genre1) ||
      popular_movie.genres.includes(genre2) ||
      popular_movie.genres.includes(genre3)
    ) {
      let alreadyWatched = movies_watched.some(
        (movie) => movie["movieName"] === popular_movie["name"]
      );

      if (!alreadyWatched) {
        movie_genre_recommendation_list.push(popular_movie);
      }

      if (movie_genre_recommendation_list.length === 3) break;
    }
    popularity_number++;
  }

  //Recommendations based off actor
  popularity_number = 1000001;
  let movie_actor_recommendation_list = [];
  while (true) {
    let popular_movie = await movieData.getMoviesByPopularity(
      popularity_number
    );

    if (!popular_movie) break;

    if (
      popular_movie.actors.some((a) => a.name == actor1) ||
      popular_movie.actors.some((a) => a.name == actor2) ||
      popular_movie.actors.some((a) => a.name == actor3)
    ) {
      let alreadyWatched = movies_watched.some(
        (movie) => movie["name"] === popular_movie["name"]
      );

      if (!alreadyWatched) {
        movie_actor_recommendation_list.push(popular_movie);
      }

      if (movie_actor_recommendation_list.length === 3) break;
    }

    popularity_number++;
  }

  //Recommendations based off director
  popularity_number = 1000001;
  let movie_director_recommendation_list = [];
  while (true) {
    let popular_movie = await movieData.getMoviesByPopularity(
      popularity_number
    );

    if (!popular_movie) break;

    if (
      popular_movie.directors.includes(director1) ||
      popular_movie.directors.includes(director2) ||
      popular_movie.directors.includes(director3)
    ) {
      let alreadyWatched = movies_watched.some(
        (movie) => movie["name"] === popular_movie["name"]
      );

      if (!alreadyWatched) {
        movie_director_recommendation_list.push(popular_movie);
      }

      if (movie_director_recommendation_list.length === 3) break;
    }

    popularity_number++;
  }

  let movie_recommendations = {
    genre_based: movie_genre_recommendation_list,
    actor_based: movie_actor_recommendation_list,
    director_based: movie_director_recommendation_list,
  };

  let statistics = {
    movies_watched: movies_watched,
    genres: top_3_genres,
    directors: top_3_director,
    actors: top_3_actors,
    rating: average_movie_rating,
    global_difference: rating_difference,
    hours_watched: hours_watching_movies,
    recommendations: movie_recommendations,
  };
  return statistics;
};

export const importAllUserData = async (userId, zipBuffer) => {
  checkValidId(userId);

  const accountCol = await accounts();
  const movieCol = await userMovieData();

  const user = await accountCol.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw "User not found.";
  }

  const extracted = await csvData.unZip(zipBuffer);

  const diaryCSV = extracted.diaryCSV;
  const ratingsCSV = extracted.ratingsCSV;
  const reviewsCSV = extracted.reviewsCSV;

  if (!diaryCSV) {
    throw "ZIP file did not contain diary.csv.";
  }

  let diaryRows = [];
  let ratingRows = [];
  let reviewRows = [];

  if (diaryCSV) {
    diaryRows = csvData.parse(diaryCSV);
  }
  if (ratingsCSV) {
    ratingRows = csvData.parse(ratingsCSV);
  }
  if (reviewsCSV) {
    reviewRows = csvData.parse(reviewsCSV);
  }

  for (let i = 0; i < diaryRows.length; i++) {
    const row = diaryRows[i];

    if (!row["Name"] || !row["Year"]) {
      continue;
    }

    const movieName = row["Name"].trim();
    const year = Number(row["Year"]);

    let foundMovie = await movieData.findMovie(movieName, year);

    let movieId = null;
    if (foundMovie) {
      movieId = foundMovie._id;
    }

    let dateWatched = "";
    if (row["Date"]) {
      dateWatched = row["Date"].trim();
    }

    let rewatchCount = 0;
    if (row["Rewatch"] && String(row["Rewatch"]).toLowerCase() === "yes") {
      rewatchCount = 1;
    }

    const existing = await movieCol.findOne({
      userId: new ObjectId(userId),
      movieName: movieName,
      year: year,
    });

    if (existing) {
      await movieCol.updateOne(
        { userId: new ObjectId(userId), movieName: movieName, year: year },
        { $set: { dateWatched: dateWatched, rewatchCount: rewatchCount } }
      );
    } else {
      await movieCol.insertOne({
        userId: new ObjectId(userId),
        movieId: movieId,
        movieName: movieName,
        year: year,
        dateWatched: dateWatched,
        rating: null,
        rewatchCount: rewatchCount,
        reviewDescription: "",
        external: movieId === null,
      });
    }
  }

  for (let i = 0; i < ratingRows.length; i++) {
    const row = ratingRows[i];

    if (!row["Name"] || !row["Year"] || !row["Rating"]) {
      continue;
    }

    const movieName = row["Name"].trim();
    const year = Number(row["Year"]);
    const rating = Number(row["Rating"]);

    const foundMovie = await movieData.findMovie(movieName, year);
    if (!foundMovie) {
      continue;
    }
    await movieCol.updateOne(
      {
        userId: new ObjectId(userId),
        movieName: movieName,
        movieId: foundMovie._id,
      },
      { $set: { rating: rating } }
    );
  }

  for (let i = 0; i < reviewRows.length; i++) {
    const row = reviewRows[i];

    if (!row["Name"] || !row["Year"] || !row["Review"]) {
      continue;
    }

    const movieName = row["Name"].trim();
    const year = Number(row["Year"]);
    const reviewDescription = row["Review"].trim();

    await movieCol.updateOne(
      { userId: new ObjectId(userId), movieName: movieName, year: year },
      { $set: { reviewDescription: reviewDescription } }
    );
  }

  return "Import finished";
};

export const getAllAccounts = async () => {
  const accountCollection = await accounts();
  let accountList = await accountCollection.find({}).toArray();
  if (!accountList) throw "Could not get all accounts";
  accountList = accountList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return accountList;
};

export const getAccountById = async (id) => {
  checkValidId(id, "id");
  const accountCollection = await accounts();
  const the_account = await accountCollection.findOne({
    _id: new ObjectId(id),
  });
  if (the_account === null) throw "No account with that id";
  the_account._id = the_account._id.toString();
  return the_account;
};

export const getAccountByUsername = async (username) => {
  checkValidString(username, "username");
  const accountCollection = await accounts();
  const account_results = await accountCollection
    .find({
      username: username,
    })
    .toArray();
  if (!account_results.length) throw "No accounts with that username";
  let account_list = [];

  for (let i = 0; i < account_results.length; i++) {
    let account = account_results[i];
    account_list.push({
      _id: account._id.toString(),
      username: account.username,
      password: account.password,
    });
  }
  return account_list;
};

export const deleteAccount = async (id) => {
  checkValidId(id, "id");
  let accountCollection = await accounts();
  let findAccount = await accountCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!findAccount) {
    throw "account with that id could not be found";
  }

  const deletionInfo = await accountCollection.deleteOne({
    _id: new ObjectId(id),
  });

  if (deletionInfo.deletedCount == 0) {
    throw "Error in deleting account";
  }
  return { username: findAccount.username, deleted: true };
};

export const addFollower = async (userId, followerId) => {
  checkValidId(userId);
  checkValidId(followerId);

  let accountCollection = await accounts();
  //Source: https://www.geeksforgeeks.org/mongodb/mongodb-addtoset-operator/
  const updateUser = await accountCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { followers: followerId } }
  );

  const updateFollower = await accountCollection.updateOne(
    { _id: new ObjectId(followerId) },
    { $addToSet: { following: userId } }
  );

  if (updateUser.matchedCount == 0) {
    throw "Error in updating followers list";
  }

  if (updateFollower.matchedCount == 0) {
    throw "Error in updating following list";
  }

  return getAccountById(userId);
};

export const unfollow = async (userId, followerId) => {
  checkValidId(userId);
  checkValidId(followerId);

  let accountCollection = await accounts();
  const updateUser = await accountCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { following: followerId } }
  );

  const updateFollower = await accountCollection.updateOne(
    { _id: new ObjectId(followerId) },
    { $pull: { followers: userId } }
  );

  if (updateUser.matchedCount == 0) {
    throw "Error in removing follower";
  }

  if (updateFollower.matchedCount == 0) {
    throw "Error in removing from following";
  }

  return getAccountById(userId);
};

export const updateAge = async (userId, age) => {
  checkValidId(userId);
  checkValidAge(age);

  let accountCollection = await accounts();
  //Source: https://www.geeksforgeeks.org/mongodb/mongodb-addtoset-operator/
  const updateUser = await accountCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { age: age } }
  );

  if (updateUser.matchedCount == 0) {
    throw "Error in updating age";
  }

  return getAccountById(userId);
};

export const updateIsPrivate = async (userId, status) => {
  checkValidId(userId);
  if (typeof status != "boolean") {
    throw "status must be a boolean";
  }

  let accountCollection = await accounts();
  //Source: https://www.geeksforgeeks.org/mongodb/mongodb-addtoset-operator/
  const updateUser = await accountCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { isPrivate: status } }
  );

  if (updateUser.matchedCount == 0) {
    throw "Error in updating privacy setting";
  }

  return getAccountById(userId);
};

export const updateProfileDescription = async (userId, description) => {
  checkValidId(userId);
  if (description != "" && typeof description == "string") {
    checkValidString(description);
  }
  let accountCollection = await accounts();
  //Source: https://www.geeksforgeeks.org/mongodb/mongodb-addtoset-operator/
  const updateUser = await accountCollection.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { profile_description: description } }
  );

  if (updateUser.matchedCount == 0) {
    throw "Error in updating profile description";
  }

  return getAccountById(userId);
};
