using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("User")]
    public class User
    {
        public int ID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string UserType { get; set; } = "Patient";
        public string? Gender { get; set; } = "Male";
        public DateTime? DOB { get; set; }
        public int? Age { get; set; }
        public DateTime? LastLoginDate { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime ModifiedDate { get; set; }
        public int CreatedBy { get; set; }
        public int ModifiedBy { get; set; }
        public bool IsActive { get; set; }
    }
}
