FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src
COPY src/${{ values.name }}/${{ values.name }}.csproj src/${{ values.name }}/
RUN dotnet restore src/${{ values.name }}/${{ values.name }}.csproj
COPY src/ src/
RUN dotnet publish src/${{ values.name }}/${{ values.name }}.csproj -c Release -o /out --no-restore

# Chiseled: no shell, no package manager. The platform runs it as UID 10001
# with a read-only root filesystem.
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled
ENV ASPNETCORE_HTTP_PORTS=8080 DOTNET_EnableDiagnostics=0
WORKDIR /app
COPY --from=build /out .
USER 10001:10001
EXPOSE 8080
ENTRYPOINT ["dotnet", "${{ values.name }}.dll"]
