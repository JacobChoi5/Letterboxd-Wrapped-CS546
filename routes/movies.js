import { Router } from 'express'
const router = Router()
import * as helpers from "../helpers.js"
import * as movieData from '../data/movies.js'
import * as accountData from '../data/accounts.js'

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

router.route('/lookupresults').get(async (req, res) => {
    try {
        res.render('lookup', { Title: "Lookup" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie lookup page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/:id').get(async (req, res) => {
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
        let movie = await movieData.getMovieById(req.params.id)
        res.render('movie', {
            movie: movie
        })
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Movie Not Found: ' + e,
            class: 'movie-not-found'
        });
    }
})

router.route('/newmovie').get(async (req, res) => {
    //creates new movie. will call createMovie()
})

export default router