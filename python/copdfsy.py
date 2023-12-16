import pymongo


def copy_mongodb_database(
    source_uri, source_db_name, destination_uri, destination_db_name
):
    # Connect to the source MongoDB database
    # source_client = MongoClient(source_uri)
    source_client = pymongo.MongoClient(source_uri)
    source_db = source_client[source_db_name]

    # Connect to the destination MongoDB database
    # destination_client = MongoClient(destination_uri)

    destination_client = pymongo.MongoClient(destination_uri)
    destination_db = destination_client[destination_db_name]

    # Get the list of collections in the source database
    collections = source_db.list_collection_names()

    # Copy each collection from the source to the destination
    for collection_name in collections:
        source_collection = source_db[collection_name]
        destination_collection = destination_db[collection_name]

        # Use insert_many to copy documents from the source to the destination
        documents = source_collection.find()
        destination_collection.insert_many(documents)

    # Close the MongoDB connections
    source_client.close()
    destination_client.close()


if __name__ == "__main__":
    # Replace these with your MongoDB connection strings and database names
    source_uri = "mongodb+srv://goqrorder:2fFhzGUn6EdNUPQJ@cluster0.bt9bmvq.mongodb.net/digitalMenuWeb"
    source_db_name = "digitalMenuWeb"
    destination_uri = (
        "mongodb+srv://goqrorder:2fFhzGUn6EdNUPQJ@cluster0.bt9bmvq.mongodb.net/testdb"
    )
    destination_db_name = "testdb"

    # copy_mongodb_database(source_uri, source_db_name, destination_uri, destination_db_name)

    # delete all teh data from the orders collection in teh destination database
    # Connect to the destination MongoDB database

    # destination_uri = "mongodb://localhost:27017/"
    # destination_db_name = "digitalMenuWeb"
    # destination_client = pymongo.MongoClient(destination_uri)
    # destination_db = destination_client[destination_db_name]
    # destination_collection = destination_db["orders"]
    # destination_collection.delete_many({})
    # destination_client.close()

    # copy the orders collection from the source to the destination

    # delete all teh data from the orders collection in teh source database

    # copy_mongodb_database(source_uri, source_db_name, destination_uri, destination_db_name)


# Great! Now you can get started with the API!
# For public read-only and anonymous resources, such as getting image info, looking up user comments, etc. all you need to do is send an authorization header with your client_id in your requests. This also works if you'd like to upload images anonymously (without the image being tied to an account), or if you'd like to create an anonymous album. This lets us know which application is accessing the API.

# Authorization: Client-ID YOUR_CLIENT_ID

# For accessing a user's account, please visit the OAuth2 section of the docs.

# Client ID:
# 869f294e59431cd
# Client secret:
# e2aa0949267297997c95e1d430a6dcdfb48c93eb
# IMGUR_CLIENT_ID = "869f294e59431cd"
# IMGUR_CLIENT_SECRET = "e2aa0949267297997c95e1d430a6dcdfb48c93eb"