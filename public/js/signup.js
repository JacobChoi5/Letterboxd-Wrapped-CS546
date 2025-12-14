(function ($) {
    const inputForm = document.getElementById('signupform');
    if (inputForm) {
        inputForm.addEventListener('submit', (event) => {
            event.preventDefault()
            let username = document.getElementById("username").value
            let password = document.getElementById("password").value
            let cpassword = document.getElementById("cpassword").value
            let age = document.getElementById("age").value
            let description = document.getElementById("description").value
            try {
                if (!username || typeof username !== "string") throw "not a string"
                username = username.trim()
                if (username === "") throw "empty string"

                if (!password || typeof password !== "string") throw "not a string"
                password = password.trim()
                if (password === "") throw "empty string"

                if (!cpassword || typeof cpassword !== "string") throw "not a string"
                cpassword = cpassword.trim()
                if (cpassword === "") throw "empty string"

                if (password !== cpassword) throw "passwords don't match smh"

                if (!age) throw "missing age"
            } catch (e) {
                event.preventDefault()
                const message = typeof e === 'string' ? e : e.message
                //errorTextElement.textContent = e;
                let p = document.createElement("p")
                p.textContent = "invalid input"
                const errorDiv = document.getElementById("error")
                errorDiv.appendChild(p)
                return
            }

            let requestConfig = {
                method: 'POST',
                url: '/signupconfirm',   // your Express route
                contentType: 'application/json',
                data: JSON.stringify({
                    username: username,
                    password: password,
                    age: age,
                    description: description
                })
            }

            $.ajax(requestConfig).then(function (responseMessage) {
                console.log(responseMessage)
                inputForm.replaceWith(`${responseMessage.message}`)

            }, function (errorMessage) {
                console.log(errorMessage.message)
                //update error div with error message
                let p = document.createElement("p")
                p.textContent = `Error in creating account. Username my already be taken.`
                const errorDiv = document.getElementById("error")
                errorDiv.replaceChildren(p)
            })


        })

    }

})(jQuery)