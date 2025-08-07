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
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public bool IsActive { get; set; }

        public DateTime? TreatmentDate { get; set; }

        public virtual ICollection<PatientTreatmentDetail>? PatientTreatmentDetails { get; set; }
    }
}
