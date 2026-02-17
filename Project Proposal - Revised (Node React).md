Project Proposal (Revised)
Aluprofile Search & Catalog System

Client: Oliver
Company: Aluprofile Search & Catalog System
Developer: Md Ashiqur Rahman
Date: 29-11-2025 (Revised for Node.js/React implementation)

1. Project Overview
Oliver would like a simple, modern web application to manage and search aluminium profiles.
The system should:
- Show applications (z.B. Maschinenbau, Solarindustrie, etc.) and cross-sections.
- List and search profiles with drawing, description, usage and supplier contact.
- Provide a detailed profile page with all technical data.
- Offer a secure admin area where authorised users can add and update profiles.

The goal is a practical business tool, not a complex enterprise system. It should be easy to use for non-technical users and easy to extend later.

2. Main Features (Scope of Version 1)
2.1 Public Area (for all visitors)
1. Home page
- List of application areas (Anwendungen) with the number of profiles per category.
- List of cross-section types (Querschnitte) with the number of profiles.
- List of newest/highlighted profiles with small drawing and key data.

2. Profile search and list
- Filter by application, cross-section type, supplier, material and dimensions.
- Text search by profile name or description.
- Table view similar to the printout provided (drawing, description, usage, photo, supplier).

3. Profile detail page
- Technical drawing.
- Dimensions, weight per meter, material, length.
- Usage description and status (e.g. "vorratig").
- Supplier contact details (address, phone, e-mail).
- Logo and optional pictures.

2.2 Admin Area (protected by login)
4. User login/logout
- Password-protected access for you and future staff.
- Role "Admin" for full access; further roles can be added later.

5. Profile management
- Create, edit, delete profiles.
- Upload drawing (image/PDF) and application photo.
- Set application categories and cross-section type.
- Set status (available / in development / not available).

6. Supplier management
- Create, edit, delete suppliers.
- Store address, contact person, phone, e-mail, website.

7. Application and cross-section management
- Create and edit application categories.
- Create and edit cross-section types.

2.3 Non-functional requirements
- Responsive web design (usable on PC, tablet and phone).
- German/English ready (texts can be stored so translation is possible later).
- Clean database design so the system can be extended in future.

3. Technology (short and non-technical)
- The system will be built with Node.js (NestJS backend), React frontend, and a SQL database (PostgreSQL).
- This is a modern and stable web stack, widely used for scalable business applications, and easy to host on Windows or Linux servers.
- Database access will use Prisma ORM with PostgreSQL, and raw SQL can be used selectively for advanced search/reporting queries when needed.
- For you as a user there is no technical knowledge required: you will access the system via a normal web browser (Chrome, Edge, Firefox).

4. Estimated Effort and Timeline
I plan to dedicate around 10-12 hours per week to this project.

Based on the required features, I estimate:
- Total effort: approx. 80-90 developer hours (including planning, implementation, testing and documentation).

With 10-12 hours per week, this results in a calendar duration of about 7-9 weeks after project start.

Planned milestones
- Week 1-2:
- Final clarification of requirements and small adjustments.
- Design of database and page structure.
- Basic monorepo setup (NestJS API + React app) and initial PostgreSQL schema/migrations.

- Week 3-4:
- Implementation of public pages (home, list, detail) in React.
- Implementation of basic search/filter endpoints in NestJS.

- Week 5-6:
- Implementation of admin area (login, CRUD for profiles and suppliers).
- File upload for drawings and images.

- Week 7-8/9:
- Testing, fixes and small improvements.
- Writing short user documentation (how to log in, how to add profiles).
- Deployment to your server/hosting (if already available).

The exact weeks can be adapted to your schedule.

5. Pricing and Payment Terms
My suggested hourly rate for this project is:
- EUR 25 per hour

With an estimated 80-90 hours, the expected project cost is roughly EUR 2,000-2,250.
To keep things simple for you, I propose a fixed-price agreement based on this estimate:
- Fixed price for Version 1 (as described above): EUR 2,100 (excl. VAT, if applicable)

This includes a time buffer for small changes and unforeseen details.

Payment schedule
- 30% (EUR 630) at project start (after you accept this proposal)
- 40% (EUR 840) after delivery of a working test version (middle of the project)
- 30% (EUR 630) after final hand-over and your approval

Any additional features beyond the scope above can be discussed separately and billed hourly at the same rate.

6. Responsibilities
Developer (Md Ashiqur Rahman):
- Design and implement the application and database.
- Provide instructions for installing and running the system.
- Provide up to 2 weeks of support after go-live for small bug fixes or corrections.

Client (Oliver):
- Provide initial data for profiles and suppliers (e.g. Excel/CSV or scans).
- Provide logos, drawings and photos to be used.
- Give timely feedback on design and functionality during the project.

7. Hosting and Access
Options:
1. You provide a Windows/Linux server or web hosting where we deploy the application.
2. Alternatively, I can help you choose a suitable hosting provider (extra time, billed hourly).

In both cases you will receive:
- The compiled/deployed application components (frontend and backend).
- The database schema and migration scripts (SQL/Prisma migration output).
- All necessary instructions to run the system.

8. Acceptance and Next Steps
If you agree with this plan, pricing and timeline, the next steps are:
1. You confirm this proposal by e-mail.
2. We agree on a start date.
3. I prepare a short contract and an initial checklist (data you need to send me).
4. After receiving the first payment (30%), I start implementation.

Thank you for your interest in this project, Oliver.
I am looking forward to building a useful and long-lasting tool for managing your aluminium profiles.

Best regards,
Md Ashiqur Rahman
Software Engineer (Node.js/React)
E-mail: ashiqurrhaman90@gmail.com
Phone: +4367764303935
