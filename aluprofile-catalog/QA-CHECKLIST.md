# Aluprofile Catalog QA Checklist

## Scope
Use this checklist before demo, handover, or deployment.
Mark each item as:
- `[ ]` Not tested
- `[x]` Passed
- `[!]` Failed / needs fix
- `[-]` Not applicable

---

## 1. Environment
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] `GET /api/health` returns `200`
- [ ] Backend can reach PostgreSQL
- [ ] Clerk keys are loaded correctly
- [ ] Frontend points to correct `VITE_API_BASE`
- [ ] No critical console errors on initial page load

---

## 2. Public Catalog Page
### Hero and layout
- [ ] Hero section loads correctly
- [ ] Header buttons align correctly
- [ ] Language selector works
- [ ] Stats cards show correct totals
- [ ] Featured profiles render correctly
- [ ] Images/drawings are visible and not cropped incorrectly

### Search and filters
- [ ] Name/keyword filter works
- [ ] Application filter works
- [ ] Cross-section filter works
- [ ] Supplier filter works
- [ ] Material filter works
- [ ] Dimensions filter works
- [ ] Clear filter behavior works
- [ ] Filter chips update correctly

### Sorting and pagination
- [ ] Sorting changes result order correctly
- [ ] Pagination moves between pages correctly
- [ ] Result count updates correctly after filtering
- [ ] Table/card toggle works correctly
- [ ] Mobile result cards render correctly

### Detail panel
- [ ] Clicking a profile loads detail panel
- [ ] Detail section shows drawing/photo/logo correctly
- [ ] Supplier/contact data displays correctly
- [ ] Status label is readable and correct
- [ ] Technical values match backend data

---

## 3. Authentication
### Login
- [ ] Admin login page loads correctly
- [ ] Username/email input works
- [ ] Password input works
- [ ] Show/hide password works
- [ ] Enter key submits login form
- [ ] Wrong credentials show readable error message
- [ ] Successful login stays on `/admin`

### Password reset
- [ ] Forgot password flow opens correctly
- [ ] Reset code request works
- [ ] Reset code verification works
- [ ] New password can be set
- [ ] User can login with new password

### Session handling
- [ ] Logged-out user cannot access admin sections
- [ ] Logged-in user sees expected UI state
- [ ] Sign out works correctly

---

## 4. Role and Permission Access
### Access policy
- [ ] User without `VIEW_ADMIN` sees access denied
- [ ] User with `VIEW_ADMIN` can open admin area
- [ ] `MANAGER` sees only permitted sections
- [ ] `USER` is blocked from restricted admin areas as expected
- [ ] Role changes apply after sign out/in
- [ ] Permission changes apply after sign out/in

### Access diagnostics
- [ ] `GET /api/auth/access-check` returns expected role
- [ ] `GET /api/auth/access-check` returns expected permissions
- [ ] Missing permission reason is clear

---

## 5. Admin Overview / Quick Actions
- [ ] Sidebar navigation works
- [ ] Active section switching works
- [ ] Quick Action tiles open correct section
- [ ] Seed demo data works
- [ ] Counts in overview cards are correct

---

## 6. Admin: Suppliers
### CRUD
- [ ] Add supplier works
- [ ] Edit supplier works
- [ ] Delete supplier works
- [ ] EN/DE supplier names save correctly

### Data grid
- [ ] Supplier filter works
- [ ] Supplier sort works
- [ ] Supplier pagination works
- [ ] Supplier Excel export works
- [ ] Supplier PDF export works

---

## 7. Admin: Applications
### CRUD
- [ ] Add application works
- [ ] Edit application works
- [ ] Delete application works
- [ ] EN/DE application names save correctly

### Data grid
- [ ] Application filter works
- [ ] Application sort works
- [ ] Application pagination works
- [ ] Application Excel export works
- [ ] Application PDF export works

---

## 8. Admin: Cross-sections
### CRUD
- [ ] Add cross-section works
- [ ] Edit cross-section works
- [ ] Delete cross-section works
- [ ] EN/DE cross-section names save correctly

### Data grid
- [ ] Cross-section filter works
- [ ] Cross-section sort works
- [ ] Cross-section pagination works
- [ ] Cross-section Excel export works
- [ ] Cross-section PDF export works

---

## 9. Admin: Profiles
### CRUD
- [ ] Add profile works
- [ ] Edit profile works
- [ ] Delete profile works
- [ ] EN/DE profile fields save correctly
- [ ] Supplier assignment saves correctly
- [ ] Application assignment saves correctly
- [ ] Cross-section assignment saves correctly
- [ ] Status saves correctly

### Uploads
- [ ] Drawing upload works
- [ ] Photo upload works
- [ ] Uploaded files render correctly in admin/public page

### Data grid
- [ ] Profile filter works
- [ ] Profile sort works
- [ ] Profile pagination works
- [ ] Profile Excel export works
- [ ] Profile PDF export works

---

## 10. Admin: User Management
### CRUD
- [ ] Create user works
- [ ] Edit user works
- [ ] Delete user works
- [ ] Password update by admin works

### Data grid
- [ ] User filter works
- [ ] User sort works
- [ ] User pagination works
- [ ] User Excel export works
- [ ] User PDF export works

---

## 11. Admin: Role & Permission Management
### CRUD
- [ ] Add access rule works
- [ ] Edit access rule works
- [ ] Delete access rule works
- [ ] Role change persists correctly
- [ ] Permission toggle persists correctly

### Data grid
- [ ] Role filter works
- [ ] Role sort works
- [ ] Role pagination works
- [ ] Role Excel export works
- [ ] Role PDF export works

---

## 12. API Smoke Checks
### Public
- [ ] `GET /api/public/overview?lang=en`
- [ ] `GET /api/public/overview?lang=de`
- [ ] `GET /api/public/profiles?lang=en`
- [ ] `GET /api/public/profiles?lang=de`
- [ ] `GET /api/public/profiles/:id?lang=en`

### Auth
- [ ] `GET /api/auth/me` with token
- [ ] `GET /api/auth/access-check` with token

### Admin
- [ ] `GET /api/admin/reference-data` with admin token
- [ ] `GET /api/admin/profiles` with profile-manage token
- [ ] `GET /api/admin/clerk-users` with user-manage token
- [ ] `POST /api/admin/demo-data/seed` with profile-manage token

---

## 13. Browser Console / UX Quality
- [ ] No red console errors during normal use
- [ ] No broken images in public/admin pages
- [ ] Buttons have visible hover/focus states
- [ ] Mobile layout is usable
- [ ] Sidebar behaves correctly on admin page
- [ ] Empty states are readable
- [ ] Success and error toasts are readable

---

## 14. Pre-Deployment Checks
- [ ] Production env vars are set
- [ ] PostgreSQL connection works in production
- [ ] Clerk production keys configured
- [ ] Public domain configured
- [ ] CORS settings correct
- [ ] `prisma generate` completed
- [ ] production migration applied
- [ ] `/api/health` returns `200` in production

---

## 15. Sign-Off Notes
### Tested by
- Name:
- Date:
- Environment:

### Known issues
- 
- 
- 

### Release decision
- [ ] Ready for demo
- [ ] Ready for client review
- [ ] Ready for production
- [ ] Blocked
