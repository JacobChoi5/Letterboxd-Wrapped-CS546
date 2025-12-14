import { Router } from 'express'
const router = Router()
import * as helpers from "../helpers.js"
import * as movieData from '../data/movies.js'
import { requireLogin } from "../middleware.js"
import * as accountData from '../data/accounts.js'
import * as userMovieData from '../data/usersMovieData.js'
import xss from 'xss'

router.route('/lookup').get(async (req, res) => {
    try {
        res.render('lookup', { Title: "Lookup" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie lookup page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/lookupresults').post(async (req, res) => {
    let name = req.body.name
    let movies = []
    let cleanMovies = []
    //results of movielookup
    console.log(req.body.name)
    try {
        helpers.checkValidString(name)
        name = xss(name.trim())
        helpers.checkValidString(name)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'You must enter a search term!',
            class: 'error'
        });
    }
    try {
        movies = await movieData.getMoviesByName(name)
        console.log(movies)
        for (let i in movies) {
            cleanMovies.push(
                {
                    _id: movies[i]._id.toString(),
                    name: movies[i].name,
                    date: movies[i].date,
                    directors: movies[i].directors || ["N/A"]
                }
            )
        }
        console.log(cleanMovies)
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Movie Not Found: ' + e,
            class: 'movie-not-found'
        });
    }
    try {
        res.render('lookupresults', { movies: cleanMovies, Title: name + " Results" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: `We're sorry, but no results were found for ${name}`,
            class: 'account-not-found'
        })
    }


})

router.route('/newmovie').get(async (req, res) => {
    try {
        res.render('newmovie', { Title: "Create New Movie" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie creation page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/moviecreated').post(async (req, res) => {
    let data = req.body

    let name = ""
    let date = NaN
    let tagline = "N/A"
    let description = "N/A"
    let posterurl = "public/assets/no_image-1.jpeg"
    let directors = ["N/A"]
    let genres = ["N/A"]
    let themes = ["N/A"]
    let studios = ["N/A"]
    let actors = ["N/A"]

    try {
        helpers.checkValidString(data.name)
        name = xss(data.name.trim())
        helpers.checkValidString(name)

        helpers.checkValidNumber(data.date)
        date = data.date

        if (data.tagline) {
            helpers.checkValidString(data.tagline)
            tagline = xss(data.tagline.trim())
            helpers.checkValidString(tagline)
        }

        if (data.description) {
            helpers.checkValidString(data.description)
            description = xss(data.description.trim())
            helpers.checkValidString(description)
        }

        helpers.checkValidNumber(data.minute)
        minute = data.minute

        helpers.checkValidNumber(data.rating)
        rating = data.rating

        if (data.posterurl) {
            helpers.checkValidString(data.posterurl)
            posterurl = xss(data.posterurl.trim())
            helpers.checkValidString(posterurl)
        }

        if (data.directors) {
            helpers.checkValidString(data.directors)
            directors = data.directors.split(",").map(x => {
                helpers.checkValidString(x)
                x = xss(x.trim())
                helpers.checkValidString(x)
                return x
            })
        }

        if (data.genres) {
            helpers.checkValidString(data.genres)
            genres = data.genres.split(",").map(x => {
                helpers.checkValidString(x)
                x = xss(x.trim())
                helpers.checkValidString(x)
                return x
            })
        }

        if (data.themes) {
            helpers.checkValidString(data.themes)
            themes = data.themes.split(",").map(x => {
                helpers.checkValidString(x)
                x = xss(x.trim())
                helpers.checkValidString(x)
                return x
            })
        }

        if (data.studios) {
            helpers.checkValidString(data.studios)
            studios = data.studios.split(",").map(x => {
                helpers.checkValidString(x)
                x = xss(x.trim())
                helpers.checkValidString(x)
                return x
            })
        }

        if (data.actors) {
            helpers.checkValidString(data.actors)
            actors = data.actors.split(",").map(x => {
                helpers.checkValidString(x)
                x = xss(x.trim())
                helpers.checkValidString(x)
                return x
            })
        }

        await movieData.createNewMovie(
            name, date, tagline, description, minute, rating, directors, actors, genres, posterurl, themes, studios
        )

    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Invalid input data',
            class: 'error'
        });
    }


    try {
        res.render('success', { Title: "Movie Created", successMessage: `${name} Created Successfully` })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie created page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/:id').get(async (req, res) => {
    try {
        helpers.checkValidString(req.params.id)
        req.params.id = xss(req.params.id.trim())
        helpers.checkValidString(req.params.id)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Error in id: ' + e,
            class: 'invalid-id'
        });
    }
    let movie = {}
    try {
        movie = await movieData.getMovieById(req.params.id)
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Movie Not Found: ' + e,
            class: 'movie-not-found'
        });
    }
    movie.actors = movie.actors.slice(0, 5)
    try {
        res.render('moviebyid', {
            movie: movie,
            Title: movie.name
        })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/:id/actors').get(async (req, res) => {
    try {
        helpers.checkValidString(req.params.id)
        req.params.id = xss(req.params.id.trim())
        helpers.checkValidString(req.params.id)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Error in id: ' + e,
            class: 'invalid-id'
        });
    }
    let movie = {}
    try {
        movie = await movieData.getMovieById(req.params.id)
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Movie Not Found: ' + e,
            class: 'movie-not-found'
        });
    }
    console.log(movie.actors)
    return res.json(movie.actors)
})

