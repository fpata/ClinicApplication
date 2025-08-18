using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patienttreatmentdetail")]
    public class PatientTreatmentDetail: BaseEntity
    {
        public int? PatientTreatmentID { get; set; }
        public int? UserID { get; set; }
        public string? Tooth { get; set; }
        public string? Procedure { get; set; }
        public string? Prescription { get; set; }
        public DateTime? TreatmentDate { get; set; }
        public int? PatientID { get; set; }

    }
}
