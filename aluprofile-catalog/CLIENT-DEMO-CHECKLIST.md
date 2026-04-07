# Aluprofile Catalog Client Demo Checklist

Use this checklist for a short client-facing demo. Focus on visible business flows, not internal engineering detail.

Mark each item as:
- `[ ]` Not shown
- `[x]` Shown and working
- `[!]` Shown but issue found

---

## 1. Demo Setup
- [ ] Backend is running
- [ ] Frontend is running
- [ ] Demo data is available
- [ ] Browser console has no blocking errors

---

## 2. Public Catalog Demo
- [ ] Landing page loads cleanly
- [ ] Hero section looks correct
- [ ] Language switch works (`EN` / `DE`)
- [ ] Search by keyword works
- [ ] Filter by application works
- [ ] Filter by cross-section works
- [ ] Filter by supplier works
- [ ] Sorting works
- [ ] Pagination works
- [ ] Table / card view toggle works
- [ ] Profile detail section updates when selecting an item
- [ ] Images/drawings display correctly

---

## 3. Admin Login Demo
- [ ] Admin login page loads correctly
- [ ] Username/email + password login works
- [ ] Invalid login shows readable error
- [ ] Logged-in user stays on `/admin`

---

## 4. Role and Permission Demo
- [ ] Admin can access all admin sections
- [ ] Manager sees only permitted sections
- [ ] User without `VIEW_ADMIN` gets access denied
- [ ] Role/permission changes apply after re-login

---

## 5. Admin Management Demo
### Suppliers
- [ ] Add supplier works
- [ ] Edit supplier works
- [ ] Delete supplier works
- [ ] Filter/sort/export works

### Applications / Cross-sections
- [ ] Add application works
- [ ] Add cross-section works
- [ ] Edit and delete work
- [ ] Filter/sort/export works

### Profiles
- [ ] Add profile works
- [ ] Edit profile works
- [ ] Delete profile works
- [ ] Upload works
- [ ] Filter/sort/export works

### Users
- [ ] Create user works
- [ ] Edit user works
- [ ] Delete user works
- [ ] Admin password reset/update works
- [ ] Filter/sort/export works

### Roles and Permissions
- [ ] Add access rule works
- [ ] Edit access rule works
- [ ] Delete access rule works
- [ ] Export works

---

## 6. End of Demo
- [ ] No blocking issue found during walkthrough
- [ ] Key flows completed without refresh/restart
- [ ] Ready for client presentation

---

## Demo Notes
- Presenter:
- Date:
- Environment:
- Main issues noticed:
  - 
  - 
  - 
