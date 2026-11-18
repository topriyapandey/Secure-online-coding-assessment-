FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY ["CodingAssessment.Api.csproj", "./"]
RUN dotnet restore "CodingAssessment.Api.csproj"
COPY . .
RUN dotnet build "CodingAssessment.Api.csproj" -c Release -o /app/build
RUN dotnet publish "CodingAssessment.Api.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENTRYPOINT ["dotnet", "CodingAssessment.Api.dll"]
