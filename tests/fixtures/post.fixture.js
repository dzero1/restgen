const faker = require('faker');
const Post = require('../../src/models/post.model');

const postOne = {
		vehicle: faker.random.word(),
		description: faker.random.word(),
		location: faker.random.word(),
	};

const postTwo = {
		vehicle: faker.random.word(),
		description: faker.random.word(),
		location: faker.random.word(),
	};

const postThree = {
		vehicle: faker.random.word(),
		description: faker.random.word(),
		location: faker.random.word(),
	};

const insertPosts = async (posts) => {
  await Post.insertMany(posts.map((post) => ({ ...post })));
};

module.exports = {
  postOne,
  postTwo,
  postThree,
  insertPosts,
};
