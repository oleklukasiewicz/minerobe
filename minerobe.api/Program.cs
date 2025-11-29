using Hangfire;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using minerobe.api;
using minerobe.api.Configuration;
using minerobe.api.Database;
using minerobe.api.Hubs;
using minerobe.api.Jobs;
using minerobe.api.Modules.Core.Collection.Interface;
using minerobe.api.Modules.Core.Collection.Service;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Package.Service;
using minerobe.api.Modules.Core.PackageAgregation.Interface;
using minerobe.api.Modules.Core.PackageAgregation.Service;
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
using System.IO.Compression;

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
builder.Services.AddTransient<IOutfitPackageAgregationService, OutfitPackageAgregationService>();
builder.Services.AddTransient<ILandingViewService, LandingViewService>();

//default http client
builder.Services.AddHttpClient();

//hubs
builder.Services.AddTransient<IDefaultHub, DefaultHub>();

//integrations
builder.Services.AddTransient<IMinecraftService, MinecraftService>();

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
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme()
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme"
    });
    c.AddSecurityDefinition("bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });
    c.AddSecurityRequirement(doc => new OpenApiSecurityRequirement
    {
        [
            new OpenApiSecuritySchemeReference("bearer", doc)
            ]
            = []
    });

});
builder.Services.AddResponseCompression((options) =>
{
    options.Providers.Add<GzipCompressionProvider>();
});
builder.Services.Configure<GzipCompressionProviderOptions>(options =>
{
    options.Level = CompressionLevel.Fastest;
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

app.UseResponseCompression();

app.UseStaticFiles();
app.MapHub<DefaultHub>("/ws");

app.Run();

//hangfire
