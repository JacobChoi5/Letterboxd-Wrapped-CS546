import { Router } from 'express'
const router = Router()
import * as helpers from "../helpers.js"
import * as movieData from '../data/movies.js'
import * as usersMovieData from '../data/usersMovieData.js'
import { requireLogin } from "../middleware.js"
import * as accountData from '../data/accounts.js'
import bcrypt from 'bcrypt'
import multer from 'multer';
const upload = multer(); 

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



router.route('/follow').post(async (req, res) => {
    //TODO
    let id = req.body.id
    let currentUserId = ""
    try {
        helpers.checkValidId(id)
        id = id.trim()
        helpers.checkValidId(id)
        account = accountData.getAccountById(id)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Invalid input: ' + e,
            class: 'invalid-input'
        })
    }
    try {
        currentUserId = helpers.checkValidId(req.session.user._id)
        helpers.checkValidId(currentUserId)
        currentUserId = currentUserId.trim()
        helpers.checkValidId(currentUserId)
    } catch (e) {
        return res.status(401).render('error', {
            errorMessage: 'Account not logged in: ' + e,
            class: 'no-login'
        })
    }
    try {
        await accountData.addFollower(id, currentUserId)
        res.render('success', { Title: "Follow Confirmed", successMessage: `${account.username} followed!` })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to follow account: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/createaccount').get(async (req, res) => {
    try {
        console.log("in create account")
        res.render('signup', { Title: "Signup" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render signup page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/login').get(async (req, res) => {
    try {
        res.render('login', { Title: "Login" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render home page: ' + e,
            class: 'page-fail'
        })
    }
});

router.route('/login').post(async (req, res) => {
    //add logic for getting username and password
    let username = ""
    let password = ""
    try {
        username = req.body.username
        password = req.body.password
        account = await accountData.getAccountByUsername(username)
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

router.route('/signupconfirm').post(async (req, res) => {
    const accountsignupdata = req.body
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
        const hashedPassword = await bcrypt.hash(accountsignupdata.password, salt);

        account = await accountData.createAccount(accountsignupdata.username, hashedPassword, accountsignupdata.age, false, description, [], [], [], [], [], {})
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

router.route('/myaccount').get(requireLogin, async (req, res) => {
    let curuser = {}
    try{
        currentUserId = helpers.checkValidId(req.session.user._id)
        helpers.checkValidId(currentUserId)
        currentUserId = currentUserId.trim()
        helpers.checkValidId(currentUserId)
        curuser = await accountData.getAccountById(currentUserId)
    } catch (e) {
        return res.status(401).render('error', {
            errorMessage: 'Invalid credentials: ' + e,
            class: 'login-fail'
        })
    }
    try {
        res.render('myaccount', { Title: "My Account", account: curuser })
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

router.route('/uploaddata').post(requireLogin,
  upload.single('file'),async (req, res) => { // got this line from npm website 
    if (!req.file) 
        {
        return res.status(400).render("error", 
            {
            errorMessage: "No ZIP file uploaded",
            class: "page-fail"
        });
    }
    try 
    {
        await accountData.importAllUserData(req.userId, req.file.buffer);
        return res.render("success", 
            {
            Title: "Data Upload",
            successMessage: "Data has been successfully uploaded!"
            });
    } 
    catch (e) 
    {
        return res.status(500).render("error", 
            {
            errorMessage: "Upload failed: " + e,
            class: "page-fail"
        });
    }
});


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
        let accounts = await accountData.searchAccountsByUsername(accountlookupdata.accountName)
        res.render('accountlookupresults', { accounts: accounts, Title: accountlookupdata.accountName + " Results" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: `We're sorry, but no results were found for ${accountlookupdata.accountName}`,
            class: 'account-not-found'
        })
    }
})


router.route('/:id').get(async (req, res) => {
    //createStatsObject(id)
    let account = {}
    let statistics = {}
    console.log("in :id")
    try {
        helpers.checkValidId(id)
        id = id.trim()
        helpers.checkValidId(id)
        let range = "alltime"
        if (req.query.range) {
            helpers.checkValidString(req.query.range)
            range = req.query.range.trim()
            helpers.checkValidString(range)
        }
        account = await accountData.getAccountById(id)
        statistics = await accountData.calculateStatistics(id, range)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'Invalid input: ' + e,
            class: 'invalid-input'
        })
    }
    try {
        res.render('accountbyid', { Title: account.username, account: account, statistics: statistics })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render account by id page: ' + e,
            class: 'page-fail'
        })
    }
})

export default router