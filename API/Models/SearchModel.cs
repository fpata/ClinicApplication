using ClinicManager.Models.Enums;

namespace ClinicManager.Models
{
    public class SearchModel
    {
        public int? UserID { get; set; } 

        public int? PatientID { get; set; }
        // User fields
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? UserName { get; set; }
        public UserType? UserType { get; set; }
        public string? PermCity { get; set; }
        // Contact fields
        public string? PrimaryPhone { get; set; }
        public string? PrimaryEmail { get; set; }

        public int? DoctorID { get; set; } = 0;
        public string? DoctorName { get; set; } = string.Empty;
        
        // Apply date filters only if client provides them
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

    }

    public class AppointmentSearchResponse
    {
        public IEnumerable<PatientAppointment> Results { get; set; }
        public int TotalCount { get; set; }
        public bool HasMoreRecords { get; set; }
        public string Message { get; set; }
    }
}
