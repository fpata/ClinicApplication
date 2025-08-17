using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using ClinicManager.Models.Enums;

namespace ClinicManager.Models
{
    [Table("patientappointment")]
    public class PatientAppointment : BaseEntity
    {

        public int? UserID { get; set; } 


        public int? PatientID { get; set; }
        

        public int? DoctorID { get; set; }

        public string? DoctorName { get; set; }


        public DateTime? StartDateTime { get; set; }
        

        public DateTime? EndDateTime { get; set; }
        

        public string? AppointmentStatus { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        public DateTime? CheckInTime { get; set; }
        public DateTime? CheckOutTime { get; set; }
        
        [StringLength(200)]
        public string? CancellationReason { get; set; }
        
        public DateTime? ReminderSentDate { get; set; }
        

        public virtual Patient? Patient { get; set; }
        
    }
}
