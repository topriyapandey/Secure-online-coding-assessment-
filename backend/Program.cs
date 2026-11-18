using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using CodingAssessment.Api.Data;
using CodingAssessment.Api.Helpers;
using CodingAssessment.Api.Models;
using CodingAssessment.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Controllers
builder.Services.AddControllers();

// Configure Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\MSSQLLocalDB;Database=CodingAssessmentDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

bool isPostgres = connectionString.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
                  connectionString.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase) ||
                  connectionString.Contains("Host=", StringComparison.OrdinalIgnoreCase);

if (isPostgres)
{
    var pgConn = ConvertPostgresUriToConnectionString(connectionString);
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseNpgsql(pgConn));
}
else
{
    builder.Services.AddDbContext<ApplicationDbContext>(options =>
        options.UseSqlServer(connectionString));
}

// Configure Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Configure JWT Settings
var jwtSection = builder.Configuration.GetSection("JwtSettings");
builder.Services.Configure<JwtSettings>(jwtSection);
var jwtSettings = jwtSection.Get<JwtSettings>() ?? new JwtSettings();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.SecretKey)),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidateAudience = true,
        ValidAudience = jwtSettings.Audience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Configure Judge0 Settings
builder.Services.Configure<Judge0Settings>(builder.Configuration.GetSection("Judge0"));

// Register Application Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAssessmentService, AssessmentService>();
builder.Services.AddScoped<IQuestionService, QuestionService>();
builder.Services.AddHttpClient<IJudge0Service, Judge0Service>();
builder.Services.AddScoped<IAssessmentAttemptService, AssessmentAttemptService>();
builder.Services.AddScoped<IExecutionService, ExecutionService>();
builder.Services.AddScoped<IResultService, ResultService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        var frontendUrl = builder.Configuration["FRONTEND_URL"] ?? builder.Configuration["FrontendUrl"];
        var origins = new List<string>
        {
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
            "http://127.0.0.1:3000"
        };
        if (!string.IsNullOrEmpty(frontendUrl))
        {
            origins.Add(frontendUrl.TrimEnd('/'));
        }

        policy.WithOrigins(origins.ToArray())
              .SetIsOriginAllowed(origin =>
              {
                  if (string.IsNullOrEmpty(origin)) return false;
                  try
                  {
                      var uri = new Uri(origin);
                      return uri.Host == "localhost" ||
                             uri.Host == "127.0.0.1" ||
                             uri.Host.EndsWith(".vercel.app") ||
                             (!string.IsNullOrEmpty(frontendUrl) && origin.StartsWith(frontendUrl.TrimEnd('/')));
                  }
                  catch
                  {
                      return false;
                  }
              })
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Secure Online Coding Assessment Platform API",
        Version = "v1",
        Description = "Backend Web API for Coding Assessments, Test Case Evaluations, and Real-time Rankings"
    });

    // Add JWT Bearer Security Definition
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Auto-seed Database on startup
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    try
    {
        var context = services.GetRequiredService<ApplicationDbContext>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        await DbInitializer.SeedAsync(context, userManager, roleManager);
        logger.LogInformation("Database seeded successfully.");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while seeding the database. Ensure SQL Server is reachable.");
    }
}

// Configure HTTP request pipeline
if (app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("ENABLE_SWAGGER", true))
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Coding Assessment Platform API v1");
    });
}

app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Redirect root to Swagger
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();

static string ConvertPostgresUriToConnectionString(string rawConn)
{
    if (rawConn.StartsWith("postgres://", StringComparison.OrdinalIgnoreCase) ||
        rawConn.StartsWith("postgresql://", StringComparison.OrdinalIgnoreCase))
    {
        var uri = new Uri(rawConn);
        var userInfo = uri.UserInfo.Split(':');
        var username = Uri.UnescapeDataString(userInfo[0]);
        var password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : "";
        var database = uri.AbsolutePath.TrimStart('/');
        var port = uri.Port > 0 ? uri.Port : 5432;

        return $"Host={uri.Host};Port={port};Database={database};Username={username};Password={password};SSL Mode=Require;Trust Server Certificate=true;";
    }
    return rawConn;
}
