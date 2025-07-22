using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("Address")]
    public class Address
    {
        public int ID { get; set; }
        public string? Address1 { get; set; }
        public string? Address2 { get; set; }
        public string? State { get; set; }
        public string? City { get; set; }
        public string? Country { get; set; }
        public string AddressType { get; set; } = string.Empty;
        public string? ZipCode { get; set; }
        public int? UserID { get; set; }
        [ForeignKey("UserID")]
        public User? User { get; set; }
    }
}
