using ClinicManager.Models;
using Microsoft.EntityFrameworkCore;

namespace ClinicManager.DAL
{
    public class ClinicDbContext : DbContext
    {
        public ClinicDbContext(DbContextOptions<ClinicDbContext> options) : base(options) { }

        public DbSet<Address> Addresses { get; set; }
        public DbSet<Contact> Contacts { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<PatientAppointment> PatientAppointments { get; set; }
        public DbSet<PatientReport> PatientReports { get; set; }
        public DbSet<PatientTreatment> PatientTreatments { get; set; }
        public DbSet<PatientTreatmentDetail> PatientTreatmentDetails { get; set; }
        public DbSet<PatientVitals> PatientVitals { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<BillingRecord> BillingRecords { get; set; }
        public DbSet<Payment> Payments { get; set; }

        public DbSet<AppConfig> AppConfigs { get; set; }
    }
}
