let comments = $('#comments'),
  commentForm = $('#commentForm'),
  commentText = $('#commentText'),
  commentError = $('#commentError'),
  movieId = commentForm.data('movie-id');

commentForm.on('submit', function (event) {
  event.preventDefault()
  actors.empty()

  let text = commentText.val().trim()

  if(!text)
  {
    commentError.text('Your comment cannot be empty')
    commentError.show()
    return
  }

  let requestConfig = {
    method: 'POST',
    url: `/movies/${movieId}/comment`,
    data: { text }
  };

  commentError.hide()

  $.ajax(requestConfig).then(function (data) {
    commentText.val('');
    comments.empty();
      for (let comment of data) 
      {
        comments.append(displayComment(comment, movieId));
      }
  });
});

function displayComment(comment, movieId) {
  let html = 
  `
    <hr>
    <p>${comment.postedAt}</p>
    <p>${comment.username}: ${comment.text}</p>
    <p>Likes: ${comment.likes.length}</p>

    <form action="/movies/${movieId}/likecomment" method="POST">
      <input type="hidden" name="commentId" value="${comment._id}">
      <button type="submit">♥</button>
    </form>

    <p>Reply:</p>
    <form class="replyForm" data-movie-id="${movieId}" data-supercomment-id="${comment._id}">
      <input type="text" name="text">
      <button type="submit">Add Comment</button>
    </form>
  `

  if (comment.subcomments && comment.subcomments.length > 0) {
    html += `<p>Replies:</p><ul>`;
    for (let sub of comment.subcomments) {
      html += `<li>${displayComment(sub, movieId)}</li>`;
    }
    html += `</ul>`;
  }

  return html;
}

//https://stackoverflow.com/questions/18545941/jquerys-on-method-combined-with-the-submit-event
//https://stackoverflow.com/questions/12191416/jquery-get-input-value-inside-this-based-on-name

$(document).on('submit', '.replyForm', function (event) {
  event.preventDefault();

  const form = $(this);
  const superCommentId = form.data('supercomment-id');
  const text = form.find('input[name="text"]').val().trim();

  if(!text)
  {
    commentError.text('Your comment cannot be empty')
    commentError.show()
    return
  }

  $.ajax({
    method: 'POST',
    url: `/movies/${movieId}/comment`,
    data: {
      text,
      supercomment: superCommentId
    }
  })
  .then(function (data) {
    commentText.val('');
    comments.empty();
      for (let comment of data) 
      {
        comments.append(displayComment(comment, movieId));
      }
  })
});