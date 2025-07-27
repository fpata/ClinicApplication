using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patientappointment")]
    public class PatientAppointment
    {
        public int ID { get; set; }
        public int? UserID { get; set; }
        [ForeignKey("UserID")]
        public User? User { get; set; }

 
        public DateTime? ApptDate { get; set; }
        public TimeSpan? ApptTime { get; set; }
        public string? TreatmentName { get; set; }
        public int? DoctorID { get; set; }

        public string? DoctorName { get; set; }
        public string? ApptStatus { get; set; }
        public int? PatientID { get; set; }
        [ForeignKey("PatientID")]
        public Patient? Patient { get; set; }
        public string? PatientName { get; set; }

        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
