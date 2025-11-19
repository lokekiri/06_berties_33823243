Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

-Audit Logging

I implemented an audit logging system to track login activity

How it works
Created an audit table with columns: username, status, and time
Every login attempt inserts a record
"success" for valid credentials
"fail" for invalid credentials or unknown username

Added route /users/audit that displays all login attempts in descending time order

The audit page is rendered using audit.ejs

This feature improves security by allowing me to check suspicious login attempts
