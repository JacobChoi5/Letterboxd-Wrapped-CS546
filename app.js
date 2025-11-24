import * as movies from "./data/movies.js"
import {dbConnection, closeConnection} from './config/mongoConnection.js';

//connect to database
const db = await dbConnection()
//deletes previous data from database
await db.dropDatabase()

//database tests
try
{
  console.log( await movies.createNewMovie(
    1000001,
    "Barbie",
    2023,
    "She's everything. He's just Ken.",
    "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land. However, when they get a chance to go to the real world, they soon discover the joys and perils of living among humans.",
    114,
    3.86,
    ["Greta Gerwig"],
    [{name: "Margot Robbie", role: "Barbie"}, {name: "Ryan Gosling", role: "Ken"}],
    ["Comedy", "Adventure"],
    "https://a.ltrbxd.com/resized/film-poster/2/7/7/0/6/4/277064-barbie-0-230-0-345-crop.jpg?v=1b83dc7a71",
    [
      "Humanity and the world around us",
      "Crude humor and satire",
      "Moving relationship stories",
      "Emotional and captivating fantasy storytelling",
      "Surreal and thought-provoking visions of life and death",
      "Quirky and endearing relationships",
      "Amusing jokes and witty satire",
      "Laugh-out-loud relationship entanglements"
    ],
    ["LuckyChap Entertainment", "Heyday Films", "NB/GG Pictures", "Mattel", "Warner Bros. Pictures"]
  ))
}
catch (e)
{
  console.log(e);
}
//end Database test

console.log("Done");

await closeConnection()
