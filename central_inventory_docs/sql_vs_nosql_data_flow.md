# Data Flow Comparison: SQL vs NoSQL for MER Data

This document explains how `TransferMERData` travels from the database to your UI in both scenarios, and how the UI consumes it.

## 1. The Data Flow

### **Option A: SQL (Current Choice)**
**Storage**: `NVARCHAR(MAX)` column containing a JSON string.

1.  **Database**: Stores `"{ 'appId': '123', 'owner': 'John' }"` as a simple **string**.
2.  **Backend (C#)**:
    *   Fetches the string from SQL.
    *   **Action**: Must parse/deserialize the string into a C# object.
    *   `var data = JsonSerializer.Deserialize<MerData>(sqlRow.FormData);`
3.  **API Response**: Sends standard JSON.
4.  **UI**: Receives standard JSON.

### **Option B: NoSQL (Cosmos DB)**
**Storage**: Native JSON document.

1.  **Database**: Stores `{ "id": "...", "appId": "123" }` as a **document**.
2.  **Backend (C#)**:
    *   Fetches the document via SDK.
    *   **Action**: SDK automatically maps it to a C# object (no manual string parsing).
3.  **API Response**: Sends standard JSON.
4.  **UI**: Receives standard JSON.

---

## 2. Impact on UI & Template Population

**Good News:** The difference is **100% invisible to the UI**.

In both cases, your API will return the exact same JSON structure to the React frontend.

**API Response (Identical for both):**
```json
{
  "transferId": "guid-123",
  "status": "PENDING",
  "merTemplateData": {
    "appId": "SWC-123456",
    "appName": "Payment Gateway",
    "dataClassification": "Confidential",
    "hosting": "Azure"
  }
}
```

**Populating the Record (React Code):**
The code to populate your `DynamicTemplateForm` remains exactly the same:

```typescript
// 1. Fetch from API
const transfer = await transferService.getById(id);

// 2. Pass to Component
return (
  <DynamicTemplateForm 
    templateId={transfer.templateId}
    // The UI doesn't care if this came from SQL or NoSQL
    initialData={transfer.merTemplateData} 
  />
);
```

---

## 3. Which is Easier?

### **Winner: SQL (Hybrid Approach)** 🏆

**Why?**
1.  **Infrastructure Simplicity**: You only manage **one database** (SQL Server). You don't need to provision, secure, and pay for a separate Cosmos DB instance just for this one feature.
2.  **Data Integrity**: You can use Foreign Keys. `TransferMERData` is strictly linked to `Transfers` table via `TransferId`. If you delete a Transfer, the MER data is automatically deleted (Cascade Delete). This is much harder to do with NoSQL.
3.  **Cost**: Azure SQL is generally cheaper for this volume than getting a dedicated Cosmos DB throughput.

**The "Cost" of SQL:**
*   **Minor Dev Effort**: You have to write 1 line of code in the backend to serialize/deserialize the JSON string.
    *   *Save*: `row.FormData = JsonSerializer.Serialize(data);`
    *   *Load*: `data = JsonSerializer.Deserialize(row.FormData);`

**Conclusion:**
Stick with **SQL**. The "complexity" of deserializing a string is negligible compared to the complexity of maintaining a second database system.
