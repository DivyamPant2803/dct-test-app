# Reporting: Escalations & End User Transfers

**Great News!** Reporting on Escalations and Transfers is actually the **easiest part** of the system.

Why? **Because they are NOT in the JSON.**

In our `database_schema.md`, we defined `Transfers` and `Evidence` as standard Structured SQL tables. This means all the "Logic" fields (Status, Who, When, Escalated To) are real columns, not hidden inside the dynamic form data.

---

## 1. How the Data is Structured

### **Transfers Table** (Simplified)
| TransferId | Name | **Status** | **CreatedBy** | **EscalatedTo** | **EscalatedAt** |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 101 | App A | `PENDING` | User1 | NULL | NULL |
| 102 | App B | `ESCALATED` | User2 | `Legal` | 2026-01-15 |
| 103 | App C | `ESCALATED` | User3 | `Business` | 2026-01-16 |

### **Evidence Table** (Simplified)
| EvidenceId | TransferId | Filename | **Status** | **EscalatedTo** |
| :--- | :--- | :--- | :--- | :--- |
| 501 | 102 | Arch.pdf | `ESCALATED` | `Legal` |

---

## 2. Reporting Scenarios (Native SQL)

Because these are real columns, your reporting tools (PowerBI, Excel, Tableau) can query them directly without any special views or JSON parsing.

### **Scenario A: "Show me the Legal Escalation Queue"**
*Used for: Legal Dashboard*
```sql
SELECT * 
FROM Transfers 
WHERE Status = 'ESCALATED' 
  AND EscalatedTo = 'Legal';
```

### **Scenario B: "Show me all Transfers for User JohnDoe"**
*Used for: End User Dashboard*
```sql
SELECT Name, Status, CreatedAt 
FROM Transfers 
WHERE CreatedBy = 'JohnDoe';
```

### **Scenario C: "SLA Breaches Report"**
*Used for: Admin Dashboard*
```sql
SELECT T.Name, T.EscalatedTo, S.DaysRemaining
FROM Transfers T
JOIN SLATracking S ON T.TransferId = S.TransferId
WHERE S.Status = 'BREACHED';
```

---

## 3. The Power of "Hybrid" Reporting

The real power comes when you combine the **Standard Columns** (Escalation Status) with the **JSON Data** (Risk Answers).

**Example: "Show me Escalations... but only for High Risk apps"**
You can JOIN the standard table with the JSON View we discussed in the previous step.

```sql
SELECT 
    T.Name, 
    T.EscalatedTo,       -- Standard Column
    R.RiskScore          -- From JSON View
FROM Transfers T
JOIN vw_Report_MER13 R ON T.TransferId = R.TransferId
WHERE 
    T.Status = 'ESCALATED' 
    AND R.RiskScore = 'High';
```

## 4. Summary

| Data Type | Where is it? | Reporting Difficulty |
| :--- | :--- | :--- |
| **Escalation Status** | Standard Column | **Super Easy (Native)** |
| **Whose Transfer?** | Standard Column | **Super Easy (Native)** |
| **Dates/SLAs** | Standard Column | **Super Easy (Native)** |
| **Template Answers** | JSON Column | **Easy (Via Views)** |

Your decision to use SQL makes these core dashboards (Legal, Business, User) **extremely fast and simple** to build.
