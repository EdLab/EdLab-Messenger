FROM python:3

RUN apt-get update && apt-get install -y mysql-client &&\
pip install pipenv

WORKDIR /prj

ADD Pipfile .
ADD Pipfile.lock .

RUN pipenv install --system --deploy

ADD . .

CMD uwsgi --ini uwsgi.ini
