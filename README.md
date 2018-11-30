## Local setup

- Clone repository into your system
- `cd` into the repository and run the following commands
```
brew install pipenv
brew install mysql
LDFLAGS=-L/usr/local/opt/openssl/lib pipenv install
pipenv shell
python manage.py collectstatic
```
- To run the server locally
```
python manage.py runserver
```