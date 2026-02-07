# Deployment & Verification Checklist

## Pre-Deployment Verification

### Code Review
- [ ] Review API\Models\PatientTreatmentDetail.cs
  - [ ] [ForeignKey] attributes added correctly
  - [ ] using System.ComponentModel.DataAnnotations; present
  
- [ ] Review API\DAL\ClinicDbContext.cs
  - [ ] OnModelCreating() method added
  - [ ] PatientTreatment ? PatientTreatmentDetail relationship configured
  - [ ] Patient ? PatientAppointment relationship configured
  - [ ] Patient ? PatientReport relationship configured
  - [ ] Patient ? PatientVitals relationship configured
  - [ ] Patient ? PatientTreatment relationship configured
  - [ ] All have OnDelete(DeleteBehavior.Cascade)

- [ ] Review API\Controllers\PatientController.cs
  - [ ] Line ~227: PatientTreatmentID is NOT being set to null
  - [ ] Line ~249: First SaveChangesAsync() present
  - [ ] Line ~259: Second SaveChangesAsync() for FK updates present

### Build Verification
- [ ] Run `dotnet build` or build in Visual Studio
- [ ] Zero compilation errors
- [ ] Zero compilation warnings
- [ ] All projects compile successfully

---

## Database Verification

### Pre-Deployment (Development)
- [ ] Database is running
- [ ] Connection string is correct
- [ ] Can connect to database successfully

### Schema Check (Optional - No Migration Needed)
```sql
-- Verify tables exist
SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('patient', 'patienttreatment', 'patienttreatmentdetail');
-- Should return 3 rows

-- Verify FK columns exist
DESCRIBE patienttreatmentdetail;
-- Should show: PatientTreatmentID, PatientID columns
```

---

## Deployment Steps

### Step 1: Backup
- [ ] Backup current database
- [ ] Backup current code in version control
- [ ] Commit changes: `git commit -m "Fix treatment details persistence"`

### Step 2: Deploy Code
- [ ] Build release version
- [ ] Deploy to development environment
- [ ] Verify application starts without errors
- [ ] Check application logs for any errors

### Step 3: Verify API Health
- [ ] API is running
- [ ] Swagger is accessible
- [ ] Authentication is working
- [ ] No startup errors in logs

---

## Testing Procedures

### Test 1: Create Patient with Treatment Details
- [ ] Use TESTING_INSTRUCTIONS.md Test 1
- [ ] POST request with nested treatment/details
- [ ] Verify response includes:
  - [ ] Patient ID (auto-generated)
  - [ ] PatientTreatment with ID
  - [ ] PatientTreatmentDetails array with 2+ items
  - [ ] All items have correct IDs and FKs

### Test 2: Verify Database State
- [ ] Use TESTING_INSTRUCTIONS.md Test 2
- [ ] Query 1: Patient record exists
- [ ] Query 2: PatientTreatment record exists with correct PatientID
- [ ] Query 3: PatientTreatmentDetail records exist with correct FKs
  - [ ] PatientTreatmentID is NOT null
  - [ ] PatientID is NOT null
  - [ ] Values match parent IDs

### Test 3: Retrieve Patient Data
- [ ] Use TESTING_INSTRUCTIONS.md Test 3
- [ ] GET /api/patient/{id} returns complete nested structure
- [ ] Response includes PatientTreatmentDetails

### Test 4: Update Patient
- [ ] Use TESTING_INSTRUCTIONS.md Test 4
- [ ] PUT request with modified/new details
- [ ] Verify existing details are updated
- [ ] Verify new details are inserted
- [ ] Database reflects changes

### Test 5: Delete Patient
- [ ] Use TESTING_INSTRUCTIONS.md Test 5
- [ ] DELETE /api/patient/{id}
- [ ] Verify soft delete (IsActive = 0)
- [ ] Verify cascade applies to all children

---

## Post-Deployment Verification

### Application Health
- [ ] API is running without errors
- [ ] No exceptions in logs
- [ ] Response times are normal
- [ ] Database connections are stable

### Feature Testing
- [ ] Create new patients - works ?
- [ ] Retrieve patients - works ?
- [ ] Update patients - works ?
- [ ] Delete patients - works ?
- [ ] Treatment details save - works ? (NEW FIX)

### Data Integrity
- [ ] All records have correct parent references
- [ ] No orphaned treatment details
- [ ] All FK values are populated
- [ ] No null FK values in production

### Performance
- [ ] Page load times acceptable
- [ ] Database queries performing normally
- [ ] No N+1 query issues
- [ ] Two-phase saves execute quickly

