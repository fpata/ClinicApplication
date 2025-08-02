using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patient")]
    public class Patient
    {
        public int ID { get; set; }
        public int? UserID { get; set; }
        public string? Allergies { get; set; }
        public string? Medications { get; set; }
        public string? FatherHistory { get; set; }
        public string? MotherHistory { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public bool IsActive { get; set; }
        public virtual ICollection<PatientAppointment>? PatientAppointments { get; set; }

        public virtual ICollection<PatientReport>? PatientReports{ get; set; }

        public virtual PatientTreatment? PatientTreatment { get; set; }

    }
}
