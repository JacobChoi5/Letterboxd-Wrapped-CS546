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
    //createStatsObject(id)
    let account = {}
    let data = {}
    try {
        helpers.checkValidId(id)
        id = id.trim()
        helpers.checkValidId(id)
        account = accountData.getAccountById(id)
        data = accountData.calculateStatistics(id, "alltime")
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

router.route('follow').post(async (req, res) => {
    //TODO
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

router.route('/login').get(async (req, res) => {
    require('bcrypt')
    //add logic for getting username and password
    try {
        account = accountData.getAccountByUsername(username)
        if (await bcrypt.compare(password, account.password)) {
            //my account is account
        } else {
            throw "invalid credentials"
        }
    } catch (e) {
        return res.status(401).render('error', {
            errorMessage: 'Username or password does not match: ' + e,
            class: 'login-fail'
        })
    }
})

router.route('/signupconfirm').get(async (req, res) => {
    const accountsignupdata = req.body
    const bcrypt = require('bcryptjs');
    let account = {}
    try {
        helpers.checkValidString(accountsignupdata.username)
        accountsignupdata.username = accountsignupdata.username.trim()
        helpers.checkValidString(accountsignupdata.username)

        helpers.checkValidString(accountsignupdata.password)
        accountsignupdata.password = accountsignupdata.password.trim()
        helpers.checkValidString(accountsignupdata.password)

        helpers.checkValidNumber(accountsignupdata.age)

        let description = ""

        if (accountsignupdata.description) {
            helpers.checkValidString(accountsignupdata.description)
            description = accountsignupdata.description.trim()
            helpers.checkValidString(description)
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        account = await createAccount(accountsignupdata.username, hashedPassword, accountsignupdata.age, false, description, [], [], [], [], [], {})
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Invalid input data',
            class: 'error'
        });
    }
    try {
        res.render('success', { Title: "Signup Confirmation", successMessage: `${account.username} has been successfully created!` })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render signupconfirm page: ' + e,
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

router.route('/uploaddata').get(async (req, res) => {
    try {
        res.render('uploaddata', { Title: "My Data" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render data page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/uploaddata').post(async (req, res) => {
    try {

    } catch (e) {

    }
    try {
        res.render('success', { Title: "Data Upload", successMessage: `Data has been successfully uploaded!` })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render Data Upload Success page: ' + e,
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

router.route('/accountlookupresults').post(async (req, res) => {
    const accountlookupdata = req.body
    try {
        helpers.checkValidString(accountlookupdata.accountName)
        accountlookupdata.accountName = accountlookupdata.accountName.trim()
        helpers.checkValidString(accountlookupdata.accountName)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'You must enter a search term!',
            class: 'error'
        });
    }
    try {
        let accounts = accountData.searchAccountsByUsername(accountlookupdata.accountName)
        res.render('accountlookupresults', { accounts: accounts, Title: accountlookupdata.accountName + " Results" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: `We're sorry, but no results were found for ${accountlookupdata.accountName}`,
            class: 'account-not-found'
        })
    }
})

export default router