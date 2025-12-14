let actors = $('#actors'),
  actorsButton = $('#actorsButton')

actorsButton.on('click', function (event) {
  event.preventDefault()
  actors.empty()

  let movieId = actorsButton.data('movie-id');

  let requestConfig = {
    method: 'GET',
    url: `/movies/${movieId}/actors`
  };

  $.ajax(requestConfig).then(function (data) {
    for(let actor of data)
    {
      actors.append(`<li>${actor.name} as ${actor.role}</li>`)
    }
  });
  actorsButton.hide()
});