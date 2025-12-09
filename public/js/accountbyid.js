(function () {
    const followForm = document.getElementById('followForm')
    const rangeForm = document.getElementById('rangeForm')
    if (followForm) {
        followForm.addEventListener('follow', (event) => {
            event.preventDefault()

            const userId = followForm.dataset.userId

            let requestConfig = {
                method: 'POST',
                url: '/signup',   // your Express route
                contentType: 'application/json',
                data: JSON.stringify({
                    id: userId
                })
            }
            $.ajax(requestConfig).then(function (responseMessage) {
                //PUT RESPONSE HERE OR SMTH
            })

        })

    }

    if (rangeForm) {
        rangeForm.addEventListener('submit', (event) => {
            event.preventDefault()
            const selected = document.querySelector("input[name='range']:checked").value

            

        })
    }

})()