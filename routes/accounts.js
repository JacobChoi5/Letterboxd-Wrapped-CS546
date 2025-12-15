import { Router } from 'express'
const router = Router()
import * as helpers from "../helpers.js"
import * as movieData from '../data/movies.js'
import * as usersMovieData from '../data/usersMovieData.js'
import { requireLogin, requireLogout } from "../middleware.js"
import * as accountData from '../data/accounts.js'
import bcrypt from 'bcrypt'
import multer from 'multer';
import xss from 'xss'
import { userMovieData } from '../config/mongoCollections.js'
const upload = multer();

router.route('/').get(async (req, res) => {
    try {
        res.status(200).render('home', { Title: "Home" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render home page: ' + e,
            class: 'page-fail'
        })
    }
});

router.route('/createaccount').get(requireLogout, async (req, res) => {
    try {
        res.status(200).render('signup', { Title: "Signup" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render signup page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/login').get(requireLogout, async (req, res) => {
    try {
        res.status(200).render('login', { Title: "Login" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render home page: ' + e,
            class: 'page-fail'
        })
    }
});

router.route('/login').post(requireLogout, async (req, res) => {
    try {
        let { username, password } = req.body;
        if (!username || !password) {
            throw "Username and password are required";
        }
        let accounts = await accountData.getAccountByUsername(username);
        let account = accounts[0];
        if (!account || !account.password) {
            throw "Invalid Creditioals"
        }
        if (await bcrypt.compare(password, account.password)) {
            req.session.user = {
                _id: account._id.toString(),
                username: account.username
            }
            return res.status(201).redirect('/myaccount');
        }
        else {
            throw "invalid credentials";
        }

    } catch (e) {
        return res.status(401).render('login',
            {
                Title: "Login",
                error: "Username or password is incorrect"
            });
    }
})

router.route('/logout').post(async (req, res) => {
    req.session.destroy()
    try {
        res.status(200).render('login', { Title: "Login" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render home page: ' + e,
            class: 'page-fail'
        })
    }
});

router.route('/signupconfirm').post(upload.single('file'), async (req, res) => {
    const accountsignupdata = req.body
    let account = {}
    let age = 0
    try {
        helpers.checkValidString(accountsignupdata.username)
        accountsignupdata.username = xss(accountsignupdata.username.trim())
        helpers.checkValidString(accountsignupdata.username)

        helpers.checkValidString(accountsignupdata.password)
        accountsignupdata.password = xss(accountsignupdata.password.trim())
        helpers.checkValidString(accountsignupdata.password)

        let age = Number(accountsignupdata.age)
        helpers.checkValidAge(age)

        let description = ""

        if (accountsignupdata.description) {
            helpers.checkValidString(accountsignupdata.description)
            description = xss(accountsignupdata.description.trim())
            helpers.checkValidString(description)
        } else {
            description = ""
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(accountsignupdata.password, salt);

        account = await accountData.createAccount(accountsignupdata.username, hashedPassword, age, false, false, description, [], [], [])
        if (req.file) {
            await accountData.importAllUserData(
                account._id.toString(),
                req.file.buffer
            );
        }

        req.session.user = {
            _id: account._id.toString(),
            username: account.username
        };

        return res.status(200).json({
            success: true,
            message: "Signup successful! Click My Account."
        });
        // return res.json({success: true, message: "Signup successful!"})
    } catch (e) {
        console.log("error: " + e)
        return res.status(400).json({
            success: false,
            message: 'Invalid input data',
            error: e
        });
    }
})

router.route('/myaccount').get(requireLogin, async (req, res) => {
    let curuser = {}
    try {
        let currentUserId = req.session.user._id
        helpers.checkValidId(currentUserId)
        currentUserId = xss(currentUserId.trim())
        helpers.checkValidId(currentUserId)
        curuser = await accountData.getAccountById(currentUserId)
        let followinglist = []
        let followerlist = []
        for (let id of curuser.following) {
            let account = await accountData.getAccountById(id)
            followinglist.push({
                username: account.username,
                _id: account._id
            })
        }
        for (let id of curuser.followers) {
            let account = await accountData.getAccountById(id)
            followerlist.push({
                username: account.username,
                _id: account._id
            })
        }
        res.status(200).render('myaccount', {
            Title: "My Account",
            username: curuser.username,
            age: curuser.age,
            profile_description: curuser.profile_description,
            followers: followerlist,
            following: followinglist
        })
    } catch (e) {
        return res.status(401).render('error', {
            errorMessage: 'Invalid credentials: ' + e,
            class: 'login-fail'
        })
    }
})

router.route('/mydata').get(requireLogin, async (req, res) => {
    let curuser = {}
    let statistics = {}
    try {
        let currentUserId = req.session.user._id
        helpers.checkValidId(currentUserId)
        currentUserId = xss(currentUserId.trim())
        helpers.checkValidId(currentUserId)
        curuser = await accountData.getAccountById(currentUserId)
    } catch (e) {
        return res.status(401).render('error', {
            errorMessage: 'Invalid credentials: ' + e,
            class: 'login-fail'
        })
    }
    try {
        let range = "all"
        if (req.query) {
            if (req.query.range) {
                helpers.checkValidString(req.query.range)
                range = xss(req.query.range.trim())
                helpers.checkValidString(range)
            }
        }
        statistics = await accountData.calculateStatistics(curuser._id, range)
        return res.status(200).render('mydata', {
            Title: "My Account",
            username: curuser.username,
            statistics: statistics,
            range: range
        })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Try uploading some more data first!',
            class: 'statistics-fail'
        })
    }
})


router.route('/updatemyccount').post(requireLogin, async (req, res) => {
    let curuser = {}
    let age = NaN
    let description = ""
    try {
        let currentUserId = req.session.user._id
        helpers.checkValidId(currentUserId)
        currentUserId = xss(currentUserId.trim())
        helpers.checkValidId(currentUserId)
        curuser = await accountData.getAccountById(currentUserId)

        age = Number(req.body.age)
        helpers.checkValidAge(age)

        helpers.checkValidString(req.body.description)
        description = xss(req.body.description.trim())
        helpers.checkValidString(description)
    } catch (e) {
        console.log("error: " + e)
        return res.status(400).json({
            success: false,
            message: 'Invalid input data',
            error: e
        });
    }
    try {
        accountData.updateAccountInformation(curuser._id,
            curuser.username,
            curuser.password,
            age,
            curuser.isAdmin,
            curuser.isPrivate,
            description,
            curuser.zip_files,
            curuser.follwers,
            curuser.following)
        return res.status(200).json({
            success: true,
            message: "Account Update Successful"
        })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to update account info: ' + e,
            class: 'update-acount-fail'
        })
    }
})

