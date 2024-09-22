// routes/posts.js

const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/auth');

// Create a new post
router.post('/', authMiddleware, async (req, res) => {
  const { text, images } = req.body;
  const postedBy = req.user._id;

  try {
    const newPost = new Post({ text, images, postedBy });
    await newPost.save();
    res.status(201).json({ message: 'Post created successfully.', post: newPost });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'An error occurred while creating the post.' });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('postedBy', 'username');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'An error occurred while fetching posts.' });
  }
});

// Like a post
router.put('/:postId/like', authMiddleware, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    // Check if the user already liked the post
    const alreadyLiked = post.likes.some(like => like.equals(userId));
    if (alreadyLiked) {
      return res.status(400).json({ message: 'You have already liked this post.' });
    }

    post.likes.push(userId);
    await post.save();
    res.json({ message: 'Post liked successfully.', post });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'An error occurred while liking the post.' });
  }
});

// Comment on a post
router.post('/:postId/comment', authMiddleware, async (req, res) => {
  const postId = req.params.postId;
  const { text } = req.body;
  const commentedBy = req.user._id;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }

    const newComment = { text, postedBy: commentedBy };
    post.comments.push(newComment);
    await post.save();
    res.status(201).json({ message: 'Comment added successfully.', post });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'An error occurred while adding the comment.' });
  }
});

module.exports = router;
