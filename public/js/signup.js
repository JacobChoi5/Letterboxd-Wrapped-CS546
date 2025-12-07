(function () {
    const inputForm = document.getElementById('signupform');
    if (inputForm) {
        inputForm.addEventListener('submit', (event) => {
            event.preventDefault();
            let username = username.value
            let password = password.value
            let cpassword = cpassword.value
            let age = age.value
            let description = description.value
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
            } catch (e) {
                const message = typeof e === 'string' ? e : e.message;
                //errorTextElement.textContent = e;
                let p = document.createElement("p")
                p.textContent = "invalid input"
                const errorDiv = document.getElementById("error")
                errorDiv.appendChild(p)
            }

        })

    }
})()