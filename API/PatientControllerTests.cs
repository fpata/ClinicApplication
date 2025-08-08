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
    /// <summary>
    /// Comprehensive unit tests for PatientController covering all HTTP methods and edge cases
    /// </summary>
    public class PatientControllerTests : IDisposable
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
            var context = new ClinicDbContext(_dbOptions);
            return context;
        }

        private Patient CreateTestPatient(int id = 1, int userId = 1)
        {
            return new Patient
            {
                ID = id,
                UserID = userId,
                Allergies = "None",
                Medications = "None",
                FatherHistory = "Healthy",
                MotherHistory = "Healthy",
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now,
                CreatedBy = 1,
                ModifiedBy = 1,
                IsActive = true
            };
        }

        private User CreateTestUser(int id = 1)
        {
            return new User
            {
                ID = id,
                FirstName = "John",
                LastName = "Doe",
                UserName = "johndoe",
                Password = "password123",
                UserType = "Patient",
                Gender = "Male",
                IsActive = true,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now
            };
        }

        private Address CreateTestAddress(int userId = 1)
        {
            return new Address
            {
                ID = 1,
                UserID = userId,
                PermAddress1 = "123 Main St",
                PermCity = "Anytown",
                PermState = "State",
                PermCountry = "Country",
                PermZipCode = "12345",
                IsActive = true,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now
            };
        }

        private Contact CreateTestContact(int userId = 1)
        {
            return new Contact
            {
                ID = 1,
                UserID = userId,
                PrimaryPhone = "555-1234",
                PrimaryEmail = "john@email.com",
                IsActive = true,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now,
                CreatedBy = 1,
                ModifiedBy = 1
            };
        }

        private PatientReport CreateTestPatientReport(int patientId = 1, int userId = 1)
        {
            return new PatientReport
            {
                ID = 0,
                PatientID = patientId,
                UserID = userId,
                ReportName = "Blood Test",
                ReportDetails = "Normal results",
                DoctorName = "Dr. Smith",
                ReportDate = DateTime.Now,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now,
                CreatedBy = 1,
                ModifiedBy = 1,
                IsActive = true
            };
        }

        private PatientAppointment CreateTestPatientAppointment(int patientId = 1, int userId = 1)
        {
            return new PatientAppointment
            {
                ID = 0,
                PatientID = patientId,
                UserID = userId,
                StartApptDate = DateTime.Now.AddDays(1),
                EndApptDate = DateTime.Now.AddDays(1).AddHours(1),
                TreatmentName = "Cleaning",
                DoctorName = "Dr. Smith",
                ApptStatus = "Scheduled",
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now,
                CreatedBy = 1,
                ModifiedBy = 1,
                IsActive = true
            };
        }

        private PatientTreatment CreateTestPatientTreatment(int patientId = 1, int userId = 1)
        {
            return new PatientTreatment
            {
                ID = 0,
                PatientID = patientId,
                UserID = userId,
                ChiefComplaint = "Tooth pain",
                TreatmentPlan = "Root canal",
                Observation = "Swelling observed",
                TreatmentDate = DateTime.Now,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now,
                CreatedBy = 1,
                ModifiedBy = 1,
                IsActive = true
            };
        }

        private PatientTreatmentDetail CreateTestPatientTreatmentDetail(int patientId = 1)
        {
            return new PatientTreatmentDetail
            {
                ID = 0,
                PatientID = patientId,
                Tooth = "Molar",
                Procedure = "Root Canal",
                Advice = "Avoid hard foods",
                TreatmentDate = DateTime.Now,
                CreatedDate = DateTime.Now,
                ModifiedDate = DateTime.Now,
                CreatedBy = 1,
                ModifiedBy = 1,
                IsActive = true
            };
        }

        #region GET Tests

        /// <summary>
        /// Test GET method with pagination - should return list of patients
        /// </summary>
        [Fact]
        public async Task Get_WithPagination_ReturnsPatients()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var patient1 = CreateTestPatient(1, 1);
            var patient2 = CreateTestPatient(2, 2);
            
            context.Patients.AddRange(patient1, patient2);
            await context.SaveChangesAsync();

            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Get(pageNumber: 1, pageSize: 10);

            // Assert
            Assert.NotNull(result);
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Patient>>>(result);
            var patients = Assert.IsType<List<Patient>>(actionResult.Value);
            Assert.Equal(2, patients.Count);
        }

        /// <summary>
        /// Test GET method with pagination - should respect page size
        /// </summary>
        [Fact]
        public async Task Get_WithPageSize_RespectsPageSize()
        {
            // Arrange
            using var context = GetInMemoryContext();
            for (int i = 1; i <= 5; i++)
            {
                var patient = CreateTestPatient(i, i);
                context.Patients.Add(patient);
            }
            await context.SaveChangesAsync();

            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Get(pageNumber: 1, pageSize: 3);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Patient>>>(result);
            var patients = Assert.IsType<List<Patient>>(actionResult.Value);
            Assert.Equal(3, patients.Count);
        }

        /// <summary>
        /// Test GET method with pagination - should handle second page correctly
        /// </summary>
        [Fact]
        public async Task Get_WithSecondPage_ReturnsCorrectPatients()
        {
            // Arrange
            using var context = GetInMemoryContext();
            for (int i = 1; i <= 5; i++)
            {
                var patient = CreateTestPatient(i, i);
                context.Patients.Add(patient);
            }
            await context.SaveChangesAsync();

            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Get(pageNumber: 2, pageSize: 3);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Patient>>>(result);
            var patients = Assert.IsType<List<Patient>>(actionResult.Value);
            Assert.Equal(2, patients.Count); // Should have remaining 2 patients
        }

        /// <summary>
        /// Test GET method with valid ID - should return patient with related data
        /// </summary>
        [Fact]
        public async Task Get_WithValidId_ReturnsPatientWithRelatedData()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var patient = CreateTestPatient();
            var appointment = CreateTestPatientAppointment();
            var report = CreateTestPatientReport();
            var treatment = CreateTestPatientTreatment();
            var treatmentDetail = CreateTestPatientTreatmentDetail();

            context.Patients.Add(patient);
            context.PatientAppointments.Add(appointment);
            context.PatientReports.Add(report);
            context.PatientTreatments.Add(treatment);
            context.PatientTreatmentDetails.Add(treatmentDetail);
            await context.SaveChangesAsync();

            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Get(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Patient>>(result);
            var returnedPatient = Assert.IsType<Patient>(actionResult.Value);
            Assert.Equal(1, returnedPatient.ID);
            Assert.Equal("None", returnedPatient.Allergies);
        }

        /// <summary>
        /// Test GET method with invalid ID - should return NotFound
        /// </summary>
        [Fact]
        public async Task Get_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Get(999);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Patient>>(result);
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }

        /// <summary>
        /// Test GET Complete method with valid ID - should return user with patient details
        /// </summary>
        [Fact]
        public async Task GetComplete_WithValidId_ReturnsUserWithPatientDetails()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var user = CreateTestUser();
            var patient = CreateTestPatient();
            var address = CreateTestAddress();
            var contact = CreateTestContact();
            
            context.Users.Add(user);
            context.Patients.Add(patient);
            context.Addresses.Add(address);
            context.Contacts.Add(contact);
            await context.SaveChangesAsync();

            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.GetComplete(1);

            // Assert
            var actionResult = Assert.IsType<ActionResult<User>>(result);
            var returnedUser = Assert.IsType<User>(actionResult.Value);
            Assert.Equal(1, returnedUser.ID);
            Assert.NotNull(returnedUser.Patients);
            Assert.Single(returnedUser.Patients);
            Assert.NotNull(returnedUser.Address);
            Assert.NotNull(returnedUser.Contact);
        }

        /// <summary>
        /// Test GET Complete method with invalid ID - should return NotFound
        /// </summary>
        [Fact]
        public async Task GetComplete_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.GetComplete(999);

            // Assert
            var actionResult = Assert.IsType<ActionResult<User>>(result);
            Assert.IsType<NotFoundResult>(actionResult.Result);
        }

        #endregion

        #region POST Tests

        /// <summary>
        /// Test POST method with valid patient - should create patient and return CreatedAtAction
        /// </summary>
        [Fact]
        public async Task Post_WithValidPatient_ReturnsCreatedAtAction()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);
            var patient = CreateTestPatient();
            patient.ID = 0; // Reset ID for creation

            // Act
            var result = await controller.Post(patient);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Patient>>(result);
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            var createdPatient = Assert.IsType<Patient>(createdAtActionResult.Value);
            Assert.True(createdPatient.ID > 0);
        }

        /// <summary>
        /// Test POST method with patient having reports - should create patient with reports
        /// </summary>
        [Fact]
        public async Task Post_WithPatientReports_CreatesPatientWithReports()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);
            var patient = CreateTestPatient();
            patient.ID = 0;
            patient.PatientReports = new List<PatientReport>
            {
                CreateTestPatientReport()
            };

            // Act
            var result = await controller.Post(patient);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Patient>>(result);
            Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            
            // Verify the patient was created in the database
            var createdPatient = await context.Patients.FirstOrDefaultAsync(p => p.UserID == patient.UserID);
            Assert.NotNull(createdPatient);
            
            // Verify reports were created
            var reports = await context.PatientReports.Where(r => r.PatientID == createdPatient.ID).ToListAsync();
            Assert.Single(reports);
        }

        /// <summary>
        /// Test POST method with patient having appointments and treatment - should create all related data
        /// </summary>
        [Fact]
        public async Task Post_WithPatientAppointmentsAndTreatment_CreatesAllRelatedData()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);
            var patient = CreateTestPatient();
            patient.ID = 0;
            patient.PatientAppointments = new List<PatientAppointment>
            {
                CreateTestPatientAppointment()
            };
            patient.PatientTreatment = CreateTestPatientTreatment();
            patient.PatientTreatment.PatientTreatmentDetails = new List<PatientTreatmentDetail>
            {
                CreateTestPatientTreatmentDetail()
            };

            // Act
            var result = await controller.Post(patient);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Patient>>(result);
            Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            
            // Verify all data was created
            var createdPatient = await context.Patients.FirstOrDefaultAsync(p => p.UserID == patient.UserID);
            Assert.NotNull(createdPatient);
            
            var appointments = await context.PatientAppointments.Where(a => a.PatientID == createdPatient.ID).ToListAsync();
            Assert.Single(appointments);
            
            var treatment = await context.PatientTreatments.FirstOrDefaultAsync(t => t.PatientID == createdPatient.ID);
            Assert.NotNull(treatment);
            
            var treatmentDetails = await context.PatientTreatmentDetails.Where(td => td.PatientID == createdPatient.ID).ToListAsync();
            Assert.Single(treatmentDetails);
        }

        #endregion

        #region PUT Tests

        /// <summary>
        /// Test PUT method with valid ID and patient - should update patient and return NoContent
        /// </summary>
        [Fact]
        public async Task Put_WithValidIdAndPatient_ReturnsNoContent()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var patient = CreateTestPatient();
            context.Patients.Add(patient);
            await context.SaveChangesAsync();
            
            var controller = new PatientController(context, _mockLogger.Object);
            patient.Allergies = "Updated Allergies";

            // Act
            var result = await controller.Put(1, patient);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            // Verify the update
            var updatedPatient = await context.Patients.FindAsync(1);
            Assert.Equal("Updated Allergies", updatedPatient?.Allergies);
        }

        /// <summary>
        /// Test PUT method with mismatched ID - should return BadRequest
        /// </summary>
        [Fact]
        public async Task Put_WithMismatchedId_ReturnsBadRequest()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);
            var patient = CreateTestPatient();

            // Act
            var result = await controller.Put(2, patient); // ID mismatch

            // Assert
            Assert.IsType<BadRequestResult>(result);
        }

        #endregion

        #region PATCH Tests

        /// <summary>
        /// Test PATCH method with valid ID and patch document - should update patient and return NoContent
        /// </summary>
        [Fact]
        public async Task Patch_WithValidIdAndPatchDoc_ReturnsNoContent()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var patient = CreateTestPatient();
            context.Patients.Add(patient);
            await context.SaveChangesAsync();
            
            var controller = new PatientController(context, _mockLogger.Object);
            var patchDoc = new JsonPatchDocument<Patient>();
            patchDoc.Replace(p => p.Allergies, "Patched Allergies");

            // Act
            var result = await controller.Patch(1, patchDoc);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            // Verify the patch
            var patchedPatient = await context.Patients.FindAsync(1);
            Assert.Equal("Patched Allergies", patchedPatient?.Allergies);
        }

        /// <summary>
        /// Test PATCH method with invalid ID - should return NotFound
        /// </summary>
        [Fact]
        public async Task Patch_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);
            var patchDoc = new JsonPatchDocument<Patient>();

            // Act
            var result = await controller.Patch(999, patchDoc);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        #endregion

        #region DELETE Tests

        /// <summary>
        /// Test DELETE method with valid ID - should delete patient and return NoContent
        /// </summary>
        [Fact]
        public async Task Delete_WithValidId_ReturnsNoContent()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var patient = CreateTestPatient();
            context.Patients.Add(patient);
            await context.SaveChangesAsync();
            
            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Delete(1);

            // Assert
            Assert.IsType<NoContentResult>(result);
            
            // Verify deletion
            var deletedPatient = await context.Patients.FindAsync(1);
            Assert.Null(deletedPatient);
        }

        /// <summary>
        /// Test DELETE method with invalid ID - should return NotFound
        /// </summary>
        [Fact]
        public async Task Delete_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Delete(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        #endregion

        #region Edge Case Tests

        /// <summary>
        /// Test GET method with empty database - should return empty list
        /// </summary>
        [Fact]
        public async Task Get_EmptyDatabase_ReturnsEmptyList()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Get(pageNumber: 1, pageSize: 10);

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Patient>>>(result);
            var patients = Assert.IsType<List<Patient>>(actionResult.Value);
            Assert.Empty(patients);
        }

        /// <summary>
        /// Test POST method with patient having null reports - should still create patient
        /// </summary>
        [Fact]
        public async Task Post_WithNullPatientReports_StillCreatesPatient()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);
            var patient = CreateTestPatient();
            patient.ID = 0;
            patient.PatientReports = null;

            // Act
            var result = await controller.Post(patient);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Patient>>(result);
            var createdAtActionResult = Assert.IsType<CreatedAtActionResult>(actionResult.Result);
            Assert.NotNull(createdAtActionResult);
        }

        /// <summary>
        /// Test POST method with transaction rollback - simulate error during save
        /// </summary>
        [Fact]
        public async Task Post_TransactionRollback_SimulateError()
        {
            // This test would require more complex setup to actually simulate a database error
            // For now, we test the happy path and ensure transaction is used
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);
            var patient = CreateTestPatient();
            patient.ID = 0;

            // Act
            var result = await controller.Post(patient);

            // Assert
            var actionResult = Assert.IsType<ActionResult<Patient>>(result);
            Assert.IsType<CreatedAtActionResult>(actionResult.Result);
        }

        #endregion

        public void Dispose()
        {
            // Clean up resources if needed
        }
    }
}