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
        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Add any custom configuration here if needed
            base.OnModelCreating(modelBuilder);
        }
    }
}
