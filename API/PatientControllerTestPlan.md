# PatientController Test Cases

This document outlines comprehensive test cases for all PatientController methods.

## Test Setup Requirements

To implement these tests, you need to:

1. Create a test project:
```bash
dotnet new xunit -n ClinicManager.Tests
cd ClinicManager.Tests
```

2. Add required packages:
```bash
dotnet add package Microsoft.AspNetCore.Mvc.Testing
dotnet add package Microsoft.EntityFrameworkCore.InMemory
dotnet add package Moq
dotnet add reference ../API/ClinicManager_API.csproj
```

## Test Cases for PatientController

### 1. GET /api/Patient (Pagination)

**Test Case 1.1: Get_WithPagination_ReturnsPatients**
- Setup: Add multiple patients to in-memory database
- Action: Call Get(pageNumber: 1, pageSize: 10)
- Expected: Returns list of patients within page size

**Test Case 1.2: Get_WithPageSize_RespectsPageSize**
- Setup: Add 5 patients, request page size 3
- Action: Call Get(pageNumber: 1, pageSize: 3)
- Expected: Returns exactly 3 patients

**Test Case 1.3: Get_WithSecondPage_ReturnsCorrectPatients**
- Setup: Add 5 patients, request second page with size 3
- Action: Call Get(pageNumber: 2, pageSize: 3)
- Expected: Returns remaining 2 patients

### 2. GET /api/Patient/{id}

**Test Case 2.1: Get_WithValidId_ReturnsPatientWithRelatedData**
- Setup: Add patient with related data to database
- Action: Call Get(validId)
- Expected: Returns patient with appointments, reports, and treatment details

**Test Case 2.2: Get_WithInvalidId_ReturnsNotFound**
- Setup: Empty database
- Action: Call Get(999)
- Expected: Returns NotFound result

### 3. GET /api/Patient/Complete/{id}

**Test Case 3.1: GetComplete_WithValidId_ReturnsUserWithPatientDetails**
- Setup: Add user, patient, address, and contact to database
- Action: Call GetComplete(validId)
- Expected: Returns user with complete patient information including address and contact

**Test Case 3.2: GetComplete_WithInvalidId_ReturnsNotFound**
- Setup: Empty database
- Action: Call GetComplete(999)
- Expected: Returns NotFound result

### 4. POST /api/Patient

**Test Case 4.1: Post_WithValidPatient_ReturnsCreatedAtAction**
- Setup: Valid patient object
- Action: Call Post(patient)
- Expected: Returns CreatedAtAction with created patient

**Test Case 4.2: Post_WithPatientReports_CreatesPatientWithReports**
- Setup: Patient with PatientReports collection
- Action: Call Post(patient)
- Expected: Creates patient and all associated reports

**Test Case 4.3: Post_WithPatientAppointmentsAndTreatment_CreatesAllRelatedData**
- Setup: Patient with appointments, treatment, and treatment details
- Action: Call Post(patient)
- Expected: Creates patient and all related entities in transaction

**Test Case 4.4: Post_WithInvalidData_RollsBackTransaction**
- Setup: Patient with invalid related data that causes exception
- Action: Call Post(patient)
- Expected: Returns 500 error and rolls back transaction

### 5. PUT /api/Patient/{id}

**Test Case 5.1: Put_WithValidIdAndPatient_ReturnsNoContent**
- Setup: Existing patient in database
- Action: Call Put(id, updatedPatient)
- Expected: Returns NoContent and updates patient

**Test Case 5.2: Put_WithMismatchedId_ReturnsBadRequest**
- Setup: Patient object with different ID than route parameter
- Action: Call Put(1, patientWithId2)
- Expected: Returns BadRequest

### 6. PATCH /api/Patient/{id}

**Test Case 6.1: Patch_WithValidIdAndPatchDoc_ReturnsNoContent**
- Setup: Existing patient, JsonPatchDocument for allergies field
- Action: Call Patch(id, patchDoc)
- Expected: Returns NoContent and applies patch

**Test Case 6.2: Patch_WithInvalidId_ReturnsNotFound**
- Setup: JsonPatchDocument for non-existent patient
- Action: Call Patch(999, patchDoc)
- Expected: Returns NotFound

### 7. DELETE /api/Patient/{id}

**Test Case 7.1: Delete_WithValidId_ReturnsNoContent**
- Setup: Existing patient in database
- Action: Call Delete(validId)
- Expected: Returns NoContent and removes patient

**Test Case 7.2: Delete_WithInvalidId_ReturnsNotFound**
- Setup: Empty database
- Action: Call Delete(999)
- Expected: Returns NotFound

## Sample Test Implementation

```csharp
using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ClinicManager.Controllers;
using ClinicManager.Models;
using ClinicManager.DAL;
using Microsoft.AspNetCore.JsonPatch;

namespace ClinicManager.Tests
{
    public class PatientControllerTests
    {
        private readonly Mock<ILogger<PatientController>> _mockLogger;
        private readonly DbContextOptions<ClinicDbContext> _dbOptions;

        public PatientControllerTests()
        {
            _mockLogger = new Mock<ILogger<PatientController>>();
            _dbOptions = new DbContextOptionsBuilder<ClinicDbContext>()
                .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString())
                .Options;
        }

        private ClinicDbContext GetInMemoryContext()
        {
            return new ClinicDbContext(_dbOptions);
        }

        [Fact]
        public async Task Get_WithValidId_ReturnsPatient()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var patient = new Patient
            {
                ID = 1,
                UserID = 1,
                Allergies = "None",
                IsActive = true,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now,
                CreatedBy = 1,
                ModifiedBy = 1
            };
            context.Patients.Add(patient);
            await context.SaveChangesAsync();

            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Get(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Patient>>(result);
            var returnedPatient = Assert.IsType<Patient>(actionResult.Value);
            Assert.Equal(1, returnedPatient.ID);
        }

        // Additional test methods following the same pattern...
    }
}
```

## Integration Test Considerations

- Use TestServer for full HTTP pipeline testing
- Test authentication and authorization
- Test database transactions and rollback scenarios
- Test error handling and logging
- Verify all HTTP status codes are returned correctly

## Coverage Goals

- Achieve 100% code coverage for PatientController
- Test all success and failure paths
- Verify all edge cases and boundary conditions
- Test transaction behavior and data consistency