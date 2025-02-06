import './App.css';
import PostCreate from './posts/PostCreate';
import PostList from './posts/PostsList';

function App() {
  return (
    <div className="container">
      <h1>Create Post</h1>
      <PostCreate />
      <h1>Post List</h1>
      <PostList />
    </div>
  );
}

export default App;
