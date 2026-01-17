# Implementation Guide: SQL Hybrid (React + .NET)

This guide provides the code patterns to implement the "Flexible SQL" approach where dynamic form data is stored as a JSON string.

---

## 1. Frontend (React + TypeScript)
**Concept**: The frontend treats the form data as a standard JSON object. It doesn't know (or care) that the backend will convert it to a string.

### **The Data Type**
```typescript
// types/index.ts
export interface Transfer {
  id: string;
  name: string;
  // This can be ANY shape because templates vary
  merTemplateData: Record<string, any>; 
}
```

### **The Service Call (Save)**
```typescript
// services/transferService.ts
export const createTransfer = async (
  name: string, 
  merTemplateData: Record<string, any> // The dynamic JSON
): Promise<void> => {
  
  const payload = {
    name: name,
    // Send it exactly as is (Object)
    merTemplateData: merTemplateData 
  };

  await axios.post('/api/v1/transfers', payload);
}
```

---

## 2. Backend API (.NET 8)
**Concept**: The API accepts a dynamic object (`object` or `JsonElement`) in the DTO, but converts it to a `string` when saving to the Database Entity.

### **Step A: The DTO (Data Transfer Object)**
This defines what the API accepts from React.
```csharp
public class CreateTransferRequest
{
    public string Name { get; set; }
    
    // Accepts any JSON structure the frontend sends
    public object MerTemplateData { get; set; } 
}
```

### **Step B: The Database Entity (EF Core)**
This defines the actual SQL table.
```csharp
public class TransferMERData
{
    [Key]
    public Guid TransferId { get; set; }

    // In SQL, this is NVARCHAR(MAX)
    public string FormDataJson { get; set; }
}
```

### **Step C: The Controller / Service Logic**
This is where the "Magic" happens: **Object ↔ String Conversion**.

```csharp
[HttpPost]
public async Task<IActionResult> CreateTransfer([FromBody] CreateTransferRequest request)
{
    // 1. Convert the Dynamic Object to a JSON String
    // We use System.Text.Json
    string jsonString = JsonSerializer.Serialize(request.MerTemplateData);

    // 2. Create the Entity
    var entity = new TransferMERData
    {
        TransferId = Guid.NewGuid(),
        FormDataJson = jsonString // Save as String
    };

    // 3. Save to SQL
    _dbContext.TransferMERData.Add(entity);
    await _dbContext.SaveChangesAsync();

    return Ok();
}

[HttpGet("{id}")]
public async Task<IActionResult> GetTransfer(Guid id)
{
    // 1. Fetch from SQL
    var entity = await _dbContext.TransferMERData.FindAsync(id);

    // 2. Convert String back to Object
    var formDataObj = JsonSerializer.Deserialize<object>(entity.FormDataJson);

    // 3. Return to User
    return Ok(new 
    { 
        TransferId = entity.TransferId,
        FormData = formDataObj // API returns proper JSON
    });
}
```

---

## 3. The Result

### **What goes into SQL:**
`{"q1":"Answer","nested":{"val":1}}` (A String)

### **What the Frontend Receives (GET):**
```json
{
  "transferId": "...",
  "formData": {
    "q1": "Answer",
    "nested": { "val": 1 }
  }
}
```

## Summary
1.  **React**: Sends/Receives standard JSON. No changes needed.
2.  **API DTO**: Uses `object` to accept any structure.
3.  **Controller**:
    *   **Input**: `Serialize(dto.Object)` → `String`
    *   **Output**: `Deserialize(db.String)` → `Object`
4.  **Database**: Stores `String` (`NVARCHAR`).
