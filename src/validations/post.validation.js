const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createPost = {
  body: Joi.object().keys(
      {
		vehicle: Joi.string(),
		description: Joi.string(),
		location: Joi.string(),
	}
  ),
};

const getPosts = {
  query: Joi.object().keys(
      {
		vehicle: Joi.string(),
		description: Joi.string(),
		location: Joi.string(),
	}
  ),
};

const getPost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

const updatePost = {
  params: Joi.object().keys({
    postId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
		vehicle: Joi.string(),
		description: Joi.string(),
		location: Joi.string(),
	})
    .min(1),
};

const deletePost = {
  params: Joi.object().keys({
    postId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createPost,
  getPosts,
  getPost,
  updatePost,
  deletePost,
};
