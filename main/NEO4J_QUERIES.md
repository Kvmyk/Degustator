// Neo4j Cypher Queries - Degustator Database

// ============================================
// USERS
// ============================================

// Create User
CREATE (u:User {
  id: apoc.create.uuid(),
  name: 'Jan Kowalski',
  email: 'jan@example.com',
  password_hash: '$2b$10$...',
  photo_url: 'https://example.com/photo.jpg',
  bio: 'Miłośnik gotowania',
  created_at: datetime()
})

// Find User by ID
MATCH (u:User { id: '123-456-789' })
RETURN u

// Get all Users
MATCH (u:User)
RETURN u
LIMIT 100

// Delete User
MATCH (u:User { id: '123-456-789' })
DETACH DELETE u

// ============================================
// FOLLOWERS / FOLLOWING
// ============================================

// User follows another user
MATCH (u1:User { id: 'user1-id' }), (u2:User { id: 'user2-id' })
MERGE (u1)-[:FOLLOWS]->(u2)

// Get User followers
MATCH (u:User { id: 'user-id' })<-[:FOLLOWS]-(follower:User)
RETURN follower

// Get User following
MATCH (u:User { id: 'user-id' })-[:FOLLOWS]->(following:User)
RETURN following

// Unfollow user
MATCH (u1:User { id: 'user1-id' })-[r:FOLLOWS]->(u2:User { id: 'user2-id' })
DELETE r

// ============================================
// POSTS
// ============================================

// Create Post
MATCH (u:User { id: 'user-id' })
CREATE (p:Post {
  id: apoc.create.uuid(),
  title: 'Mój przepis na piernik',
  content: 'Opis przepisu...',
  recipe: 'Instrukcje przygotowania...',
  photos: ['url1', 'url2'],
  avg_rating: 0.0,
  likes_count: 0,
  created_at: datetime()
})
CREATE (u)-[:CREATED]->(p)
RETURN p

// Get all Posts
MATCH (p:Post)
RETURN p
ORDER BY p.created_at DESC
LIMIT 20

// Get Post with details
MATCH (p:Post { id: 'post-id' })
OPTIONAL MATCH (p)-[:HAS_TAG]->(t:Tag)
OPTIONAL MATCH (p)-[:HAS_INGREDIENT]->(i:Ingredient)
OPTIONAL MATCH (u:User)-[:CREATED]->(p)
OPTIONAL MATCH (p)<-[:REVIEWED]-(r:Review)
RETURN p, collect(t) as tags, collect(i) as ingredients, u as author, collect(r) as reviews

// Get Posts created by User
MATCH (u:User { id: 'user-id' })-[:CREATED]->(p:Post)
RETURN p
ORDER BY p.created_at DESC

// Delete Post
MATCH (p:Post { id: 'post-id' })
DETACH DELETE p

// ============================================
// LIKES
// ============================================

// User likes Post
MATCH (u:User { id: 'user-id' }), (p:Post { id: 'post-id' })
MERGE (u)-[:LIKES]->(p)
WITH p
MATCH (p)<-[:LIKES]-(likedBy:User)
SET p.likes_count = count(likedBy)
RETURN p

// Get Posts liked by User
MATCH (u:User { id: 'user-id' })-[:LIKES]->(p:Post)
RETURN p
ORDER BY p.created_at DESC

// Unlike Post
MATCH (u:User { id: 'user-id' })-[r:LIKES]->(p:Post { id: 'post-id' })
DELETE r
WITH p
MATCH (p)<-[:LIKES]-(likedBy:User)
SET p.likes_count = count(likedBy)
RETURN p

// ============================================
// REVIEWS / RATINGS
// ============================================

// Create Review
MATCH (u:User { id: 'user-id' }), (p:Post { id: 'post-id' })
CREATE (r:Review {
  id: apoc.create.uuid(),
  rating: 5,
  content: 'Świetny przepis!',
  created_at: datetime()
})
CREATE (u)-[:CREATED]->(r)
CREATE (r)-[:REVIEWED]->(p)
WITH p, r
MATCH (p)<-[:REVIEWED]-(reviews:Review)
WITH p, avg(reviews.rating) as avg_rating
SET p.avg_rating = avg_rating
RETURN r

// Get Reviews for Post
MATCH (r:Review)-[:REVIEWED]->(p:Post { id: 'post-id' })
OPTIONAL MATCH (u:User)-[:CREATED]->(r)
RETURN r, u as author
ORDER BY r.created_at DESC

