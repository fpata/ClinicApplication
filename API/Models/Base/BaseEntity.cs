using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    public abstract class BaseEntity
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int ID { get; set; }
        
        [Required]
        public DateTime? CreatedDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public DateTime? ModifiedDate { get; set; } = DateTime.UtcNow;
        
        [Required]
        public int? CreatedBy { get; set; } = 1;
        
        [Required]
        public int? ModifiedBy { get; set; } = 1;
        
        [Required]
        public byte? IsActive { get; set; } = 1;

    }
}