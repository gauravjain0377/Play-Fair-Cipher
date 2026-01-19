FROM openjdk:17-slim

WORKDIR /app

COPY *.java ./
COPY *.html ./
COPY *.css ./
COPY *.js ./

RUN javac *.java

EXPOSE 10000

CMD ["java", "Main"]
