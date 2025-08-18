using ClinicManager.Models.Enums;

namespace ClinicManager.Models
{
    public class BillingRecord : BaseEntity
    {

        public int? TreatmentID { get; set; }

        public int? PatientID { get; set; }
        public int? DoctorID { get; set; }

        // Snapshot fields (denormalized for historical accuracy)
        public int? PatientName { get; set; }
        public int? DoctorName { get; set; }
        public string? TreatmentName { get; set; }

        public string? ServiceDate { get; set; }         // ISO date (from StartApptDate)
        public string? PostedDate { get; set; }             // When the bill was generated
        public BillingStatus? Status { get; set; }


        public float? Subtotal { get; set; }
        public float? TaxTotal { get; set; }
        public float? DiscountTotal { get; set; }
        public float? AdjustmentTotal { get; set; }
        public float? Total { get; set; }                 // (Subtotal + Tax - Discount + Adjustment)
        public float? AmountPaid { get; set; }
        public float? BalanceDue { get; set; }

        public InsuranceSegment? Insurance { get; set; }
        public Payment[] Payments { get; set; } = [];
        public string? Notes { get; set; }
    }




    public class InsuranceSegment
    {
        public string? PayerName { get; set; }
        public string? PolicyNumber { get; set; }
        public string? GroupNumber { get; set; }
        public float? CoveragePercent { get; set; }     // e.g. 0.8 for 80%
        public float? DeductibleApplied { get; set; }
        public float? CopayAmount { get; set; }
        public float? CoinsuranceAmount { get; set; }
        public float? InsurancePortion { get; set; }    // Calculated
        public float? PatientPortion { get; set; }      // Calculated
        public float? AdjudicationRef { get; set; }

        public InsuranceStatus? Status;
    }
}
