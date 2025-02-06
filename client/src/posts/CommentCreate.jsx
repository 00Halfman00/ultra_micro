import { useState } from 'react';
import axios from 'axios';

function CommentCreate({ postId }) {
  const [content, setContent] = useState('');

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log('comment being created at CommentCreate: ', content);
    await axios.post(`http://localhost:4001/posts/${postId}/comments`, {
      content,
    });
    setContent('');
  };

  return (
    <div>
      <form onSubmit={submitHandler} style={{ marginBottom: '2rem' }}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="comment">Comment</label>
          <input
            id="comment"
            className="form-control"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary">submit</button>
      </form>
    </div>
  );
}

export default CommentCreate;
