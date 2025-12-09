import * as moviesData from "./data/movies.js"
import {dbConnection, closeConnection} from './config/mongoConnection.js';
import {movies} from './config/mongoCollections.js'
import express from 'express';
const app = express();
import session from 'express-session';
import configRoutes from './routes/index.js';
import multer from 'multer';
const upload = multer(); 

app.use(express.json());

app.use(
  session({
    name: 'Letterboxd_Session',
    secret: "Cool Site",
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 600000 }
  })
);

app.use('/secureRoute', (req, res, next) => {
    if(!req.session.user) 
      {
      return res.redirect("/");
      } 
      else
      {
        next();
      }
});

app.use('/login', (req, res, next) => {
  if(req.session.user)
  {
    res.redirect("/");
  }
  else
  {
  next();
  }
});

app.use('/upload', upload.single('zipfile'), (req, res, next) => {
  next();
});

configRoutes(app);

app.listen(3000, () => {
  console.log("We've now got a server!");
});

//ignore eveything below


//connect to database
const db = await dbConnection()
//deletes previous data from database

//database tests
// try
// {
//   console.log( await movies.createNewMovie(
//     1000001,
//     "Barbie",
//     2023,
//     "She's everything. He's just Ken.",
//     "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
//     114,
//     3.86,
//     ["Greta Gerwig"],
//     [{name: "Margot Robbie", role: "Barbie"}, {name: "Ryan Gosling", role: "Ken"}],
//     ["Comedy", "Adventure"],
//     "https://a.ltrbxd.com/resized/film-poster/2/7/7/0/6/4/277064-barbie-0-230-0-345-crop.jpg?v=1b83dc7a71",
//     [
//       "Humanity and the world around us",
//       "Crude humor and satire",
//       "Moving relationship stories",
//       "Emotional and captivating fantasy storytelling",
//       "Surreal and thought-provoking visions of life and death",
//       "Quirky and endearing relationships",
//       "Amusing jokes and witty satire",
//       "Laugh-out-loud relationship entanglements"
//     ],
//     ["LuckyChap Entertainment", "Heyday Films", "NB/GG Pictures", "Mattel", "Warner Bros. Pictures"]
//   ))
// }
// catch (e)
// {
//   console.log(e);
// }

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

try {
  console.log(await moviesData.getMovieById(1000001))
} catch (e) {
  console.log(e)
}

try {
  console.log(await moviesData.getMoviesByActor("Margot Robbie"))
} catch (e) {
  console.log(e)
}
//end Database test

console.log("Done");

await closeConnection()

