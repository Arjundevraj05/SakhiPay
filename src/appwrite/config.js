import conf from '../conf/conf.js'
import { Client, ID, Databases } from "appwrite";

export class Service {
    client = new Client();
    databases;

    constructor() {
        this.client
            .setEndpoint(conf.appwriteUrl)
            .setProject(conf.appwriteProjectId);
        this.databases = new Databases(this.client); 
    }

    async createExpense({ userId, amount, category, description, date, fileUrl }) {
        try {
            const expenseData = {
                userId,
                amount,
                category,
                description,
                date // Adding date field
            };
            
            // Note: fileUrl will be stored in local state for now
            // until we add it to the Appwrite collection schema
            
            return await this.databases.createDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                ID.unique(),
                expenseData
            );
        } catch (error) {
            throw error;
        }
    }

    async updateExpense(documentId, { amount, category, description, date, fileUrl }) {
        try {
            const updateData = {
                amount,
                category,
                description,
                date // Ensure date is included
            };
            
            // Note: fileUrl will be stored in local state for now
            // until we add it to the Appwrite collection schema
            
            return await this.databases.updateDocument( 
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                documentId, 
                updateData
            );
        } catch (error) {
            throw error;
        }
    }

    async deleteExpense(documentId) {
        try {
            return await this.databases.deleteDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                documentId
            );
        } catch (error) {
            throw error;
        }
    }

    async getExpense(documentId) {
        try {
            return await this.databases.getDocument(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId,
                documentId
            );
        } catch (error) {
            console.log(error);
            return false;             
        }
    }

    async getExpenses() {
        try {
            return await this.databases.listDocuments(
                conf.appwriteDatabaseId,
                conf.appwriteCollectionId
            );
        } catch (error) {
            console.log(error);
            return false;
        }
    }
}

const service = new Service();
export default service;
