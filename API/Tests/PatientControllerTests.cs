using Xunit;
using Moq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ClinicManager.Controllers;
using ClinicManager.Models;
using ClinicManager.DAL;
using Microsoft.AspNetCore.JsonPatch;
using FluentAssertions;

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
            result.Should().NotBeNull();
            var actionResult = result.Should().BeOfType<ActionResult<IEnumerable<Patient>>>().Subject;
            var patients = actionResult.Value.Should().BeOfType<List<Patient>>().Subject;
            patients.Should().HaveCount(2);
        }

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
            var actionResult = result.Should().BeOfType<ActionResult<IEnumerable<Patient>>>().Subject;
            var patients = actionResult.Value.Should().BeOfType<List<Patient>>().Subject;
            patients.Should().HaveCount(3);
        }

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
            var actionResult = result.Should().BeOfType<ActionResult<IEnumerable<Patient>>>().Subject;
            var patients = actionResult.Value.Should().BeOfType<List<Patient>>().Subject;
            patients.Should().HaveCount(2); // Should have remaining 2 patients
        }

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
            var actionResult = result.Should().BeOfType<ActionResult<Patient>>().Subject;
            var returnedPatient = actionResult.Value.Should().BeOfType<Patient>().Subject;
            returnedPatient.ID.Should().Be(1);
            returnedPatient.Allergies.Should().Be("None");
        }

        [Fact]
        public async Task Get_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Get(999);

            // Assert
            var actionResult = result.Should().BeOfType<ActionResult<Patient>>().Subject;
            actionResult.Result.Should().BeOfType<NotFoundResult>();
        }

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
            var actionResult = result.Should().BeOfType<ActionResult<User>>().Subject;
            var returnedUser = actionResult.Value.Should().BeOfType<User>().Subject;
            returnedUser.ID.Should().Be(1);
            returnedUser.Patients.Should().NotBeNull().And.HaveCount(1);
            returnedUser.Address.Should().NotBeNull();
            returnedUser.Contact.Should().NotBeNull();
        }

        [Fact]
        public async Task GetComplete_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.GetComplete(999);

            // Assert
            var actionResult = result.Should().BeOfType<ActionResult<User>>().Subject;
            actionResult.Result.Should().BeOfType<NotFoundResult>();
        }

        #endregion

        #region POST Tests

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
            var actionResult = result.Should().BeOfType<ActionResult<Patient>>().Subject;
            var createdAtActionResult = actionResult.Result.Should().BeOfType<CreatedAtActionResult>().Subject;
            var createdPatient = createdAtActionResult.Value.Should().BeOfType<Patient>().Subject;
            createdPatient.ID.Should().BeGreaterThan(0);
        }

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
            var actionResult = result.Should().BeOfType<ActionResult<Patient>>().Subject;
            actionResult.Result.Should().BeOfType<CreatedAtActionResult>();
            
            // Verify the patient was created in the database
            var createdPatient = await context.Patients.FirstOrDefaultAsync(p => p.UserID == patient.UserID);
            createdPatient.Should().NotBeNull();
            
            // Verify reports were created
            var reports = await context.PatientReports.Where(r => r.PatientID == createdPatient.ID).ToListAsync();
            reports.Should().HaveCount(1);
        }

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
            var actionResult = result.Should().BeOfType<ActionResult<Patient>>().Subject;
            actionResult.Result.Should().BeOfType<CreatedAtActionResult>();
            
            // Verify all data was created
            var createdPatient = await context.Patients.FirstOrDefaultAsync(p => p.UserID == patient.UserID);
            createdPatient.Should().NotBeNull();
            
            var appointments = await context.PatientAppointments.Where(a => a.PatientID == createdPatient.ID).ToListAsync();
            appointments.Should().HaveCount(1);
            
            var treatment = await context.PatientTreatments.FirstOrDefaultAsync(t => t.PatientID == createdPatient.ID);
            treatment.Should().NotBeNull();
            
            var treatmentDetails = await context.PatientTreatmentDetails.Where(td => td.PatientID == createdPatient.ID).ToListAsync();
            treatmentDetails.Should().HaveCount(1);
        }

        #endregion

        #region PUT Tests

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
            result.Should().BeOfType<NoContentResult>();
            
            // Verify the update
            var updatedPatient = await context.Patients.FindAsync(1);
            updatedPatient?.Allergies.Should().Be("Updated Allergies");
        }

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
            result.Should().BeOfType<BadRequestResult>();
        }

        #endregion

        #region PATCH Tests

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
            result.Should().BeOfType<NoContentResult>();
            
            // Verify the patch
            var patchedPatient = await context.Patients.FindAsync(1);
            patchedPatient?.Allergies.Should().Be("Patched Allergies");
        }

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
            result.Should().BeOfType<NotFoundResult>();
        }

        #endregion

        #region DELETE Tests

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
            result.Should().BeOfType<NoContentResult>();
            
            // Verify deletion
            var deletedPatient = await context.Patients.FindAsync(1);
            deletedPatient.Should().BeNull();
        }

        [Fact]
        public async Task Delete_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            using var context = GetInMemoryContext();
            var controller = new PatientController(context, _mockLogger.Object);

            // Act
            var result = await controller.Delete(999);

            // Assert
            result.Should().BeOfType<NotFoundResult>();
        }

        #endregion

        public void Dispose()
        {
            // Clean up resources if needed
        }
    }
}