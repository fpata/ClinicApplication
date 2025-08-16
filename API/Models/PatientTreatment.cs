using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patienttreatment")]
    public class PatientTreatment : BaseEntity
    {
        [Required]
        public int? UserID { get; set; }

        [Required]
        public int? PatientID { get; set; }
        
        [Required]
        public int? DoctorID { get; set; }
        
        public int? AppointmentID { get; set; }
        
        [Required]
        [StringLength(500)]
        public string ChiefComplaint { get; set; } = string.Empty;
        
        [StringLength(1000)]
        public string? ClinicalFindings { get; set; }
        
        [StringLength(500)]
        public string? Diagnosis { get; set; }
        
        [StringLength(1000)]
        public string? TreatmentPlan { get; set; }
        
        [StringLength(500)]
        public string? Prescription { get; set; }
        
        [StringLength(500)]
        public string? FollowUpInstructions { get; set; }
      
        
        [StringLength(50)]
        public string? PaymentStatus { get; set; }
        
        // Navigation properties
        [ForeignKey("PatientID")]
        public virtual Patient? Patient { get; set; }
        
        [ForeignKey("DoctorID")]
        public virtual User? Doctor { get; set; }
        
        [ForeignKey("AppointmentID")]
        public virtual PatientAppointment? Appointment { get; set; }
        
        public virtual ICollection<PatientTreatmentDetail>? PatientTreatmentDetails { get; set; }

        public decimal? EstimatedCost { get; set; }
        public decimal? ActualCost { get; set; }
    }
}
