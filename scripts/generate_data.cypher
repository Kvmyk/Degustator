// 1. CLEAR DATABASE (Commented out to preserve existing data)
// MATCH (n) DETACH DELETE n;

// 2. CREATE TAGS (Use MERGE to avoid duplicates if they exist)
MERGE (t1:Tag {name: 'Włoska'}) ON CREATE SET t1.id = apoc.create.uuid(), t1.popularity = 100
MERGE (t2:Tag {name: 'Pikantne'}) ON CREATE SET t2.id = apoc.create.uuid(), t2.popularity = 80
MERGE (t3:Tag {name: 'Wegańskie'}) ON CREATE SET t3.id = apoc.create.uuid(), t3.popularity = 90
MERGE (t4:Tag {name: 'Desery'}) ON CREATE SET t4.id = apoc.create.uuid(), t4.popularity = 120
WITH [t1, t2, t3, t4] as tags

// 3. CREATE USERS (Each with a "Favorite" Tag assigned logically)
// Users 1-3 love Italian (t1)
FOREACH (i IN range(1,3) | 
  CREATE (u:User {
    id: apoc.create.uuid(), 
    name: 'Włoski Fan ' + i, 
    fav_tag_index: 0
  })
)
// Users 4-6 love Spicy (t2)
FOREACH (i IN range(4,6) | 
  CREATE (u:User {
    id: apoc.create.uuid(), 
    name: 'Ostrożerca ' + i, 
    fav_tag_index: 1
  })
)
// Users 7-8 love Vegan (t3)
FOREACH (i IN range(7,8) | 
  CREATE (u:User {
    id: apoc.create.uuid(), 
    name: 'Vege ' + i, 
    fav_tag_index: 2
  })
)
// Users 9-10 love Desserts (t4)
FOREACH (i IN range(9,10) | 
  CREATE (u:User {
    id: apoc.create.uuid(), 
    name: 'Łasuch ' + i, 
    fav_tag_index: 3
  })
)

// 4. CREATE POSTS (Assigned to random Tags)
WITH tags
UNWIND range(1, 30) as j
WITH tags, j, tags[toInteger(rand() * size(tags))] as main_tag
CREATE (p:Post {
  id: apoc.create.uuid(),
  title: 'Post ' + main_tag.name + ' #' + j,
  created_at: datetime()
})
MERGE (p)-[:HAS_TAG]->(main_tag)
// Assign random creator
WITH p, tags
MATCH (u:User) 
WITH p, u, tags ORDER BY rand() LIMIT 1
CREATE (u)-[:CREATED]->(p)

// 5. GENERATE RATINGS (Based on preferences!)
WITH tags
MATCH (u:User), (p:Post)-[:HAS_TAG]->(t:Tag)
// Determine if this is the user's favorite tag
WITH u, p, t, tags, (tags[u.fav_tag_index] = t) as is_fav
// Logic: If favorite, Rating 4-5. If not, Rating 1-4.
// random() gives 0.0-1.0
// Fav: 4 + rand() -> 4.0 to 5.0
// Non-fav: 1 + rand()*3 -> 1.0 to 4.0
WITH u, p, 
     CASE WHEN is_fav THEN 4.0 + rand() ELSE 1.0 + (rand() * 3.0) END as raw_rating
// 50% chance to review any given post to keep matrix sparse but meaningful
WHERE rand() < 0.5 
CREATE (r:Review {
  id: apoc.create.uuid(),
  rating: toFloat(substring(toString(raw_rating), 0, 3)), // Round roughly to 1 decimal
  created_at: datetime()
})
CREATE (u)-[:CREATED]->(r)
CREATE (r)-[:REVIEWED]->(p);
