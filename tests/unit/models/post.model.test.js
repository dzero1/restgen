const faker = require('faker');
const { Post } = require('../../../src/models');

describe('Post model', () => {
  describe('Post validation', () => {
    let newPost;

    beforeEach(() => {
      newPost = {
		vehicle: faker.random.word(),
		description: faker.random.word(),
		location: faker.random.word(),
	};
    });

    test('should correctly validate a valid post', async () => {
      await expect(new Post(newPost).validate()).resolves.toBeUndefined();
    });
  });
});
