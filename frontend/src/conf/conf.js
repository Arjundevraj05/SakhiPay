const conf = {
  appwriteUrl:
    process.env.REACT_APP_APPWRITE_URL || "https://cloud.appwrite.io/v1",
  appwriteProjectId:
    process.env.REACT_APP_APPWRITE_PROJECT_ID || "67e24c60003bbc6040cd",
  appwriteDatabaseId:
    process.env.REACT_APP_APPWRITE_DATABASE_ID || "67e281b3000f3acf0da7",
  appwriteCollectionId:
    process.env.REACT_APP_APPWRITE_COLLECTION_ID || "67e281f00016cefd2264",
};

export default conf;
