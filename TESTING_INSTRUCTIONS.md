# Testing Instructions: Verify Treatment Details Are Saved

## Setup
1. Deploy the updated code
2. Ensure database is running and connection string is correct
3. Start the API

---

## Test 1: Create Patient with Treatment and Details (API Request)

### Request
```http
POST /api/patient
Content-Type: application/json
Authorization: Bearer {your_jwt_token}

{
  "UserID": 1,
  "Allergies": "Penicillin",
  "Medications": "Aspirin",
  "FatherMedicalHistory": "Heart disease",
  "MotherMedicalHistory": "Diabetes",
  "PersonalMedicalHistory": "Dental anxiety",
  "InsuranceProvider": "Acme Insurance",
  "InsurancePolicyNumber": "POL-2025-001",
  "PatientTreatment": {
    "ChiefComplaint": "Severe tooth pain in molar",
    "ClinicalFindings": "Decayed tooth with visible cavity",
    "Diagnosis": "Dental caries on tooth #14",
    "TreatmentPlan": "Root canal followed by crown",
    "Prescription": "Amoxicillin 500mg 3x daily for 7 days",
    "EstimatedCost": 800.00,
    "ActualCost": 0,
    "PatientTreatmentDetails": [
      {
        "Tooth": "Tooth #14 (Molar)",
        "Procedure": "Root Canal Treatment",
        "Prescription": "Local anesthesia",
        "TreatmentDate": "2025-01-16T14:00:00",
        "FollowUpInstructions": "Avoid chewing on treated side for 24 hours",
        "FollowUpDate": "2025-01-23",
        "ProcedureTreatmentCost": 500.00
      },
      {
        "Tooth": "Tooth #14 (Molar)",
        "Procedure": "Crown Placement",
        "Prescription": "Temporary crown",
        "TreatmentDate": "2025-01-30T14:00:00",
        "FollowUpInstructions": "Avoid hard foods for 48 hours",
        "FollowUpDate": "2025-02-06",
        "ProcedureTreatmentCost": 300.00
      }
    ]
  }
}
```

### Expected Response
```json
{
  "ID": 1,
  "UserID": 1,
  "Allergies": "Penicillin",
  "CreatedDate": "2025-01-16T10:30:00",
  "ModifiedDate": "2025-01-16T10:30:00",
  "CreatedBy": 1,
  "ModifiedBy": 1,
  "IsActive": 1,
  "PatientTreatment": {
    "ID": 101,
    "PatientID": 1,
    "ChiefComplaint": "Severe tooth pain in molar",
    "PatientTreatmentDetails": [
      {
        "ID": 201,
        "PatientTreatmentID": 101,
        "PatientID": 1,
        "Tooth": "Tooth #14 (Molar)",
        "Procedure": "Root Canal Treatment",
        "CreatedDate": "2025-01-16T10:30:00"
      },
      {
        "ID": 202,
        "PatientTreatmentID": 101,
        "PatientID": 1,
        "Tooth": "Tooth #14 (Molar)",
        "Procedure": "Crown Placement",
        "CreatedDate": "2025-01-16T10:30:00"
      }
    ]
  }
}
```

### What to Check ?
- [ ] Response status is 201 Created
- [ ] PatientTreatment.ID is populated (e.g., 101)
- [ ] PatientTreatmentDetails array has 2 records
- [ ] Each detail has:
  - [ ] ID is populated (e.g., 201, 202)
  - [ ] PatientTreatmentID matches treatment ID (101)
  - [ ] PatientID matches patient ID (1)

---

## Test 2: Verify Data in Database

### Query 1: Check Patient Record
```sql
SELECT ID, UserID, Allergies, IsActive, CreatedDate
FROM patient
WHERE ID = 1;
```

**Expected:**
```
ID | UserID | Allergies | IsActive | CreatedDate
1  | 1      | Penicillin| 1        | 2025-01-16 10:30:00
```

### Query 2: Check Treatment Record
```sql
SELECT ID, PatientID, ChiefComplaint, Diagnosis, IsActive, CreatedDate
FROM patienttreatment
WHERE PatientID = 1;
```

**Expected:**
```
ID | PatientID | ChiefComplaint                    | Diagnosis              | IsActive | CreatedDate
101| 1         | Severe tooth pain in molar        | Dental caries on t...  | 1        | 2025-01-16 10:30:00
```

### Query 3: Check Treatment Details Records (CRITICAL)
```sql
SELECT ID, PatientTreatmentID, PatientID, Tooth, Procedure, IsActive, CreatedDate
FROM patienttreatmentdetail
WHERE PatientTreatmentID = 101;
```

**Expected:**
```
ID | PatientTreatmentID | PatientID | Tooth               | Procedure           | IsActive | CreatedDate
201| 101                | 1         | Tooth #14 (Molar)   | Root Canal Treatment| 1        | 2025-01-16 10:30:00
202| 101                | 1         | Tooth #14 (Molar)   | Crown Placement     | 1        | 2025-01-16 10:30:00
```

