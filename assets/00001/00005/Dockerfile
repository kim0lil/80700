FROM python:3.7

RUN python -m pip install pip --upgrade
RUN pip install Flask

COPY app.py /app.py

ENTRYPOINT ["python","app.py"]