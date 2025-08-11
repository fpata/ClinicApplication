using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patient")]
    public class Patient
    {
        public int ID { get; set; }
        public int UserID { get; set; }
        public string? Allergies { get; set; }
        public string? Medications { get; set; }
        public string? FatherHistory { get; set; }
        public string? MotherHistory { get; set; }
        public DateTime? CreatedDate { get; set; }= DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; }= DateTime.UtcNow;
        public int? CreatedBy { get; set; } = 1;
        public int? ModifiedBy { get; set; } = 1;   
        public byte IsActive { get; set; } = 1;
        public virtual ICollection<PatientAppointment>? PatientAppointments { get; set; }

        public virtual ICollection<PatientReport>? PatientReports{ get; set; }

        public virtual PatientTreatment? PatientTreatment { get; set; }

    }
}
