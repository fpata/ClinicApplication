namespace ClinicManager.Models.Enums
{
    public enum AppointmentStatus
    {
        Scheduled = 1,
        Confirmed = 2,
        InProgress = 3,
        Completed = 4,
        Cancelled = 5,
        NoShow = 6,
        Rescheduled = 7
    }

    public enum UserType
    {
        Patient = 1,
        Doctor = 2,
        Nurse = 3,
        Receptionist = 4,
        Administrator = 5,
        Technician = 6
    }

    public enum Gender
    {
        Male = 1,
        Female = 2,
        Other = 3,
        PreferNotToSay = 4
    }

}