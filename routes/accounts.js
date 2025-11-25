import { Router } from 'express'
const router = Router()
import * as helpers from "../helpers.js"
import * as movieData from '../data/movies.js'
import * as accountData from '../data/accounts.js'

router.route('/').get(async (req, res) => {
    try {
        res.render('home', { Title: "Home" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render home page: ' + e,
            class: 'page-fail'
        })
    }
});

router.route('/:id').get(async (req, res) => {
    
})

router.route('/createaccount').get(async (req, res) => {
    
})

router.route('/myaccount').get(async (req, res) => {
    
})

router.route('/mydata').get(async (req, res) => {
    
})

router.route('/addmovie').get(async (req, res) => {
    
})

router.route('/accountlookup').get(async (req, res) => {
    
})

router.route('/accountlookupresults').get(async (req, res) => {
    
})

export default router