using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("contact")]
    public class Contact
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        public string PrimaryPhone { get; set; } = string.Empty;
        public string? SecondaryPhone { get; set; }
        public string PrimaryEmail { get; set; } = string.Empty;
        public string? SecondaryEmail { get; set; }
        public string? RelativeName { get; set; }
        public string? RelativeRealtion { get; set; }
        public string? RelativePhone { get; set; }
        public string? RelativeEmail { get; set; }
        public int? UserID { get; set; } = 1;
        public DateTime? CreatedDate { get; set; }= DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; } = 1;
        public int? ModifiedBy { get; set; } = 1;
        public byte? IsActive { get; set; } = 1;
    }
}