---

## Rollback Plan (if needed)

### If Critical Issues Occur
1. [ ] Identify the issue from logs
2. [ ] Revert code to previous version: `git revert <commit-hash>`
3. [ ] Rebuild and redeploy
4. [ ] Verify application works
5. [ ] Post-incident review

### Data Recovery
- [ ] If data was corrupted, restore from backup
- [ ] Verify backup restore completes successfully
- [ ] Verify data integrity after restore

---

## Documentation

### Update Team
- [ ] Notify team of deployment
- [ ] Share EXECUTIVE_SUMMARY.md
- [ ] Share QUICK_REFERENCE.md
- [ ] Share TESTING_INSTRUCTIONS.md

### Knowledge Base
- [ ] Add fix summary to internal wiki
- [ ] Document the root causes
- [ ] Document the solutions
- [ ] Add to troubleshooting guide

---

## Monitoring

### During Deployment
- [ ] Monitor application logs in real-time
- [ ] Watch for any exceptions
- [ ] Monitor database activity
- [ ] Monitor CPU/Memory usage

### After Deployment
- [ ] Set up monitoring alerts for errors
- [ ] Monitor patient creation requests
- [ ] Monitor database growth (should see detail records)
- [ ] Monitor API response times

---

## Sign-Off Checklist

### QA/Tester Sign-Off
- [ ] All tests pass
- [ ] No regressions found
- [ ] Data integrity verified
- [ ] Performance acceptable
- **Approved for production:** _____ (signature/initials, date)

### Developer Sign-Off
- [ ] Code reviewed
- [ ] Changes tested locally
- [ ] Documentation complete
- [ ] No known issues
- **Approved for merge:** _____ (signature/initials, date)

### DevOps/DBA Sign-Off
- [ ] Deployment procedure reviewed
- [ ] Database backup verified
- [ ] Rollback plan tested
- [ ] Monitoring configured
- **Approved for deployment:** _____ (signature/initials, date)

---

## Final Verification

### Sanity Checks (Day 1 Post-Deployment)
- [ ] No error emails from monitoring
- [ ] Users can create patients normally
- [ ] Treatment details are being saved
- [ ] No performance degradation
- [ ] Database health is good

### Extended Verification (1 Week Post-Deployment)
- [ ] No issues reported by users
- [ ] All test scenarios still pass
- [ ] Data integrity maintained
- [ ] Performance remains stable
- [ ] No unexpected side effects

---

## Success Criteria

All of the following must be true:
- ? Build compiles with zero errors
- ? Application starts without errors
- ? All 5 test scenarios pass
- ? Treatment details appear in database
- ? FK values are correct
- ? No regressions in existing features
- ? No performance degradation

---

## Common Issues & Solutions

### Issue: Build fails
**Solution:**
1. Clean solution: `dotnet clean`
2. Restore packages: `dotnet restore`
3. Rebuild: `dotnet build`
4. Check for mismatched file edits

### Issue: API won't start
**Solution:**
1. Check application logs
2. Verify database connection string
3. Verify OnModelCreating syntax
4. Try running migrations: `dotnet ef database update`

### Issue: Treatment details still not saved
**Solution:**
1. Verify [ForeignKey] attributes are in place
2. Verify OnModelCreating() is being called
3. Check if PatientTreatmentID is being nulled (shouldn't be)
4. Add logging to the controller to trace execution
5. Check database error logs

### Issue: JSON serialization errors
**Solution:**
1. Verify ReferenceHandler.IgnoreCycles is set in Program.cs
2. Verify MaxDepth = 8 or higher
3. Check circular reference prevention is working

---

## Timeline

- **Pre-Deployment:** 1-2 hours (code review, testing)
- **Deployment:** 15-30 minutes (code push, verification)
- **Post-Deployment:** 1-2 hours (smoke tests, monitoring)
- **Total:** 3-4.5 hours

---

## Contact Information

- **Developer:** [Your Name]
- **QA Lead:** [QA Name]
- **DevOps:** [DevOps Name]
- **Database Admin:** [DBA Name]

---

## Approval & Sign-Off

**Deployment Date:** _______________

**Deployed By:** _________________

**Approved By:** _________________

**Tested By:** _________________

**Verified By:** _________________

---

## Notes

Additional notes or observations:

```
[Space for additional notes]
```

---

**Checklist Version:** 1.0
**Last Updated:** 2025-01-16
**Status:** Ready for Deployment
