using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patientreport")]
    public class PatientReport
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public int? UserID { get; set; }

        public int? PatientID { get; set; }
        public string? ReportName { get; set; }
        public string? ReportDetails { get; set; }
        public string? ReportFilePath { get; set; }
        public string? DoctorName { get; set; }
        public DateTime? ReportDate { get; set; } = DateTime.UtcNow;    
        public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; }= DateTime.UtcNow;   
        public int? CreatedBy { get; set; } = 1;
        public int? ModifiedBy { get; set; } = 1;
        public byte IsActive { get; set; } =1;
    }
}
