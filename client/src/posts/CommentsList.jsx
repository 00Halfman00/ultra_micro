function CommentsList({ postComments }) {
  const displayComments = postComments.map((comment) => {
    console.log('comment key: ', comment);
    let content;
    if (comment.status === 'approved') content = comment.content;
    else if (comment.status === 'pending')
      content = 'comment is waiting moderation';
    else content = 'comment rejected';
    return (
      <li key={comment.id} style={{ maxWidth: '960px' }}>
        <p>{content}</p>
      </li>
    );
  });

  return (
    <ul
      className=" card d-flex flex-column"
      style={{
        paddingLeft: '.5rem',
        paddingTop: '.5rem',
        listStyle: 'none',
        borderColor: 'blue',
      }}
    >
      {displayComments}
    </ul>
  );
}

export default CommentsList;
