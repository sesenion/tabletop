# tabletop

Simple Tabletop Django Web App

This app provides a playing field in the browser where users
can create sprites and move them around the field. The sprites
with all their properties are saved in the database and the
app will synchronize the views of all browsers showing the
playing field.

## Requirements

- Python 3.11
- packages as specified in requirements.txt
- postgresql database server

## Environment Variables

Database is configured via settings.py. Username and Password
are provided in .env file next to settings.py. .env needs to
provide following Values (fill in missing strings):

SECRET_KEY=""
DB_USER=""
DB_PASSWORD=""
