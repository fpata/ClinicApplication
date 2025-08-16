using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicManager.Models.Enums;

namespace ClinicManager.Models
{
    [Table("patientappointment")]
    public class PatientAppointment : BaseEntity
    {
        [Required]
        public int? UserID { get; set; } 

        [Required]
        public int? PatientID { get; set; }
        
        [Required]
        public int? DoctorID { get; set; }

        public string? DoctorName { get; set; }

        [Required]
        public DateTime? StartDateTime { get; set; }
        
        [Required]
        public DateTime? EndDateTime { get; set; }
        
        [Required]
        public string? AppointmentStatus { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        
        [StringLength(200)]
        public string? CancellationReason { get; set; }
        
        public DateTime? ReminderSentDate { get; set; }
        
        // Navigation properties
        [ForeignKey("PatientID")]
        public virtual Patient? Patient { get; set; }
        
        [ForeignKey("DoctorID")]
        public virtual User? Doctor { get; set; }
    }
}
