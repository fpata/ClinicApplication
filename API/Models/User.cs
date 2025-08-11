using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("User")]
    public class User
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]   
        public int ID { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string? MiddleName { get; set; }
        public string LastName { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string UserType { get; set; } = "patient";
        public string? Gender { get; set; } = "male";

        [NotMapped]
        public DateTime? DOB { get; set; }
        public int? Age { get; set; }
        public DateTime? LastLoginDate { get; set; } = DateTime.UtcNow;

        public DateTime? CreatedDate { get; set; }= DateTime.UtcNow;
        public DateTime? ModifiedDate { get; set; } = DateTime.UtcNow;
        public int? CreatedBy { get; set; } = 1;
        public int? ModifiedBy { get; set; }= 1;
        public byte IsActive { get; set; } = 1;

        public virtual Address? Address { get; set; }

        public virtual ICollection<Patient>? Patients { get; set; }

        public virtual Contact? Contact { get; set; }
    }
}
