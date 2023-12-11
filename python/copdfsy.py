import pymongo

def copy_mongodb_database(source_uri, source_db_name, destination_uri, destination_db_name):
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
    destination_uri = "mongodb+srv://goqrorder:2fFhzGUn6EdNUPQJ@cluster0.bt9bmvq.mongodb.net/testdb"
    destination_db_name = "testdb"

    copy_mongodb_database(source_uri, source_db_name, destination_uri, destination_db_name)