router.route('/:id/comment').post(async (req, res) => {
    try {
        helpers.checkValidString(req.params.id)
        req.params.id = xss(req.params.id.trim())
        helpers.checkValidString(req.params.id)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Error in id: ' + e,
            class: 'invalid-id'
        });
    }
    try {
        helpers.checkValidString(req.body.text)
        req.body.text = xss(req.body.text.trim())
        helpers.checkValidString(req.body.text)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Error in comment text: ' + e,
            class: 'invalid-comment'
        });
    }
    try {
        if (req.body.supercomment) {
            await movieData.createComment(req.params.id,
                req.session.user._id,
                req.session.user.username,
                req.body.text,
                req.body.supercomment)
        }
        else {
            await movieData.createComment(req.params.id,
                req.session.user._id,
                req.session.user.username,
                req.body.text)
        }
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Unable To Create Comment: ' + e,
            class: 'comment-error'
        });
    }
    try {
        let movie = await movieData.getMovieById(req.params.id)
        res.json(movie.comments)
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/:id/likecomment').post(async (req, res) => {
    try {
        helpers.checkValidString(req.params.id)
        req.params.id = req.params.id.trim()
        helpers.checkValidString(req.params.id)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Error in id: ' + e,
            class: 'invalid-id'
        });
    }
    try {
        helpers.checkValidString(req.body.commentId)
        req.body.commentId = req.body.commentId.trim()
        helpers.checkValidString(req.body.commentId)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Error in comment id: ' + e,
            class: 'invalid-commentId'
        });
    }

    try {
        await movieData.toggleLike(req.params.id, req.body.commentId, req.session.user._id)
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Unable To Like Comment: ' + e,
            class: 'comment-error'
        });
    }

    try {
        let movie = await movieData.getMovieById(req.params.id)
        res.json(movie.comments)
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/:id/add').post(requireLogin, async (req, res) => {
    let movieId;
    let userId;

    // validate movie id
    try {
        helpers.checkValidString(req.params.id);
        movieId = xss(req.params.id.trim());
        helpers.checkValidString(movieId);
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Invalid movie id: ' + e,
            class: 'invalid-id'
        });
    }

    // validate user id from session
    try {
        userId = req.session.user._id;
        helpers.checkValidId(userId);
        userId = userId.trim();
        helpers.checkValidId(userId);
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Invalid user session: ' + e,
            class: 'invalid-user'
        });
    }

    // fetch movie
    let movie;
    try {
        movie = await movieData.getMovieById(movieId);
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Movie not found: ' + e,
            class: 'movie-not-found'
        });
    }

    // add movie to userMovieData collection
    try {
        await userMovieData.addMovieForUser(
            movieId,
            userId,
            movie.name
        );
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Could not add movie to account: ' + e,
            class: 'add-error'
        });
    }

    // success
    try {
        return res.render('success', {
            Title: movie.name,
            successMessage: `${movie.name} successfully added to your account!`
        });
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render success page',
            class: 'page-fail'
        });
    }
});

// router.route('/:id/add').post(async (req, res) => {
//     try {
//         helpers.checkValidString(req.params.id)
//         req.params.id = xss(req.params.id.trim())
//         helpers.checkValidString(req.params.id)
//     } catch (e) {
//         return res.status(400).render('error', {
//             errorMessage: 'Error in id: ' + e,
//             class: 'invalid-id'
//         });
//     }
//     let movie = {}
//     try {
//         movie = await movieData.getMovieById(req.params.id)
//     } catch (e) {
//         return res.status(404).render('error', {
//             errorMessage: 'Movie Not Found: ' + e,
//             class: 'movie-not-found'
//         });
//     }
//     try {
//         accountData.addMovieById(req.params.id)
//     } catch (e) {
//         return res.status(500).render('error', {
//             errorMessage: 'Could not add movie to account: ' + e,
//             class: 'add-error'
//         })
//     }
//     try {
//         res.render('success', { Title: movie.name, successMessage: `${movie.name} successfully added to account!` })
//     } catch (e) {
//         return res.status(500).render('error', {
//             errorMessage: 'Failed to render movie creation page: ' + e,
//             class: 'page-fail'
//         })
//     }
// })

router.route('/:id/admin').get(requireLogin, async (req, res) => {
    try {
        let currentUserId = req.session.user._id
        helpers.checkValidId(currentUserId)
        currentUserId = currentUserId.trim()
        helpers.checkValidId(currentUserId)
        curuser = await accountData.getAccountById(currentUserId)
        if (!curuser.isAdmin) throw "not authorized"
    } catch (e) {
        return res.status(403).render('error', {
            errorMessage: 'Not Admin! ' + e,
            class: 'not-authorized'
        });
    }
    let movie = {}
    try {
        movie = await movieData.getMovieById(req.params.id)
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Movie Not Found: ' + e,
            class: 'movie-not-found'
        });
    }
    movie.actors = movie.actors.slice(0, 5)
    try {
        res.render('moviebyidadmin', {
            movie: movie,
            Title: movie.name
        })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie page: ' + e,
            class: 'page-fail'
        })
    }
})

export default router