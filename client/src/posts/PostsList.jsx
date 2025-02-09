import { useState, useEffect } from 'react';
import axios from 'axios';
import CommentCreate from './CommentCreate';
import CommentsList from './CommentsList';

function PostList() {
  const [postsList, setPostList] = useState({});
  const fetchPost = async () => {
    try {
      const { data } = await axios.get('http://query-clusterip-srv:4002/posts');
      console.log('received data: ', data);
      setPostList(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);
  const displayPost = Object.values(postsList).map((post) => {
    return (
      <li
        className="card"
        key={post.id}
        style={{ maxWidth: '960px', marginBottom: '2rem' }}
      >
        <div className="card-body">
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <CommentsList postComments={post.comments} />
          <CommentCreate postId={post.id} />
        </div>
      </li>
    );
  });

  return (
    <ul className="d-flex flex-column" style={{ margin: '0', padding: '0' }}>
      {displayPost}
    </ul>
  );
}

export default PostList;
