using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("contact")]
    public class Contact
    {
        public int ID { get; set; }
        public string PrimaryPhone { get; set; } = string.Empty;
        public string? SecondaryPhone { get; set; }
        public string PrimaryEmail { get; set; } = string.Empty;
        public string? SecondaryEmail { get; set; }
        public string? RelativeName { get; set; }
        public string? RelativeRealtion { get; set; }
        public string? RelativePhone { get; set; }
        public string? RelativeEmail { get; set; }
        public int? UserID { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
