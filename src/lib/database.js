import { databases } from './appwrite';
import { ID, Query } from 'appwrite'; // Make sure to import ID

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;

/**
 * Database service for ExpenseTracker
 */
export const db = {
  /**
   * List documents with optional queries for filtering
   */
  async listDocuments(collectionId, queries = []) {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        queries
      );
      return {
        success: true,
        documents: result.documents,
        total: result.total
      };
    } catch (error) {
      console.error('Error listing documents:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get user's document ID from users table by username
   */
  async getUserDocumentId(username) {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        'users',
        []
      );

      const user = result.documents.find(doc => doc.username === username);

      if (user) {
        return {
          success: true,
          documentId: user.$id,
          userData: user
        };
      } else {
        return {
          success: false,
          error: 'User not found'
        };
      }
    } catch (error) {
      console.error('Error getting user document ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get a sample document from a collection to inspect schema
   */
  async getCollectionSchema(collectionId) {
    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        []
      );

      if (result.documents.length > 0) {
        return {
          success: true,
          sampleDocument: result.documents[0],
          columns: Object.keys(result.documents[0]).filter(key => !key.startsWith('$'))
        };
      } else {
        return {
          success: false,
          message: 'No documents found in collection'
        };
      }
    } catch (error) {
      console.error('Error fetching collection schema:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Test database connection
   */
  async testConnection(userId) {
    try {
      console.log('Testing database connection...');
      console.log('Database ID:', DATABASE_ID);
      console.log('User ID:', userId);

      if (!DATABASE_ID) {
        throw new Error('Database ID is not configured');
      }

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Try to find user in the users collection
      const usersCollectionId = 'users';

      try {
        // Query for the user by userid field
        const result = await databases.listDocuments(
          DATABASE_ID,
          usersCollectionId,
          [
            // Filter by username column
          ]
        );

        // Find the user with matching username
        const user = result.documents.find(doc =>
          doc.username === userId
        );

        if (user) {
          console.log('✅ User found in database:', user);
          return {
            success: true,
            message: 'User found in database',
            userData: user,
            databaseId: DATABASE_ID
          };
        } else {
          console.log('⚠️ User not found in database');
          return {
            success: true,
            message: 'Database connected but user not found',
            allUsers: result.documents.length,
            databaseId: DATABASE_ID
          };
        }
      } catch (error) {
        console.error('Error querying users collection:', error);
        return {
          success: false,
          error: `Failed to query users collection: ${error.message}`
        };
      }
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },



  /**
   * List documents in a collection
   */
  async listDocuments(collectionId, queries = []) {
    try {
      const documents = await databases.listDocuments(
        DATABASE_ID,
        collectionId,
        queries
      );
      return { success: true, documents: documents.documents, total: documents.total };
    } catch (error) {
      console.error('Error listing documents:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Generate a unique document ID
   * Combines timestamp with random string to ensure uniqueness
   */
  generateUniqueId() {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${randomPart}`;
  },

  /**
   * Create a document
   */
  async createDocument(collectionId, data) {
    try {
      const document = await databases.createDocument(
        DATABASE_ID,      // Your Database ID
        collectionId,     // The Collection ID
        ID.unique(),      // Let Appwrite generate a unique ID
        data              // The document data
      );
      return { success: true, document };
    } catch (error) {
      console.error("Failed to create document:", error);
      return { success: false, error };
    }
  },

  /**
   * Get a document
   */
  async getDocument(collectionId, documentId) {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        collectionId,
        documentId
      );
      return { success: true, document };
    } catch (error) {
      console.error('Error getting document:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Update a document
   */
  async updateDocument(collectionId, documentId, data) {
    try {
      const document = await databases.updateDocument(
        DATABASE_ID,
        collectionId,
        documentId,
        data
      );
      return { success: true, document };
    } catch (error) {
      console.error('Error updating document:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete a document
   */
  async deleteDocument(collectionId, documentId) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        collectionId,
        documentId
      );
      return { success: true };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete all data associated with a user
   */
  async deleteUserData(userId) {
    try {
      console.log(`Starting data deletion for user: ${userId}`);

      // 1. Delete Transactions
      const transactions = await this.listDocuments('transactions', [
        Query.equal('users', userId),
        Query.limit(1000)
      ]);

      console.log(`Found ${transactions.total} transactions to delete`);
      for (const t of transactions.documents) {
        await this.deleteDocument('transactions', t.$id);
      }

      // 2. Delete Accounts
      const accounts = await this.listDocuments('accounts', [
        Query.equal('user_id', userId),
        Query.limit(1000)
      ]);

      console.log(`Found ${accounts.total} accounts to delete`);
      for (const a of accounts.documents) {
        await this.deleteDocument('accounts', a.$id);
      }

      // 3. Delete Categories
      const categories = await this.listDocuments('categories', [
        Query.equal('user_id', userId),
        Query.limit(1000)
      ]);

      console.log(`Found ${categories.total} categories to delete`);
      for (const c of categories.documents) {
        await this.deleteDocument('categories', c.$id);
      }

      // 4. Delete User Profile
      const userDoc = await this.getUserDocumentId(userId);
      if (userDoc.success) {
        console.log(`Deleting user profile: ${userDoc.documentId}`);
        await this.deleteDocument('users', userDoc.documentId);
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return { success: false, error: error.message };
    }
  }
};

export default db;
export { DATABASE_ID };
