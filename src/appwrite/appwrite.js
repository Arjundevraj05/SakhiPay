import { Client, Databases, ID, Query } from "appwrite";
import conf from "../conf/conf";

const client = new Client();
client.setEndpoint(conf.appwriteUrl).setProject(conf.appwriteProjectId);

const databases = new Databases(client);

export const addExpense = async (expense) => {
  try {
    const response = await databases.createDocument(
      "67e281b3000f3acf0da7", // Database ID
      "67e281f00016cefd2264", // Collection ID
      ID.unique(),
      expense
    );
    return response;
  } catch (error) {
    console.error("Error adding expense:", error);
    return null;
  }
};

export const fetchExpenses = async (userId) => {
  try {
    const response = await databases.listDocuments(
      "67e281b3000f3acf0da7", // Database ID
      "67e281f00016cefd2264", // Collection ID
      [Query.equal("userId", userId)] // ✅ Correct Query Format
    );
    return response.documents;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
};
