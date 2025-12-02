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
    try {
        helpers.checkValidId(id)
        id = id.trim()
        helpers.checkValidId(id)
        account = accountData.getAccountById(id)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Invalid account id: ' + e,
            class: 'invalid-id'
        })
    }
    try {
        res.render('accountbyid', { Title: account.username })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render account by id page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/createaccount').get(async (req, res) => {
    try {
        res.render('signup', { Title: "Signup" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render signup page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/myaccount').get(async (req, res) => {
    try {
        res.render('myaccount', { Title: "My Account" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render account page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/mydata').get(async (req, res) => {
    try {
        res.render('mydata', { Title: "My Data" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render data page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/addmovie').get(async (req, res) => {
    try {
        res.render('addmovie', { Title: "Add Movie" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render movie adding page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/accountlookup').get(async (req, res) => {
    try {
        res.render('accountlookup', { Title: "Account Lookup" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render account lookup page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/accountlookupresults').get(async (req, res) => {
    try {
        res.render('accountlookupresults', { Title: res.params.query })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render account lookup results page: ' + e,
            class: 'page-fail'
        })
    }
})

export default router