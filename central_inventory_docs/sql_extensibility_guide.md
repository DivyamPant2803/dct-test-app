# Is SQL Extensible for New Templates?

**Short Answer:** YES! ✅
**Do you need multiple tables?** NO. ❌

You can use the **exact same table** (`TransferMERData`) for *any* type of template in the future (EUC, ROCC, Custom Forms).

## 1. The Magic of the JSON Column

Because we are storing the form data as **JSON text**, the database *does not care* what the structure is. It acts like a flexible container.

### **Scenario: You add 3 new template types**
1.  **MER-13**: Has 50 complex questions + a table.
2.  **ROCC**: Has only 5 simple text fields.
3.  **Experimental Form**: Has a nested tree structure.

### **How it looks in the Database (`TransferMERData` Table)**

| TransferId | TemplateType | FormData (NVARCHAR MAX) |
| :--- | :--- | :--- |
| **101** | `MER-13` | `{ "q1": "Answer", "table": [...] }` |
| **102** | `ROCC` | `{ "approver": "Bob", "code": "X99" }` |
| **103** | `EXP-v1` | `{ "nodeA": { "subNode": "..." } }` |

**Key Point:**
You did **NOT** change the database schema.
You did **NOT** add a new table.
You simply saved a different JSON string into the `FormData` column.

---

## 2. Dealing with "Special" Columns

Sometimes, you *do* want specific fields to be queryable (e.g., you want to filter by `Jurisdiction` for all template types).

**Solution: Hybrid Approach**
Add "Common Columns" for the stuff you always query, and keep the "Weird Stuff" in the JSON.

**Refined Table Schema:**
```sql
CREATE TABLE TransferData (
    Id UNIQUEIDENTIFIER PRIMARY KEY,
    
    -- Common fields (Fast to index & filter)
    TemplateType NVARCHAR(50),  -- 'MER', 'ROCC', 'EUC'
    Jurisdiction NVARCHAR(50),  -- 'US', 'EU'
    RiskLevel NVARCHAR(20),     -- 'High', 'Low'
    
    -- The "Extensible" part (Stores EVERYTHING else)
    FormData NVARCHAR(MAX)      -- JSON String
);
```

---

## 3. Comparison: New Table vs. Single Table

| Approach | **Single Table (Recommended)** | **Multiple Tables (One per Template)** |
| :--- | :--- | :--- |
| **Adding a new Template** | **Zero DB Changes.** Just upload the JSON schema. | **Painful.** Create table `ROCCData`, migrate code, update EF Core. |
| **Queries** | Easy: `SELECT * FROM TransferData WHERE Type='ROCC'` | Hard: `SELECT * FROM ROCCData` (Need different code for each). |
| **Maintenance** | 1 Table to optimize/backup. | 10+ Tables to manage eventually. |
| **Flexibility** | Maximum. Fields can change anytime. | Rigid. Schema changes require migrations. |

## 4. Conclusion

Using **SQL with a JSON column** is the specific pattern designed to solve this exact problem ("Extensibility without Schema Hell").

**You will definitely NOT need new tables for new templates.** You are building a *Schemaless* feature inside a Relational Database. Best of both worlds. 🚀
