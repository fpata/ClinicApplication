using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patienttreatment")]
    public class PatientTreatment
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public string ChiefComplaint { get; set; } = string.Empty;
        public string? Observation { get; set; }
        public string TreatmentPlan { get; set; } = string.Empty;
        public int? PatientID { get; set; }

        [ForeignKey("UserID")]
        public User? User { get; set; }

        [ForeignKey("PatientID")]
        public Patient? Patient { get; set; }
    }
}
