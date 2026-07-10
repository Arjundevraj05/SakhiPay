import conf from "../conf/conf.js";
import { Client, ID, Databases, Permission, Role } from "appwrite";

const LOCAL_EXPENSES_KEY = "sakhipay_expenses";

function loadLocalExpenses() {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_EXPENSES_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLocalExpenses(expenses) {
  localStorage.setItem(LOCAL_EXPENSES_KEY, JSON.stringify(expenses));
}

function toLocalDocument(data, id = ID.unique()) {
  return {
    $id: id,
    $createdAt: new Date().toISOString(),
    ...data,
  };
}

export class Service {
  client = new Client();
  databases;
  useLocalFallback = false;

  constructor() {
    this.client
      .setEndpoint(conf.appwriteUrl)
      .setProject(conf.appwriteProjectId);
    this.databases = new Databases(this.client);
  }

  documentPermissions() {
    return [
      Permission.read(Role.any()),
      Permission.update(Role.any()),
      Permission.delete(Role.any()),
    ];
  }

  async createExpense({ userId, amount, category, description, date }) {
    const payload = { userId, amount, category, description, date };

    if (!this.useLocalFallback) {
      try {
        return await this.databases.createDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId,
          ID.unique(),
          payload,
          this.documentPermissions()
        );
      } catch (error) {
        console.warn("Appwrite createExpense failed, using local storage:", error.message);
        this.useLocalFallback = true;
      }
    }

    const doc = toLocalDocument(payload);
    const expenses = loadLocalExpenses();
    expenses.unshift(doc);
    saveLocalExpenses(expenses);
    return doc;
  }

  async updateExpense(documentId, { amount, category, description, date }) {
    const payload = { amount, category, description, date };

    if (!this.useLocalFallback) {
      try {
        return await this.databases.updateDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId,
          documentId,
          payload
        );
      } catch (error) {
        console.warn("Appwrite updateExpense failed, using local storage:", error.message);
        this.useLocalFallback = true;
      }
    }

    const expenses = loadLocalExpenses();
    const index = expenses.findIndex((e) => e.$id === documentId);
    if (index === -1) throw new Error("Expense not found");
    expenses[index] = { ...expenses[index], ...payload };
    saveLocalExpenses(expenses);
    return expenses[index];
  }

  async deleteExpense(documentId) {
    if (!this.useLocalFallback) {
      try {
        return await this.databases.deleteDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId,
          documentId
        );
      } catch (error) {
        console.warn("Appwrite deleteExpense failed, using local storage:", error.message);
        this.useLocalFallback = true;
      }
    }

    saveLocalExpenses(loadLocalExpenses().filter((e) => e.$id !== documentId));
    return true;
  }

  async getExpense(documentId) {
    if (!this.useLocalFallback) {
      try {
        return await this.databases.getDocument(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId,
          documentId
        );
      } catch (error) {
        console.warn("Appwrite getExpense failed:", error.message);
      }
    }
    return loadLocalExpenses().find((e) => e.$id === documentId) || false;
  }

  async getExpenses() {
    if (!this.useLocalFallback) {
      try {
        return await this.databases.listDocuments(
          conf.appwriteDatabaseId,
          conf.appwriteCollectionId
        );
      } catch (error) {
        console.warn("Appwrite getExpenses failed, using local storage:", error.message);
        this.useLocalFallback = true;
      }
    }

    const documents = loadLocalExpenses();
    return { total: documents.length, documents };
  }
}

const service = new Service();
export default service;
