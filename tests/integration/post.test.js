const request = require('supertest');
const faker = require('faker');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { Post } = require('../../src/models');
const { userOne } = require('../fixtures/user.fixture');
const { postOne, postTwo, postThree, insertPosts } = require('../fixtures/post.fixture');
const { userOneAccessToken, userTwoAccessToken } = require('../fixtures/token.fixture');

setupTestDB();

describe('Post routes', () => {
  describe('POST /v1/posts', () => {
    let newPost;

    beforeEach(() => {
      newPost = {
		vehicle: faker.random.word(),
		description: faker.random.word(),
		location: faker.random.word(),
	};
    });

    test('should return 201 and successfully create new post if data is ok', async () => {
      await insertPosts([postOne]);

      const res = await request(app)
        .post('/v1/posts')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(newPost)
        .expect(httpStatus.CREATED);

      expect(res.body).toEqual({ id: expect.anything(), type: newPost.type });

      const dbPost = await Post.findById(res.body.id);
      expect(dbPost).toBeDefined();
      expect(dbPost).toMatchObject({ type: newPost.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await request(app).post('/v1/posts').send(newPost).expect(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/posts', () => {
    test('should return 200 and apply the default query options', async () => {
      await insertPosts([postOne, postTwo]);

      const res = await request(app)
        .get('/v1/posts')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 10,
        totalPages: 1,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0]).toEqual({
        id: postOne._id.toHexString()
      });
    });

    test('should return 401 if access token is missing', async () => {
      await insertPosts([postOne, postTwo]);

      await request(app).get('/v1/posts').send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 403 if a non-admin is trying to access all posts', async () => {
      await insertPosts([postOne, postTwo]);

      await request(app)
        .get('/v1/posts')
        .set('Authorization', `Bearer ${userTwoAccessToken}`)
        .send()
        .expect(httpStatus.FORBIDDEN);
    });

    test('should limit returned array if limit param is specified', async () => {
      await insertPosts([postOne, postTwo, postThree]);

      const res = await request(app)
        .get('/v1/posts')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 1,
        limit: 2,
        totalPages: 2,
        totalResults: 2,
      });
      expect(res.body.results).toHaveLength(2);
      expect(res.body.results[0].id).toBe(postOne._id.toHexString());
      expect(res.body.results[1].id).toBe(postTwo._id.toHexString());
    });

    test('should return the correct page if page and limit params are specified', async () => {
      await insertPosts([postOne, postTwo, postThree]);

      const res = await request(app)
        .get('/v1/posts')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .query({ page: 2, limit: 2 })
        .send()
        .expect(httpStatus.OK);

      expect(res.body).toEqual({
        results: expect.any(Array),
        page: 2,
        limit: 2,
        totalPages: 2,
        totalResults: 3,
      });
      expect(res.body.results).toHaveLength(1);
      expect(res.body.results[0].id).toBe(userOne._id.toHexString());
    });
  });

  describe('GET /v1/posts/:postId', () => {
    test('should return 200 and the post object if data is ok', async () => {
      await insertPosts([postOne]);

      const res = await request(app)
        .get(`/v1/posts/${postOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.OK);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual({
        id: postOne._id.toHexString()
      });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertPosts([postOne]);

      await request(app).get(`/v1/posts/${postOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if postId is not a valid mongo id', async () => {
      await insertPosts([postOne]);

      await request(app)
        .get('/v1/posts/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if post is not found', async () => {
      await insertPosts([postTwo]);

      await request(app)
        .get(`/v1/posts/${postOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /v1/posts/:postId', () => {
    test('should return 204 if data is ok', async () => {
      await insertPosts([postOne]);

      await request(app)
        .delete(`/v1/posts/${postOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NO_CONTENT);

      const dbPost = await Post.findById(postOne._id);
      expect(dbPost).toBeNull();
    });

    test('should return 401 error if access token is missing', async () => {
      await insertPosts([postOne]);

      await request(app).delete(`/v1/posts/${postOne._id}`).send().expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if postId is not a valid mongo id', async () => {
      await insertPosts([postOne]);

      await request(app)
        .delete('/v1/posts/invalidId')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 404 error if post already is not found', async () => {
      await insertPosts([postTwo]);

      await request(app)
        .delete(`/v1/posts/${postOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send()
        .expect(httpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /v1/posts/:postId', () => {
    test('should return 200 and successfully update post if data is ok', async () => {
      await insertPosts([postOne]);
      const updateBody = {
		vehicle: faker.random.word(),
		description: faker.random.word(),
		location: faker.random.word(),
	};

      const res = await request(app)
        .patch(`/v1/posts/${postOne._id}`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.OK);

      let validationData = {
        id: postOne._id.toHexString()
      }
      validationData.merge(updateBody);

      expect(res.body).not.toHaveProperty('password');
      expect(res.body).toEqual(validationData);

      const dbPost = await Post.findById(postOne._id);
      expect(dbPost).toBeDefined();
      expect(dbPost.password).not.toBe(updateBody.password);
      expect(dbPost).toMatchObject({ type: updateBody.type });
    });

    test('should return 401 error if access token is missing', async () => {
      await insertPosts([postOne]);
      const updateBody = {
		vehicle: faker.random.word(),
		description: faker.random.word(),
		location: faker.random.word(),
	};
      await request(app).patch(`/v1/posts/${postOne._id}`).send(updateBody).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return 400 error if postId is not a valid mongo id', async () => {
      await insertPosts([postTwo]);
      const updateBody = {
		vehicle: faker.random.word(),
		description: faker.random.word(),
		location: faker.random.word(),
	};
      await request(app)
        .patch(`/v1/posts/invalidId`)
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .send(updateBody)
        .expect(httpStatus.BAD_REQUEST);
    });
  });
});
