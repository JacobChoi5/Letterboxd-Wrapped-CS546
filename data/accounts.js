import { checkValidString, checkValidAge, checkValidId } from "../helpers.js";
import * as csvData from "../data/usersMovieData.js";
import * as movieData from "../data/movies.js";
import { accounts, userMovieData } from "../config/mongoCollections.js";
/*
Current Issues:
- Does not store ratingID (do not know what the userMovieData collection looks like yet)
- Does not update based on LetterBoxed Data
    - Whenever a user updated their Letterboxd zip files, their statistics should change.
      But we do no know what the structure of the data we will retieve from the zip files
      looks like yet. So, i cannot update the data.
*/
export const createAccount = async (
  username,
  password,
  age,
  isAdmin,
  profile_description,
  all_movies,
  recently_watched,
  zip_files,
  //rating_id,
  followers,
  following
) => {
  //validate string parameters
  checkValidString(username, "username");
  checkValidString(password, "password");

  //valide age
  checkValidAge(age);

  let newAccount = {
    username: username,
    password: password,
    age: age,
    isAdmin: false,
    profile_description: "",
    all_movies: [],
    recently_watched: [],
    zip_files: [],
    followers: [],
    following: [],
  };

  const accountCollection = await accounts();
  const insertInfo = await accountCollection.insertOne(newAccount);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not create account. Try again later.";

  const newId = insertInfo.insertedId.toString();

  const account = await getAccountById(newId);
  return account;
};

