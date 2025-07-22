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

        [ForeignKey("UserID")]
        public User? User { get; set; }

        [ForeignKey("PatientID")]
        public Patient? Patient { get; set; }

        [ForeignKey("PatientTreatmentID")]
        public PatientTreatment? PatientTreatment { get; set; }
    }
}