### What to Check ?
- [ ] Patient record exists
- [ ] PatientTreatment record exists with PatientID = 1
- [ ] **PatientTreatmentDetail records exist (this was missing before)**
- [ ] PatientTreatmentID values are correct (match treatment ID)
- [ ] PatientID values are correct (match patient ID)
- [ ] IsActive = 1 for all records

---

## Test 3: Retrieve Patient and Verify Nested Data

### Request
```http
GET /api/patient/1
Authorization: Bearer {your_jwt_token}
```

### Expected Response Structure
```json
{
  "ID": 1,
  "UserID": 1,
  "Allergies": "Penicillin",
  "PatientTreatment": {
    "ID": 101,
    "PatientID": 1,
    "ChiefComplaint": "Severe tooth pain in molar",
    "PatientTreatmentDetails": [
      {
        "ID": 201,
        "PatientTreatmentID": 101,
        "PatientID": 1,
        "Tooth": "Tooth #14 (Molar)",
        "Procedure": "Root Canal Treatment"
      },
      {
        "ID": 202,
        "PatientTreatmentID": 101,
        "PatientID": 1,
        "Tooth": "Tooth #14 (Molar)",
        "Procedure": "Crown Placement"
      }
    ]
  },
  "PatientAppointments": [],
  "PatientReports": [],
  "PatientVitals": []
}
```

### What to Check ?
- [ ] Response includes PatientTreatment object
- [ ] PatientTreatment includes PatientTreatmentDetails array
- [ ] Array has 2 detail records
- [ ] All IDs and ForeignKeys are correct

---

## Test 4: Test Update Scenario

### Request
```http
PUT /api/patient/1
Content-Type: application/json
Authorization: Bearer {your_jwt_token}

{
  "ID": 1,
  "UserID": 1,
  "Allergies": "Penicillin, Ibuprofen",
  "PatientTreatment": {
    "ID": 101,
    "PatientID": 1,
    "ChiefComplaint": "Severe tooth pain in molar",
    "PatientTreatmentDetails": [
      {
        "ID": 201,
        "PatientTreatmentID": 101,
        "PatientID": 1,
        "Tooth": "Tooth #14 (Molar)",
        "Procedure": "Root Canal Treatment",
        "TreatmentDate": "2025-01-20T14:00:00"
      },
      {
        "ID": 202,
        "PatientTreatmentID": 101,
        "PatientID": 1,
        "Tooth": "Tooth #14 (Molar)",
        "Procedure": "Crown Placement",
        "TreatmentDate": "2025-01-30T14:00:00"
      },
      {
        "ID": 0,
        "PatientTreatmentID": 0,
        "PatientID": 0,
        "Tooth": "Tooth #2 (Incisor)",
        "Procedure": "Cleaning",
        "TreatmentDate": "2025-02-15T10:00:00"
      }
    ]
  }
}
```

### Expected Result
- [ ] Existing details (ID 201, 202) are updated
- [ ] New detail (ID 0) is inserted with auto-generated ID
- [ ] All details have correct PatientTreatmentID and PatientID

---

## Test 5: Verify Cascade Delete Works

### Request
```http
DELETE /api/patient/1
Authorization: Bearer {your_jwt_token}
```

### Verify in Database
```sql
-- After soft delete, IsActive should be 0
SELECT ID, IsActive FROM patient WHERE ID = 1;
SELECT ID, IsActive FROM patienttreatment WHERE PatientID = 1;
SELECT ID, IsActive FROM patienttreatmentdetail WHERE PatientTreatmentID IN (
  SELECT ID FROM patienttreatment WHERE PatientID = 1
);
```

**Expected:**
```
-- All records have IsActive = 0
```

---

## Troubleshooting

### Symptom: Details still not saved
1. Check database logs for FK constraint violations
2. Verify OnModelCreating was called (no syntax errors)
3. Run `dotnet ef migrations add TestFix` to see if any model changes are needed
4. Check that PatientTreatmentID is NOT being set to null in controller

### Symptom: JSON serialization errors
1. Verify ReferenceHandler.IgnoreCycles is set in Program.cs
2. Verify MaxDepth = 8 or higher
3. Test with Postman/curl to isolate API issues

### Symptom: Foreign key constraint errors in database
1. Verify relationships exist in database schema
2. Run migration: `dotnet ef database update`
3. Check FK column type matches PK column type (both INT)

---

## Success Criteria

All tests pass when:
- ? Create patient with nested treatment details
- ? All records are in database with correct FK values
- ? Retrieve patient shows complete nested structure
- ? Update patient with new/modified details
- ? Cascade behaviors work correctly

---

## Files Modified
1. `API\Models\PatientTreatmentDetail.cs` - Added [ForeignKey] attributes
2. `API\DAL\ClinicDbContext.cs` - Added OnModelCreating relationship config
3. `API\Controllers\PatientController.cs` - Fixed Post method, added two-phase save

## Build Status
? **Build Successful** - Ready for testing
