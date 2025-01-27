using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using minerobe.api;
using minerobe.api.Configuration;
using minerobe.api.Database;
using minerobe.api.Hubs;
using minerobe.api.Jobs;
using minerobe.api.Modules.Core.Collection.Interface;
using minerobe.api.Modules.Core.Collection.Service;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Package.Service;
using minerobe.api.Modules.Core.Settings.Interface;
using minerobe.api.Modules.Core.Settings.Service;
using minerobe.api.Modules.Core.Social.Interface;
using minerobe.api.Modules.Core.Social.Service;
using minerobe.api.Modules.Core.User.Interface;
using minerobe.api.Modules.Core.User.Service;
using minerobe.api.Modules.Core.Wardrobe.Interface;
using minerobe.api.Modules.Core.Wardrobe.Service;
using minerobe.api.Modules.Integration.Minecraft.Interface;
using minerobe.api.Modules.Integration.Minecraft.Service;
using minerobe.api.Modules.View.Landing.Interface;
using minerobe.api.Modules.View.Landing.Service;
using minerobe.api.ServicesHelpers;
using minerobe.api.ServicesHelpers.Interface;

var builder = WebApplication.CreateBuilder(args);

//add configuiration from app settings
builder.Services.Configure<MicrosoftAuthConfig>(builder.Configuration.GetSection("MicrosoftAuth"));

// Add services to the container.

//entities and services
builder.Services.AddTransient<IUserService, UserService>();
builder.Services.AddTransient<ISocialService, SocialService>();
builder.Services.AddTransient<IPackageService, PackageService>();
builder.Services.AddTransient<ICollectionService, CollectionService>();
builder.Services.AddTransient<IWardrobeService, WardrobeService>();
builder.Services.AddTransient<IUserSettingsService, UserSettingsService>();
builder.Services.AddTransient<ILandingViewService, LandingViewService>();

// services helpers
builder.Services.AddTransient<IOutfitPackageServiceHelper, OutfitPackageServiceHelper>();

//default http client
builder.Services.AddHttpClient();

//hubs
builder.Services.AddTransient<IDefaultHub, DefaultHub>();

//integrations
builder.Services.AddTransient<IJavaXboxAuthService, JavaXboxAuthService>();

//jobs
builder.Services.AddTransient<IXboxJavaAuthRefresh, XboxJavaAuthRefresh>();

builder.Services.AddHttpContextAccessor();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.Authority = builder.Configuration["Jwt:Authority"];
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateAudience = true,
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Authority"],
        ValidateLifetime = true,
        ValidAudience = builder.Configuration["Jwt:Audience"]
    };
});

builder.Services.AddControllers();
builder.Services.AddDbContext<BaseDbContext>(options => options.UseSqlServer(builder.Configuration.GetConnectionString("BaseConnection")));
//hangfire

builder.Services.AddHangfire(config =>
{
    config.UseSimpleAssemblyNameTypeSerializer();
    config.UseRecommendedSerializerSettings();
    config.UseSqlServerStorage(builder.Configuration.GetConnectionString("BaseConnection"));
});
builder.Services.AddHangfireServer(o =>
{
    o.WorkerCount = 1;
    o.Queues = new string[] { "integration" };
    o.ServerName = "minerobe.integration";
});
builder.Services.AddHangfireServer(o =>
{
    o.WorkerCount = 1;
    o.Queues = new string[] { "default" };
    o.ServerName = "minerobe";
});
//signalr
builder.Services.AddSignalR();

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme()
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement()
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHangfireDashboard("/hf");
app.MapHangfireDashboard();
app.StartJobs();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.UseStaticFiles();
app.MapHub<DefaultHub>("/ws");

app.Run();

//hangfire
