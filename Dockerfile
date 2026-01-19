FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY *.java ./
COPY *.html ./
COPY *.css ./
COPY *.js ./

RUN javac *.java

EXPOSE 10000

CMD ["java", "Main"]
