using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("Address")]
    public class Address
    {
        public int ID { get; set; }
        public string? PermAddress1 { get; set; }
        public string? PermAddress2 { get; set; }
        public string? PermState { get; set; }
        public string? PermCity { get; set; }
        public string? PermCountry { get; set; }
        public string? PermZipCode { get; set; }
        public string? CorrAddress1 { get; set; }
        public string? CorrAddress2 { get; set; }
        public string? CorrState { get; set; }
        public string? CorrCity { get; set; }
        public string? CorrCountry { get; set; }
        public string? CorrZipCode { get; set; }
        public int? UserID { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
