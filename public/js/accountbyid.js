(function ($) {
    let rangeForm = $('#rangeForm');
    let followForm = $('#followForm');

    followForm.submit(function (event) {
        event.preventDefault()
        let userId = followForm.dataset.userId
        let requestConfig = {
                method: 'POST',
                url: '/follow',
                contentType: 'application/json',
                data: JSON.stringify({
                    id: userId
                })
            }
            $.ajax(requestConfig).then(function (responseMessage) {
                //PUT RESPONSE HERE OR SMTH
                console.log(responseMessage)
            })
    })

    rangeForm.submit(function (event) {
        event.preventDefault()
            const selected = document.querySelector("input[name='range']:checked").value

    })



})(window.jQuery)