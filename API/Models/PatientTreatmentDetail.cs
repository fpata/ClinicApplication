using ClinicManager.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace ClinicManager.Models
{
    [Table("patienttreatmentdetail")]
    public class PatientTreatmentDetail: BaseEntity
    {
    
        public int? PatientTreatmentID { get; set; }
        public int? UserID { get; set; }
        public string? Tooth { get; set; }
        public string? Procedure { get; set; }
        public string? Prescription { get; set; }
        public DateTime? TreatmentDate { get; set; }
        public int? PatientID { get; set; }

        public string? FollowUpInstructions { get; set; }

        public int IsActive { get; set; } = 1;

        public string? FollowUpDate { get; set; }

        public float? ProcedureTreatmentCost { get; set; } = 0;

    }
}
