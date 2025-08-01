using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patienttreatmentdetail")]
    public class PatientTreatmentDetail
    {
        public int ID { get; set; }
        public int? PatientTreatmentID { get; set; }
        public int? UserID { get; set; }
        public string? Tooth { get; set; }
        public string? Procedure { get; set; }
        public string? Advice { get; set; }
        public DateTime? TreatmentDate { get; set; }
        public int? PatientID { get; set; }

        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
