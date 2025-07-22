using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patientreport")]
    public class PatientReport
    {
        public int ID { get; set; }
        public int? UserID { get; set; }
        [ForeignKey("UserID")]
        public User? User { get; set; }
        public string? ReportName { get; set; }
        public string? ReportDetails { get; set; }
        public string? ReportFilePath { get; set; }
        public string? DoctorName { get; set; }
        public DateTime? ReportDate { get; set; }
        public int? PatientID { get; set; }
        [ForeignKey("PatientID")]
        public Patient? Patient { get; set; }
    }
}
