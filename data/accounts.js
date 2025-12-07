import { checkValidString, checkValidAge, checkValidId } from "../helpers.js";
import * as userMovieData from "usersMovieData.js";
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
  following,
  statistics
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
    //ratingId: ratingId,
    followers: [],
    following: [],
    statistics: {},
  };

  const accountCollection = await accounts();
  const insertInfo = await accountCollection.insertOne(newAccount);
  if (!insertInfo.acknowledged || !insertInfo.insertedId)
    throw "Could not create account. Try again later.";

  const newId = insertInfo.insertedId.toString();

  const account = await getAccountById(newId);
  return account;
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