router.route('/uploaddata').get(requireLogin, async (req, res) => {
    try {
        res.status(200).render('uploaddata', { Title: "My Data" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render data page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/uploaddata').post(requireLogin,
    upload.single('file'), async (req, res) => { // got this line from npm website 
        if (!req.file) {
            return res.status(400).render("error",
                {
                    errorMessage: "No ZIP file uploaded",
                    class: "page-fail"
                });
        }
        try {
            await accountData.importAllUserData(req.session.user._id, req.file.buffer);
            return res.status(201).render("success",
                {
                    Title: "Data Upload",
                    successMessage: "Data has been successfully uploaded!"
                });
        }
        catch (e) {
            return res.status(500).render("error",
                {
                    errorMessage: "Upload failed: " + e,
                    class: "page-fail"
                });
        }
    });


router.route('/accountlookup').get(async (req, res) => {
    try {
        res.status(200).render('accountlookup', { Title: "Account Lookup" })
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
        accountlookupdata.accountName = xss(accountlookupdata.accountName.trim())
        helpers.checkValidString(accountlookupdata.accountName)
    } catch (e) {
        return res.status(400).render('error', {
            errorMessage: 'You must enter a search term!',
            class: 'error'
        });
    }
    try {
        let accounts = await accountData.getAccountByUsername(accountlookupdata.accountName)
        res.status(200).render('accountlookupresults', { accounts: accounts, Title: accountlookupdata.accountName + " Results" })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: `We're sorry, but no results were found for ${accountlookupdata.accountName}`,
            class: 'account-not-found'
        })
    }
})


router.route('/:id').get(requireLogin, async (req, res) => {
    //createStatsObject(id)
    let account = {}
    let curuser = {}
    let statistics = {}
    let id = ""
    let range = "all"
    try {
        helpers.checkValidId(req.params.id)
        id = xss(req.params.id.trim())
        helpers.checkValidId(id)
        if (req.query) {
            if (req.query.range) {
                helpers.checkValidString(req.query.range)
                range = xss(req.query.range.trim())
                helpers.checkValidString(range)
            }
        }
        account = await accountData.getAccountById(id)
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Page Not Found: ' + e,
            class: 'page-fail'
        })
    }
    try {
        let currentUserId = req.session.user._id
        helpers.checkValidId(currentUserId)
        currentUserId = xss(currentUserId.trim())
        helpers.checkValidId(currentUserId)
        curuser = await accountData.getAccountById(currentUserId)
    } catch (e) {
        return res.status(401).render('error', {
            errorMessage: 'Not logged in: ' + e,
            class: 'login-fail'
        })
    }
    try {
        if (account.isPrivate) throw "account is private"
    } catch (e) {
        return res.status(403).render('error', {
            errorMessage: 'Account is private',
            class: 'page-fail'
        })
    }
    let follow = "follow"
    if(curuser.following.includes(account._id)){
        follow = "unfollow"
    }
    try {
        console.log("statistics")
        statistics = await accountData.calculateStatistics(id, range)
        console.log(statistics)
    } catch (e) {
        console.log(e)
        try {
            return res.status(500).render('accountbyid', { Title: account.username, id: account._id, statistics: statistics, range: range, follow: follow })
        } catch (e) {
            return res.status(500).render('error', {
                errorMessage: 'Failed to render account by id page: ' + e,
                class: 'page-fail'
            })
        }
    }
    try {
        return res.status(200).render('accountbyid', { Title: account.username, id: account._id, statistics: statistics, range: range, follow: follow })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to render account by id page: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/:id/follow').post(requireLogin, async (req, res) => {
    let currentUserId = ""
    let id = ""
    let account = {}
    let curuser = {}
    try {
        currentUserId = req.session.user._id
        helpers.checkValidId(currentUserId)
        currentUserId = xss(currentUserId.trim())
        helpers.checkValidId(currentUserId)
        curuser = await accountData.getAccountById(currentUserId)
    } catch (e) {
        return res.status(401).render('error', {
            errorMessage: 'Invalid credentials: ' + e,
            class: 'login-fail'
        })
    }
    try {
        helpers.checkValidId(req.params.id)
        id = xss(req.params.id.trim())
        helpers.checkValidId(id)
        account = await accountData.getAccountById(id)
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Page Not Found: ' + e,
            class: 'page-fail'
        })
    }
    try {
        await accountData.addFollower(id, currentUserId)
        return res.status(200).render('success', { Title: "Follow Confirmed", successMessage: `${account.username} followed!` })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to follow account: ' + e,
            class: 'page-fail'
        })
    }
})

router.route('/:id/unfollow').post(requireLogin, async (req, res) => {
    let currentUserId = ""
    let id = ""
    let account = {}
    let curuser = {}
    try {
        currentUserId = req.session.user._id
        helpers.checkValidId(currentUserId)
        currentUserId = xss(currentUserId.trim())
        helpers.checkValidId(currentUserId)
        curuser = await accountData.getAccountById(currentUserId)
    } catch (e) {
        return res.status(401).render('error', {
            errorMessage: 'Invalid credentials: ' + e,
            class: 'login-fail'
        })
    }
    try {
        helpers.checkValidId(req.params.id)
        id = xss(req.params.id.trim())
        helpers.checkValidId(id)
        account = await accountData.getAccountById(id)
    } catch (e) {
        return res.status(404).render('error', {
            errorMessage: 'Page Not Found: ' + e,
            class: 'page-fail'
        })
    }
    try {
        await accountData.unfollow(currentUserId, id)
        return res.status(200).render('success', { Title: "Unfollow Confirmed", successMessage: `${account.username} unfollowed!` })
    } catch (e) {
        return res.status(500).render('error', {
            errorMessage: 'Failed to follow account: ' + e,
            class: 'page-fail'
        })
    }
})


export default router