// Get average rating for Post
MATCH (p:Post { id: 'post-id' })<-[:REVIEWED]-(r:Review)
RETURN avg(r.rating) as avg_rating, count(r) as review_count

// Delete Review and update Post rating
MATCH (r:Review { id: 'review-id' })-[:REVIEWED]->(p:Post)
DETACH DELETE r
WITH p
MATCH (p)<-[:REVIEWED]-(reviews:Review)
WITH p, avg(reviews.rating) as avg_rating
SET p.avg_rating = avg_rating
RETURN p

// ============================================
// TAGS
// ============================================

// Create Tag
CREATE (t:Tag {
  id: apoc.create.uuid(),
  name: 'Deserki',
  description: 'Przepisy na desery',
  popularity: 0,
  created_at: datetime()
})

// Add Tag to Post
MATCH (p:Post { id: 'post-id' }), (t:Tag { id: 'tag-id' })
MERGE (p)-[:HAS_TAG]->(t)

// Get Tags for Post
MATCH (p:Post { id: 'post-id' })-[:HAS_TAG]->(t:Tag)
RETURN t

// Get Posts with Tag
MATCH (t:Tag { id: 'tag-id' })<-[:HAS_TAG]-(p:Post)
RETURN p
ORDER BY p.created_at DESC

// Get Popular Tags
MATCH (t:Tag)
RETURN t
ORDER BY t.popularity DESC
LIMIT 50

// ============================================
// INGREDIENTS
// ============================================

// Create Ingredient
CREATE (i:Ingredient {
  id: apoc.create.uuid(),
  name: 'Mąka pszeniczna',
  avg_cost: 2.50,
  popularity: 0,
  created_at: datetime()
})

// Add Ingredient to Post
MATCH (p:Post { id: 'post-id' }), (i:Ingredient { id: 'ingredient-id' })
MERGE (p)-[:HAS_INGREDIENT]->(i)

// Get Ingredients for Post
MATCH (p:Post { id: 'post-id' })-[:HAS_INGREDIENT]->(i:Ingredient)
RETURN i

// Get Posts with Ingredient
MATCH (i:Ingredient { id: 'ingredient-id' })<-[:HAS_INGREDIENT]-(p:Post)
RETURN p
ORDER BY p.created_at DESC

// Get Popular Ingredients
MATCH (i:Ingredient)
RETURN i
ORDER BY i.popularity DESC
LIMIT 50

// ============================================
// SEARCH & ANALYTICS
// ============================================

// Search Posts by text
MATCH (p:Post)
WHERE p.title CONTAINS 'piernik' OR p.content CONTAINS 'piernik' OR p.recipe CONTAINS 'piernik'
RETURN p
LIMIT 50

// Get Top Rated Posts
MATCH (p:Post)
RETURN p
ORDER BY p.avg_rating DESC, p.likes_count DESC
LIMIT 20

// Get Most Liked Posts
MATCH (p:Post)
RETURN p
ORDER BY p.likes_count DESC
LIMIT 20

// Get Trending Posts (recent + popular)
MATCH (p:Post)
WHERE p.created_at > datetime() - duration('P7D')
RETURN p
ORDER BY p.likes_count + p.avg_rating DESC
LIMIT 20

// Get User statistics
MATCH (u:User { id: 'user-id' })
OPTIONAL MATCH (u)-[:CREATED]->(p:Post)
OPTIONAL MATCH (u)-[:FOLLOWS]->(following:User)
OPTIONAL MATCH (follower:User)-[:FOLLOWS]->(u)
OPTIONAL MATCH (u)-[:LIKES]->(likedPost:Post)
RETURN u,
  count(distinct p) as posts_count,
  count(distinct following) as following_count,
  count(distinct follower) as followers_count,
  count(distinct likedPost) as liked_posts_count

// ============================================
// BATCH OPERATIONS
// ============================================

// Delete all Posts by User
MATCH (u:User { id: 'user-id' })-[:CREATED]->(p:Post)
DETACH DELETE p

// Delete all Reviews by User
MATCH (u:User { id: 'user-id' })-[:CREATED]->(r:Review)
DETACH DELETE r

// Update all Posts popularity count
MATCH (p:Post)<-[:HAS_TAG]-(t:Tag)
WITH p, count(t) as tag_count
SET p.popularity = tag_count + p.likes_count
RETURN p
