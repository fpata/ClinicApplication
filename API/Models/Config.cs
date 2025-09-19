using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClinicManager.Models
{
    [Table("configs")]
    public class AppConfig : BaseEntity
    {
        [StringLength(45)]
        public string? ClinicOpenTime { get; set; }

        [StringLength(45)]
        public string? ClinicEndTime { get; set; }

        [StringLength(255)]
        public string? ClinicName { get; set; }

        [StringLength(255)]
        public string? ClinicProp { get; set; }

        [StringLength(45)]
        public string? PerPatientSlotInMinutes { get; set; }

        [StringLength(45)]
        public string? LunchTime { get; set; }
    }
}