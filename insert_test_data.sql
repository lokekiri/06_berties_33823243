# Insert data into the tables

USE berties_books;

INSERT INTO books (name, price)VALUES('Brighton Rock', 20.25),('Brave New World', 25.00), ('Animal Farm', 12.99) ;

INSERT INTO users (username, firstname, lastname, email, hashedPassword)
VALUES ('gold', 'gold', 'smiths', 'gold@example.com', '$2b$10$EHc6m5HH.Nr7jIQ6gUR9h.DQogIFLlpbp4LV10DTSpKxl1x/JDFMW');
