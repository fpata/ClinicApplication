using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patientappointment")]
    public class PatientAppointment
    {
        public int ID { get; set; }
        public int? UserID { get; set; }
        public DateTime? StartApptDate { get; set; } = DateTime.UtcNow;
        public DateTime? EndApptDate { get; set; } = DateTime.UtcNow.AddMinutes(30);
        public string? TreatmentName { get; set; }
        public int? DoctorID { get; set; }

        public string? DoctorName { get; set; }
        public string? ApptStatus { get; set; }
        public int? PatientID { get; set; }
        public string? PatientName { get; set; }

        public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; } = 1;    
        public int? ModifiedBy { get; set; }=1;
        public byte? IsActive { get; set; } = 1;
    }
}
