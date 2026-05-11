# Stage 1: Build the application
FROM maven:3.9.12-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar hanger-api-0.0.1-SNAPSHOT.jar
EXPOSE 8080
CMD ["java", "-jar", "hanger-api-0.0.1-SNAPSHOT.jar"]
