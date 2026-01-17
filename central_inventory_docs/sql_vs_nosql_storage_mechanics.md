# Saving User Input: SQL vs NoSQL Comparison

This document explains exactly happens when a user clicks "Submit" on the frontend, and how that data lands in the database.

## 1. The Scenario
The user fills out the dynamic MER form on the UI.
**Frontend Payload (POST /api/v1/transfers):**
```json
{
  "name": "My Transfer",
  "formData": {
    "q1": "Answer 1",
    "q2_nested": { "sub_q": "value" },
    "q3_table": [ { "row": 1 }, { "row": 2 } ]
  }
}
```

---

## 2. How it's Stored

### **Option A: SQL (Recommended)**
**Mechanism**: Serialization to String

1.  **API Controller**: Receives the JSON payload.
2.  **Service Layer**: Creates a new `Transfer` entity.
3.  **Data Processing**:
    *   Takes the `formData` object (which is dynamic/complex).
    *   Converts it to a string: `string jsonString = JsonSerializer.Serialize(request.FnromData);`
4.  **Database Save**:
    *   Executes `INSERT INTO TransferMERData (TransferId, FormData) VALUES (123, '{ "q1": ... }')`
    *   The `FormData` column is type `NVARCHAR(MAX)` (it holds text).

### **Option B: NoSQL (Cosmos DB)**
**Mechanism**: Native Document Storage

1.  **API Controller**: Receives the JSON payload.
2.  **Service Layer**: Creates a new `Transfer` entity AND a `TransferData` document.
3.  **Data Processing**:
    *   Keeps the `formData` as an object.
4.  **Database Save**:
    *   Approaches the Cosmos SDK.
    *   Sends the object directly: `await container.CreateItemAsync(merDataObject);`
    *   Cosmos stores it as a native JSON document.

---

## 3. Which is Better for YOU?

### **Detailed Comparison**

| Feature | SQL (JSON Column) | NoSQL (Cosmos DB) | Why it matters |
| :--- | :--- | :--- | :--- |
| **Simplicity** | ✅ **High** | ❌ Medium | Managing 1 DB is easier than 2. |
| **Transactions** | ✅ **Atomicity** | ❌ Complex | If saving the *Transfer* fails, the *Form Data* shouldn't be saved. SQL handles this perfectly in one transaction. NoSQL requires a "Two-Phase Commit" (harder). |
| **Validation** | ⚠️ None (it's verified text) | ✅ Basic Schema | Validation should happen in your Code/Service layer anyway, so DB validation is less critical. |
| **Querying** | ⚠️ Slower for deep search | ✅ Fast | Are you searching *inside* the answers? (e.g., "Find all transfers where Q3='Yes'"). If rarely, SQL is fine. |
| **Referential Integrity** | ✅ **Foreign Keys** | ❌ None | If you delete a user, SQL auto-deletes their drafts. NoSQL leaves "orphan" data unless you code cleanup manually. |

### **Verdict: SQL is Better 🏆**

**Reason 1: Transactionality (The "Saver")**
When a user submits, you are saving 3 things at once:
1.  The Transfer record (`Transfers` table)
2.  The Requirements list (`Requirements` table)
3.  The Form Data (`TransferMERData`)

In SQL, if *any* of these fail, everything rolls back. The user gets an error, and your DB stays clean.
In a hybrid (SQL + NoSQL) setup, you might successfully save the SQL part but fail the NoSQL part, leaving you with a broken record.

**Reason 2: Relationships**
Your form data belongs to a Transfer. SQL enforces this relationship natively. NoSQL does not.

**Recommendation:**
Use **SQL**. Dealing with `JsonSerializer.Serialize()` is a tiny price to pay for the safety, consistency, and simplicity of a single relational database.
