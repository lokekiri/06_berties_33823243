Berties Books

Sample code for Dynamic Web Applications module.

Uses node.js with Express and EJS.

✔ Audit Logging

I implemented an audit logging system to track login activity

How it works
Created an audit table with columns: username, status, and time
Every login attempt inserts a record
"success" for valid credentials
"fail" for invalid credentials or unknown username

Added route /users/audit that displays all login attempts in descending time order

The audit page is rendered using audit.ejs

This feature improves security by allowing me to check suspicious login attempts

✔ Password Hashing

Passwords stored as hashed values only.

✔ Duplicate Username Check

Registration blocks usernames already in the database.



✔ Users Table

Stores: username, firstname, lastname, email, hashedPassword.

✔ Login Function

Compares hashed passwords and sets session:

req.session.userId = username

✔ Session Management

Uses express-session.
Session expires after 10 minutes.

✔ Access Control (redirectLogin)

Restricted routes require login:

/users/list
/users/audit
/books/list
/books/addbook
/books/bargainbooks

Public routes remain accessible (home, register, login, search).

✔ Logout

Session destroyed via /users/logout.

Validation (express-validator)

Registration validates:

Email must be valid
Username: 5–20 characters
Password: minimum 8 characters
First/last name cannot be empty
Login validates:
Username not empty
Password not empty

If validation fails, user is returned to the form.

Sanitisation (express-sanitizer)

Sanitised fields to prevent XSS:

username
firstname
lastname
email
search keywords
Password is not sanitised.

XSS tested and blocked (<script>alert("Gotcha!")</script>).





✔ Weather API Integration (OpenWeatherMap)
Added a full weather forecasting feature to Bertie’s Books using the OpenWeatherMap API.

How it works

Created a new route /weather inside main.js.

Installed and used request to call the weather API.

API returns JSON with temperature, humidity, wind speed, and weather conditions.

Output is displayed using weather.ejs in a clean, readable layout.

Added a link from the home page to the weather feature.


City Search (Interactivity)

Added a search form so users can enter any city.

/weather reads the city from req.query.city.

If no city is provided, it defaults to London.


Additional Weather Details
Displayed extra information:

Wind speed

Humidity

Weather description

Temperature

City name


Improved layout with basic formatting and colours via main.css.

Error Handling
Implemented robust checks to prevent crashes:

Invalid city names show a friendly error message.

Unexpected API responses handled safely with try/catch.

If weather.main is missing, displays “No data found” instead of breaking.


API Key Security

The API key is NOT included in GitHub.

A placeholder is committed in Git.

The real API key is added manually only on the VM.