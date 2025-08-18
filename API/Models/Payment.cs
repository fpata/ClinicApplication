﻿using ClinicManager.Models.Enums;

namespace ClinicManager.Models
{
    public class Payment : BaseEntity
    {
        public int? BillingID { get; set; }
        public float? Amount { get; set; }
        public PaymentMethod? Method { get; set; }
        public string? TransactionDate { get; set; }   // ISO datetime
        public string? Reference { get; set; }        // Check #, Auth code, etc.
        public string? Notes { get; set; }
    }
}
