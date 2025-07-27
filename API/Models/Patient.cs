using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("patient")]
    public class Patient
    {
        public int ID { get; set; }
        public int? UserID { get; set; }
        [ForeignKey("UserID")]
        public User? User { get; set; }
        public string? Allergies { get; set; }
        public string? Medications { get; set; }
        public string? FatherHistory { get; set; }
        public string? MotherHistory { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
