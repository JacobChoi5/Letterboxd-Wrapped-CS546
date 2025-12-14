//seed movie data (this will take a while)
import * as moviesData from "./data/movies.js"
import {dbConnection, closeConnection} from './config/mongoConnection.js';
import {movies} from './config/mongoCollections.js'
import bcrypt from 'bcrypt';
import * as accountData from './data/accounts.js';

await dbConnection();

try {
  const movieCollection = await movies()
  const count = await movieCollection.countDocuments()

  if (count > 0) {
    console.log("Database already seeded - skipping seeding.")
  } else {
    await moviesData.seedDatabase()
    console.log("Success!")
  }
} catch (e) {
  console.log(e)
}

//create admin account
try {
  let admin
  try{
    admin = await accountData.getAccountByUsername("admin");
    console.log("Admin already exists")
  } catch {
    admin = null;
  }

  if(!admin)
  {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin", salt);
    await accountData.createAccount("admin", hashedPassword, 30, true, false, "N/A", [], [], [])
    console.log("Admin account created!")
  }
} catch (e) {
  console.log(e)
}

await closeConnection();
console.log('Done!');