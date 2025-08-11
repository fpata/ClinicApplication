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
        public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; } = 1;
        public int? ModifiedBy { get; set; }=1;
        public byte? IsActive { get; set; }=1;

        public DateTime? TreatmentDate { get; set; } = DateTime.UtcNow; 

        public virtual ICollection<PatientTreatmentDetail>? PatientTreatmentDetails { get; set; }
    }
}
