FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080

# Create non-root user
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --ingroup appgroup appuser

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src

# Copy project files and restore
COPY ["Exo.Vote.Api/Exo.Vote.Api.csproj", "Exo.Vote.Api/"]
COPY ["Exo.Vote.Application/Exo.Vote.Application.csproj", "Exo.Vote.Application/"]
COPY ["Exo.Vote.Domain/Exo.Vote.Domain.csproj", "Exo.Vote.Domain/"]
COPY ["Exo.Vote.Infrastructure/Exo.Vote.Infrastructure.csproj", "Exo.Vote.Infrastructure/"]
RUN dotnet restore "Exo.Vote.Api/Exo.Vote.Api.csproj"

# Copy everything and build
COPY . .
WORKDIR "/src/Exo.Vote.Api"
RUN dotnet build "Exo.Vote.Api.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "Exo.Vote.Api.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

USER appuser

ENTRYPOINT ["dotnet", "Exo.Vote.Api.dll"]
