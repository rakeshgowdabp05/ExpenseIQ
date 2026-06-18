FROM eclipse-temurin:21-jdk-alpine AS build

WORKDIR /workspace

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw
RUN ./mvnw -q -DskipTests dependency:go-offline

COPY src src

RUN ./mvnw -q clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S expenseiq && adduser -S expenseiq -G expenseiq

COPY --from=build /workspace/target/*.jar /app/app.jar

RUN mkdir -p /app/storage/receipts && chown -R expenseiq:expenseiq /app

USER expenseiq

EXPOSE 10000

ENTRYPOINT ["java", "-jar", "/app/app.jar"]