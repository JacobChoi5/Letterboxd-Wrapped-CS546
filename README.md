# CS546_Letterboxd_Analyzer
## Features
### Core
- Users can upload their .zip file from Letterboxd to load their data
- Users can reupload their .zip file to update their data
- An admin account that allows the admin to add movies to the system, edit existing movies, and delete movies from the system.
- Letterboxd Wrapped would display movie statistics:
- Top genres
- Top directors
- Top actors
- Average movie rating
- Average difference between the user’s rating and global movie averages
- The number of hours spent watching movies
- Can calculate based on all-time data, the past year, or month.
- Recommendation based on top genres, directors, and actors
- Each time a user updates their data, it will save all of the movies watched during that period since the last update. It will serve as a time capsule for that period.
- Users can manually find movies from our database and input/update their rating data
- Commenting on the movie pages to interact with other users
- Integration with movie posters from Letterboxd.
- Allows users to follow other users
- Users have a public profile page where users can compare their statistics with other users (top movies, genres, hours spent watching).
## Usage
### Seeding
`npm run seed` to seed database and admin account
This is the only way to create an admin account, credentials:
Username: admin
Password: admin

### Starting Server
`npm start` to run app.js, will run rest of files

### Example Run
From /createaccount (linked from all pages) sign up as a new account:

Parameters:
Username, Password, Password Confirmation, Age, Description (Optional), Upload Zip (Optional)
All have proper error checking from both client side and server side. Username is checked for uniqueness (case-insensitive). Passwords are checked for equality and then salted, hashed, and stored on server. Age is checked for validity (13-100)

Data flow:
Upload zip file downloaded from letterboxd (Export data from https://letterboxd.com/settings/data/) either while or after creating account and/or manually add movies from search function.

Movie Search:
From /movies/lookup, type in search term and recieve list of all movies with information such as release year and director that match that name with clickable links.
Clicking on /movies/:id for a given movie will link to page for that movie with information on description, tagline, actors, and much more. Movie can be added to account statisitics with the click of a button.

Account lookup:
From /accountlookup Can be used to find other accounts, see their statistics, and follow them

My Account:
Used to see your own statistics or update information such as age or description.
