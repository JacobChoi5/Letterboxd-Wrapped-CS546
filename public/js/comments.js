let comments = $('#comments'),
  commentForm = $('#commentForm'),
  commentText = $('#commentText'),
  commentError = $('#commentError')

commentForm.on('submit', function (event) {
  event.preventDefault()
  actors.empty()

  let movieId = commentForm.data('movie-id');

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
    let comment
      for (let comment of data) 
      {
        comment = 
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
          <form action="/movies/${movieId}/comment" method="POST">
            <input type="text" name="text">
            <input type="hidden" name="supercomment" value="${comment._id}">
            <button type="submit">Add Comment</button>
          </form>
        `
        if (comment.subcomments && comment.subcomments.length > 0) 
        {
          html += `<p>Replies:</p><ul>`;
          for (let sub of comment.subcomments) {
            html += `<li>${renderComment(sub, movieId)}</li>`;
          }
          html += `</ul>`;
        }
        comments.append(comment);
      }
  });
});