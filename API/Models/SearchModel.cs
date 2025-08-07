namespace ClinicManager.Models
{
    public class SearchModel
    {
        public int UserID { get; set; } 

        public int? PatientID { get; set; }
        // User fields
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? UserName { get; set; }
        public string? UserType { get; set; }
        public string? PermCity { get; set; }
        // Contact fields
        public string? PrimaryPhone { get; set; }
        public string? PrimaryEmail { get; set; }

        public int? DoctorID { get; set; } = 0;
        public string? DoctorName { get; set; } = string.Empty;
        
        public DateTime? StartDate { get; set; } = DateTime.Now.AddYears(-1);
        public DateTime? EndDate { get; set; } = DateTime.Now;

    }
}
