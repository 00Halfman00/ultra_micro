import { useState } from 'react';
import axios from 'axios';

function PostCreate() {
  const [post, setPosts] = useState({
    title: '',
    content: '',
  });

  const submitHandler = async (e) => {
    e.preventDefault();
    console.log('post being created in PostCreate: ', post);
    await axios
      .post('http://posts.com/posts/create', post)
      .catch((e) => console.error(e));
    setPosts({ title: '', content: '' });
  };

  return (
    <div>
      <form onSubmit={submitHandler} style={{ marginBottom: '2rem' }}>
        <div className="form-group" style={{ marginBottom: '1rem' }}>
          <label htmlFor="title">Title</label>
          <input
            id="title"
            className="form-control"
            value={post.title}
            onChange={(e) => setPosts({ ...post, title: e.target.value })}
          />
          <label htmlFor="content">Content</label>
          <input
            id="content"
            className="form-control"
            value={post.content}
            onChange={(e) => setPosts({ ...post, content: e.target.value })}
          />
        </div>
        <button className="btn btn-primary">submit</button>
      </form>
    </div>
  );
}

export default PostCreate;