export const calculateStatistics = async (id, period) => {
  // all, year, month
  let account = getAccountById(id);
  importAllUserData(id, account["zip_files"]);

  let movies_watched = csvData.getAllMoviesWatched(id);
  if (!movies_watched) throw "Could not get all movies";

  let currentDate = new Date();
  let currentDateString = currentDate.toISOString().slice(0, 10);
  
  // if (period == "year") {
  // } else if (period == "month") {
  // }

  let genre_list = [];
  let director_list = [];
  let actor_list = [];
  let global_rating_list = [];
  let duration_list = [];

  for (let movie of movies_watched) {
    let the_movie = movieData.getMovieById(movie[movieId]);
    genre_list.push(the_movie[genres]);
    director_list.push(the_movie[directors]);
    actor_list.push(the_movie[actors]);
    global_rating_list.push(the_movie[rating]);
    duration_list.push(the_movie[minute]);
  }
  genre_list.flat();
  director_list.flat();
  actor_list.flat();

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
    rating_list.push(csvData.getRating(movie[movieId], id));
  }

  let rating_count = 0;
  let total = 0;
  for (let moving_rating of rating_list) {
    total += moving_rating;
    rating_count++;
  }

  let average_movie_rating = total / rating_count;

  //Average Different between user's rating and global movie averages: rating_difference
  let global_rating_count = 0;
  let global_total = 0;
  for (let global_movie_rating of global_rating_list) {
    global_total += global_movie_rating;
    global_rating_count++;
  }
  let global_average_movie_rating = gloval_total / global_rating_count;

  let rating_difference = average_movie_rating - global_average_movie_rating;

  //Hours spent watching movies: hours_watching_movies
  let duration_count = 0;
  for (let duration of duration_list) {
    duration_count += duration;
  }

  let hours_watching_movies = duration_count / 60;

  //Recomendations

  //Recommendations based on genres
  let popularity_number = 1000000;
  let movie_genre_recommendation_list = [];

  while (true) {
    let popular_movie = getMovieByPopularity(popularity_number);

    if (!popular_movie) break;

    if (
      popular_movie.genres.includes(genre1) ||
      popular_movie.genres.includes(genre2) ||
      popular_movie.genres.includes(genre3)
    ) {
      let alreadyWatched = movies_watched.some(
        (movie) => movie["name"] === popular_movie["name"]
      );

      if (!alreadyWatched) {
        movie_genre_recommendation_list.push(popular_movie);
      }

      if (movie_genre_recommendation_list.length === 3) break;
    }

    popularity_number++;
  }

  //Recommendations based off actor
  popularity_number = 1000000;
  movie_actor_recommendation_list = [];
  while (true) {
    let popular_movie = getMovieByPopularity(popularity_number);

    if (!popular_movie) break;

    if (
      popular_movie.actors.name.includes(actor1) ||
      popular_movie.actors.name.includes(actor2) ||
      popular_movie.actors.name.includes(actor3)
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
  popularity_number = 1000000;
  movie_director_recommendation_list = [];
  while (true) {
    let popular_movie = getMovieByPopularity(popularity_number);

    if (!popular_movie) break;

    if (
      popular_movie.director.includes(director1) ||
      popular_movie.director.includes(director2) ||
      popular_movie.director.includes(director3)
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

  let movie_recommendations = {
    genre_based: movie_genre_recommendation_list,
    actor_based: movie_actor_recommendation_list,
    director_based: movie_director_recommendation_list,
  };

  let statistics = {
    genres: top_3_genres,
    directors: top_3_director,
    actors: top_3_actors,
    rating: average_movie_rating,
    global_difference: average_distance_from_global,
    hours_watched: hours_watching_movies,
    recommendations: movie_recommendations,
  };
  return statistics;
};

// This basically imports the user’s Letterboxd ZIP, and merges it into their movie data in MongoDB or adds it for the first time,
// and makes all profile  or refreshes it. This is what creates the data that our
// getters/setters later read and update within calculateStatistics().
export const importAllUserData = async (userId, zipBuffer) => {
  checkValidId(userId);
  const accountCol = await accounts();
  const movieCol = await userMovieData();
  const user = await accountCol.findOne({ _id: new ObjectId(userId) });
  if (!user) {
    throw new Error("User not found.");
  }
  // Extract and parse CSV files
  const extracted = await unZip(zipBuffer);
  const diaryCSV = extracted.diaryCSV;
  const ratingsCSV = extracted.ratingsCSV;
  const reviewsCSV = extracted.reviewsCSV;
  if (!diaryCSV) {
    throw new Error("ZIP file did not contain diary.csv.");
  }
  if (!ratingsCSV && !reviewsCSV) {
    throw new Error("ZIP file did not contain, ratings.csv.");
  }
  if (!reviewsCSV) {
    throw new Error("ZIP file did not contain reviews.csv.");
  }
  let diaryRows = [];
  let ratingRows = [];
  const reviewRows = [];
  if (diaryCSV) {
    diaryRows = parse(diaryCSV);
  }
  if (ratingsCSV) {
    ratingRows = parse(ratingsCSV);
  }
  if (reviewsCSV) {
    reviewRows = parse(reviewsCSV);
  }
  // Process diary file the  watch dates
  for (let i = 0; i < diaryRows.length; i++) {
    const row = diaryRows[i];
    const movieId = row["Letterboxd URI"];
    let movieName = "";
    if (row["Name"]) {
      movieName = row["Name"];
    }
    let dateWatched = "";
    if (row["Date"]) {
      dateWatched = row["Date"];
    }
    const existing = await movieCol.findOne({
      userId: userId,
      movieId: movieId,
    });
    if (existing) {
      await movieCol.updateOne(
        { userId: userId, movieId: movieId },
        { $set: { movieName, dateWatched } }
      );
    } else {
      await movieCol.insertOne({
        userId: userId,
        movieId: movieId,
        movieName: movieName,
        dateWatched: dateWatched,
        rating: null,
        rewatchCount: 0,
        reviewDescription: "",
      });
    }
  }
  // ratings file import
  for (let i = 0; i < ratingRows.length; i++) {
    const row = ratingRows[i];
    const movieId = row["Letterboxd URI"];
    let rating = null;
    if (row["Rating"]) {
      rating = Number(row["Rating"]);
    }
    let name = "";
    if (row["Name"]) {
      name = row["Name"];
    }
    let found = await movieCol.findOne({ userId: userId, movieId: movieId });
    if (found) {
      await movieCol.updateOne(
        { userId: userId, movieId: movieId },
        { $set: { rating: rating } }
      );
    } else {
      await movieCol.insertOne({
        userId,
        movieId,
        movieName: name,
        dateWatched: "",
        rating,
        rewatchCount: 0,
        reviewDescription: "",
      });
    }
  } // Process the  reviews
  for (let i = 0; i < reviewRows.length; i++) {
    const row = reviewRows[i];
    const movieId = row["Letterboxd URI"];
    let reviewDescription = "";
    if (row["Review"]) {
      reviewDescription = row["Review"];
    }
    let movieName = "";
    if (row["Name"]) {
      movieName = row["Name"];
    }
    const existingDoc = await movieCol.findOne({
      userId: userId,
      movieId: movieId,
    });
    if (existingDoc) {
      await movieCol.updateOne(
        { userId, movieId },
        { $set: { reviewDescription: reviewDescription } }
      );
    } else {
      await movieCol.insertOne({
        userId: userId,
        movieId,
        movieName: movieName,
        dateWatched: "",
        rating: null,
        rewatchCount: 0,
        reviewDescription: reviewDescription,
      });
    }
  }
  //#to do change later
  return "Import finished";
};



export const getAllAccounts = async () => {
  const accountCollection = await accounts();
  let accountList = await accountCollection.find({}).toArray();
  if (!acccountList) throw "Could not get all accounts";
  accountList = accountList.map((element) => {
    element._id = element._id.toString();
    return element;
  });
  return accountList;
};

export const getAccountById = async (id) => {
  let x = new ObjectId();
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
    let account = results[i];
    account_list.push({
      _id: account._id.toString(),
      username: account.username,
    });
  }
  return account;
};

export const deleteAccount = async (id) => {
  checkValidId(id, "id");
  let accountCollection = await accounts();
  let findAccount = await accountCollection.findOne({
    _id: new ObjectId(id),
  });

  if (!findAcccount) {
    throw "account with that id could not be found";
  }

  const deletionInfo = await accountCollection.deleteOne({
    _id: new ObjectId(id),
  });
  //check to make sure autoformattor isn't fucking this up.
  return { username: findAccount.username, deleted: true };
};

export const updateAccountInformation = async (
  id,
  username, //need to check that it meats criteria
  password,
  age,
  isAdmin, //figure this out
  profile_description,
  all_movies,
  recently_watched,
  zip_files,
  //rating_id,
  followers,
  following,
  statistics
) => {
  //Validation with helpers
  checkValidID(id, "id");
  checkValidString(username, "username");
  checkValidString(password, "password");
  checkValidAge(age);
  checkValidString(profile_description, "profile description");
  for (let movie in all_movies) {
    checkValidString(movie, "all movies");
  }
  for (let movie in recently_watched) {
    checkValidString(movie, "recently watched movie");
  }
  for (let follower in followers) {
    checkValidObject(follower, "follower id");
  }
  for (let follow in following) {
    checkValidObject(follow, "following id");
  }

  if (typeof statistics != "object") {
    throw "statistics must be an object";
  }

  //check for null an array
  if (statistics == null || Array.isArray(statistics)) {
    throw "statistics cannot be null or an array";
  }

  //check that parameters exist
  if (
    !("average_distance_from_global" in logistics) ||
    !("top_genre" in logistics) ||
    !("top_directors" in logistics) ||
    !("top_actors" in logistics) ||
    !("top_studio" in logistics) ||
    !("most_watched_time_period" in logistics) ||
    !("most_watched_movie" in logistics) ||
    !("movie_recommendations" in logistics) ||
    !("last_time_updated" in logistics)
  ) {
    throw "one of the required keys/properties in statistics was not provided";
  }

  let validStatisticKeys = [
    "average_distance_from_global",
    "top_genre",
    "top_directors",
    "top_actors",
    "top_studio",
    "most_watched_time_period",
    "most_watched_movie",
    "movie_recommendations",
    "last_time_updated",
  ];

  for (let key in validStatisticKeys) {
    checkValidObject(key);
    if (!validKeys.includes(key)) {
      throw "statisitcs is missing a critical key.";
    }
  }

  let newStatistics = {
    average_distance_from_global: average_distance_from_global,
    top_genre: top_genre,
    top_directors: top_directors,
    top_actors: top_actors,
    top_studio: top_studio,
    most_watched_time_period: most_watched_movie,
    most_watched_movie: most_watched_movie,
    movie_recommendations: movie_recommendations,
    last_time_updated: last_time_updated,
  };

  let userUpdateInfo = {
    id: id,
    username: username,
    password: password,
    age: age,
    isAdmin: isAdmin,
    profile_description: profile_description,
    recently_watched: recently_watched,
    zip_files: zip_files,
    //ratingId: ratingId,
    followers: followers,
    following: following,
    statistics: newStatistics,
  };

  //Addding the account to the DB and returning the account
  const accountCollection = await accounts();

  const updateInfo = await accountCollection.findOneAndReplace(
    { _id: new ObjectId(id) },
    userUpdateInfo,
    { returnDocument: "after" }
  );
  if (!updateInfo)
    throw `Error: Update failed, could not find a account with id of ${id}`;

  return updateInfo;
};
