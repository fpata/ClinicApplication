using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patienttreatmentdetail")]
    public class PatientTreatmentDetail
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public int? PatientTreatmentID { get; set; }
        public int? UserID { get; set; }
        public string? Tooth { get; set; }
        public string? Procedure { get; set; }
        public string? Prescription { get; set; }
        public DateTime? TreatmentDate { get; set; }
        public int? PatientID { get; set; }

        public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; } = 1;
        public int? ModifiedBy { get; set; } = 1;
        public byte IsActive { get; set; } = 1;
    }
}
