import * as moviesData from "./data/movies.js"
import {dbConnection, closeConnection} from './config/mongoConnection.js';
import {movies} from './config/mongoCollections.js'
import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import multer from 'multer';
import exphbs from 'express-handlebars';
const upload = multer(); 
import cookieParser from 'cookie-parser';
import { requireLogin } from './middleware.js';

//found multer on npm website when I searched up upload stuff middleware https://www.npmjs.com/package/multer 
app.use(express.urlencoded({ extended: true })); 

app.use(cookieParser());

//this is for the partials to allow for the nested comment logic
const handlebarsInstance = exphbs.create({
  partialsDir: ['views/partials/']
});

app.engine('handlebars', handlebarsInstance.engine);
app.set('view engine', 'handlebars');

app.use(express.json());
// What i need to do 
// middleware cookie handling for checking is users logged in and hwat tjeir user name and id is  and 
// d file uploads plus extra. how to see which account is signied in.

app.use(
  session({
    name: 'Letterboxd_Session',
    secret: "Cool Site",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 600000 }
  })
);

app.use((req,res,next) => {
  if(req.session.user)
{
   req.user = req.session.user;
    req.userId = req.session.user._id;
    req.username = req.session.user.username;
}
console.log("user logged in currently is " + req.user);

next();
});


configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
});

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

console.log("Done");

console.log("Your routes will be running on http://localhost:3000")

