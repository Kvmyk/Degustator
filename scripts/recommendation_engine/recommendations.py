import os
import sys
from neo4j import GraphDatabase
import pandas as pd
import numpy as np
from sklearn.decomposition import TruncatedSVD

# Configuration
NEO4J_URI = os.getenv("NEO4J_URI", "neo4j://localhost:7687")
NEO4J_USERNAME = os.getenv("NEO4J_USERNAME", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "degustator")

def get_data(driver):
    """
    Fetches all user-review-post interactions from Neo4j.
    Returns a pandas DataFrame with columns: [userID, itemID, rating]
    """
    # Fetch User IDs, Post IDs, Ratings, AND Tags
    # We aggregate tags into a list for each row
    query = """
    MATCH (u:User)-[:CREATED]->(r:Review)-[:REVIEWED]->(p:Post)
    OPTIONAL MATCH (p)-[:HAS_TAG]->(t:Tag)
    RETURN 
        toString(u.id) as userID, 
        toString(p.id) as itemID, 
        r.rating as rating,
        collect(t.name) as tags
    """
    with driver.session() as session:
        result = session.run(query)
        data = [record.data() for record in result]
    
    return pd.DataFrame(data)

def get_all_posts_tags(driver):
    """
    Fetches tags for ALL posts (even unrated ones) to calculate content scores for candidates.
    Returns dict: {post_id: [tag_names]}
    """
    query = """
    MATCH (p:Post)
    OPTIONAL MATCH (p)-[:HAS_TAG]->(t:Tag)
    RETURN toString(p.id) as itemID, collect(t.name) as tags
    """
    with driver.session() as session:
        result = session.run(query)
        # Filter out empty tags if any
        return {r["itemID"]: [t for t in r["tags"] if t] for r in result}

def calculate_tag_preferences(df):
    """
    Builds a profile for each user: {tag_name: avg_rating}
    """
    user_tag_ratings = {} # {user_id: {tag: [ratings]}}
    
    for _, row in df.iterrows():
        uid = row['userID']
        rating = row['rating']
        tags = row['tags']
        
        if uid not in user_tag_ratings:
            user_tag_ratings[uid] = {}
        
        for tag in tags:
            if not tag: continue # skip nulls
            if tag not in user_tag_ratings[uid]:
                user_tag_ratings[uid][tag] = []
            user_tag_ratings[uid][tag].append(rating)
            
    # Compute averages
    user_profiles = {}
    for uid, tags_map in user_tag_ratings.items():
        user_profiles[uid] = {}
        for tag, ratings in tags_map.items():
            user_profiles[uid][tag] = sum(ratings) / len(ratings)
            
    return user_profiles

def get_content_score(user_profile, post_tags):
    """
    Calculates score based on how well post tags match user profile.
    Returns avg of user's ratings for these tags, or neutral 3.0 if unknown.
    """
    if not post_tags or not user_profile:
        return 3.0 # Neutral default
        
    scores = []
    for tag in post_tags:
        if tag in user_profile:
            scores.append(user_profile[tag])
            
    if not scores:
        return 3.0
        
    return sum(scores) / len(scores)

def save_recommendations(driver, recommendations):
    """
    Saves recommendations to Neo4j.
    recommendations: List of (user_id, post_id, score) tuples
    """
    if not recommendations:
        print("No recommendations to save.")
        return

    # 1. Clear old recommendations
    print("Clearing old recommendations...")
    clear_query = """
    MATCH (:User)-[r:RECOMMENDED]->(:Post)
    DELETE r
    """
    with driver.session() as session:
        session.run(clear_query)
    
    # 2. Batch insert new recommendations
    print(f"Saving {len(recommendations)} new recommendations...")
    insert_query = """
    UNWIND $batch as row
    MATCH (u:User {id: row.user_id}), (p:Post {id: row.post_id})
    MERGE (u)-[r:RECOMMENDED]->(p)
    SET r.score = row.score
    """
    
    batch_size = 1000
    total = len(recommendations)
    
    with driver.session() as session:
        for i in range(0, total, batch_size):
            batch = [
                {"user_id": uid, "post_id": pid, "score": float(score)}
                for uid, pid, score in recommendations[i:i+batch_size]
            ]
            session.run(insert_query, batch=batch)
            print(f"Saved {min(i+batch_size, total)}/{total}")

def main():
    print("Connecting to Neo4j (Hybrid Engine)...")
    try:
        driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USERNAME, NEO4J_PASSWORD))
        driver.verify_connectivity()
        print("Connected.")
    except Exception as e:
        print(f"Failed to connect to Neo4j: {e}")
        sys.exit(1)

    try:
        # 1. Load Data
        print("Fetching interaction data...")
        df = get_data(driver)
        if df.empty:
            print("No review data found. Exiting.")
            return

        print(f"Loaded {len(df)} interactions.")
        
        print("Fetching all post tags...")
        all_post_tags = get_all_posts_tags(driver)

        # 2. Collaborative Filtering (SVD)
        print("Running SVD...")
        pivot_df = df.pivot_table(index='userID', columns='itemID', values='rating')
        user_means = pivot_df.mean(axis=1)
        pivot_centered = pivot_df.sub(user_means, axis=0).fillna(0)
        
        user_ids_idx = pivot_centered.index
        item_ids_idx = pivot_centered.columns
        X = pivot_centered.values

        n_items = X.shape[1]
        
        # Determine if we can run SVD
        run_svd = True
        if n_items < 2:
            print("Not enough items for SVD. Falling back to pure Content-Based.")
            run_svd = False
            # Mock predicted matrix as zeros so we rely on content only
            X_predicted = np.zeros(X.shape)
        else:
            n_components = min(20, n_items - 1) if n_items > 1 else 1
            svd = TruncatedSVD(n_components=n_components, random_state=42)
            X_reduced = svd.fit_transform(X)
            X_reconstructed = np.dot(X_reduced, svd.components_)
            X_predicted = X_reconstructed + user_means.values.reshape(-1, 1)

        # 3. Content-Based Filtering
        print("Calculating User Tag Profiles...")
        user_profiles = calculate_tag_preferences(df)

        # 4. Hybrid Generation
        print("Generating Hybrid recommendations...")
        final_recommendations = []
        
        missing_mask = pivot_df.isna().values
        num_users, num_items = X.shape
        
        # Weights
        # If good SVD: 70% SVD, 30% Content. 
        # If SVD failed: 0% SVD, 100% Content.
        w_svd = 0.7 if run_svd else 0.0
        w_content = 0.3 if run_svd else 1.0
        
        for idx in range(num_users):
            user_id = user_ids_idx[idx]
            svd_preds = X_predicted[idx]
            user_prof = user_profiles.get(user_id, {})
            
            candidates = []
            
            # Check all items
            for item_idx in range(num_items):
                # Only if not rated
                if not missing_mask[idx, item_idx]:
                    continue
                    
                item_id = item_ids_idx[item_idx]
                
                # Get Scores
                s_svd = svd_preds[item_idx]
                s_content = get_content_score(user_prof, all_post_tags.get(item_id, []))
                
                # Hybrid Score
                final_score = (s_svd * w_svd) + (s_content * w_content)
                candidates.append((item_id, final_score))
            
            # Sort & Top 10
            candidates.sort(key=lambda x: x[1], reverse=True)
            for iid, score in candidates[:10]:
                final_recommendations.append((user_id, iid, score))

        # 5. Save
        save_recommendations(driver, final_recommendations)
        print("Done.")

    finally:
        driver.close()

if __name__ == "__main__":
    main()
