using CmlLib.Core.Auth.Microsoft;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using minerobe.api.Configuration;
using minerobe.api.Entity.User;
using minerobe.api.Services.Interface;
using System.ComponentModel;
using XboxAuthNet.Game;
using XboxAuthNet.Game.Msal;
using XboxAuthNet.Game.OAuth;
using MojangAPI;
using MojangAPI.Model;
using minerobe.api.Entity.Integration;
using minerobe.api.Database;
using CmlLib.Core.Auth;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;
using Newtonsoft.Json.Linq;
using System.Text;
using minerobe.api.Entity.Package;
using Newtonsoft.Json;
using minerobe.api.Helpers;
using minerobe.api.Entity.Settings;
namespace minerobe.api.Services.Integration
{
    public class JavaXboxAuthService : IJavaXboxAuthService
    {
        private readonly MicrosoftAuthConfig _config;
        private readonly IUserSettingsService _userSettingsService;
        private readonly BaseDbContext _ctx;
        public JavaXboxAuthService(IOptions<MicrosoftAuthConfig> options, BaseDbContext ctx, IUserSettingsService userSettingsService)
        {
            _config = options.Value;
            _ctx = ctx;
            _userSettingsService = userSettingsService;
        }
        public async Task<JavaXboxProfile> GetProfile(MinerobeUser user)
        {
            var integrationprofile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == user.Id && x.Type == "minecraft").FirstOrDefaultAsync();
            if (integrationprofile == null)
                return null;
            var session = await GetUserSession(user.Id);
            var profile = await GetProfileData(session, ((object)integrationprofile.Data).ToClass<JavaXboxProfile>());
            integrationprofile.Data = profile;

            _ctx.Set<IntegrationItem>().Update(integrationprofile);
            await _ctx.SaveChangesAsync();
            return profile;
        }
        public async Task<JavaXboxProfile> LinkAccount(MinerobeUser user)
        {
            await UnLinkAccount(user);
            var app = await MsalClientHelper.BuildApplicationWithCache(_config.ClientId);
            var loginHandler = JELoginHandlerBuilder.BuildDefault();

            var authenticator = loginHandler.CreateAuthenticatorWithNewAccount(default);
            authenticator.AddMsalOAuth(app, msal => msal.DeviceCode(deviceCode =>
            {
                Console.WriteLine(deviceCode.VerificationUrl);
                Console.WriteLine(deviceCode.UserCode);
                return Task.CompletedTask;
            }));
            authenticator.AddXboxAuthForJE(xbox => xbox.Basic());
            authenticator.AddJEAuthenticator();
            var session = await authenticator.ExecuteForLauncherAsync();

            var selectedAccount = loginHandler.AccountManager.GetDefaultAccount();

            if (session.AccessToken != null)
            {
                var profile = new JavaXboxProfile();
                profile.Id = Guid.NewGuid();
                profile.AccountId = selectedAccount.Identifier;
                profile = await GetProfileData(session, profile);

                var integration = new IntegrationItem()
                {
                    Id = Guid.NewGuid(),
                    OwnerId = user.Id,
                    Type = "minecraft",
                    Data = profile
                };
                _ctx.Set<IntegrationItem>().Add(integration);

                await _ctx.SaveChangesAsync();
                await _userSettingsService.AddIntegration(user.Id, new IntegrationMatching()
                {
                    Id = integration.Id,
                    Type = "minecraft"
                });

                return profile;
            }

            return null;
        }
        public async Task<bool> UnLinkAccount(MinerobeUser user)
        {
            var profile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == user.Id && x.Type == "minecraft").FirstOrDefaultAsync();
            if (profile == null)
                return false;

            var app = await MsalClientHelper.BuildApplicationWithCache(_config.ClientId);
            var loginHandler = JELoginHandlerBuilder.BuildDefault();
            var accounts = loginHandler.AccountManager.GetAccounts();

            var profileData = ((object)profile.Data).ToClass<JavaXboxProfile>();

            var selectedAccount = accounts.GetAccount(profileData.AccountId);
            if (selectedAccount == null)
                return false;

            await loginHandler.Signout(selectedAccount);

            if (profile != null)
                _ctx.Set<IntegrationItem>().Remove(profile);

            await _ctx.SaveChangesAsync();
            await _userSettingsService.RemoveIntegration(user.Id, "minecraft");
            return true;
        }
        public async Task<string> GetUserCurrentSkin(Guid userId)
        {
            var settings = await _ctx.UserSettings.Where(x => x.OwnerId == userId).FirstOrDefaultAsync();
            if (settings == null)
                return null;
            var texture = settings.CurrentTexture.Texture;
            return Encoding.UTF8.GetString(texture);
        }
        public async Task<bool> SetUserSkin(Guid userId, ModelType model)
        {
            var session = await GetUserSession(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/skins";
            var body = new
            {
                variant = model == ModelType.Steve ? "classic" : "slim",
                url = _config.OriginUri + "/JavaXboxAuth/SkinTexture/" + userId
            };
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
            var response = await client.PostAsJsonAsync(url, body);
            return response.IsSuccessStatusCode;
        }
        public async Task<bool> SetUserCape(Guid userId, Guid capeId)
        {
            var session = await GetUserSession(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/capes/active";
            var body = new
            {
                capeId = capeId
            };
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
            var response = await client.PutAsJsonAsync(url, body);
            return response.IsSuccessStatusCode;
        }
        public async Task<bool> HideUserCape(Guid userId)
        {
            var session = await GetUserSession(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/capes/active";
            var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
            var response = await client.DeleteAsync(url);
            return response.IsSuccessStatusCode;
        }
        private async Task<MSession> GetUserSession(Guid userId)
        {
            var integrationprofile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == userId && x.Type == "minecraft").FirstOrDefaultAsync();
            if (integrationprofile == null)
                return null;

            var loginHandler = JELoginHandlerBuilder.BuildDefault();


            var profileData = ((object)integrationprofile.Data).ToClass<JavaXboxProfile>();

            var app = await MsalClientHelper.BuildApplicationWithCache(_config.ClientId);
            var accounts = loginHandler.AccountManager.GetAccounts();
            var selectedAccount = accounts.GetAccount(profileData.AccountId);
            if (selectedAccount == null)
                return null;

            var authenticator = loginHandler.CreateAuthenticator(selectedAccount, default);
            authenticator.AddMsalOAuth(app, msal => msal.Silent());
            authenticator.AddXboxAuthForJE(xbox => xbox.Basic());
            authenticator.AddJEAuthenticator();
            var session = await authenticator.ExecuteForLauncherAsync();
            return session;
        }
        public async Task<List<UserExpiration>>GetUsersExpirationsDates()
        {
            var profiles = await _ctx.Set<IntegrationItem>().Where(x => x.Type == "minecraft").ToListAsync();

            var expList=new List<UserExpiration>();

            var loginHandler = JELoginHandlerBuilder.BuildDefault();
            var accounts = loginHandler.AccountManager.GetAccounts();

            foreach (var profile in profiles)
            {
                var profileData = ((object)profile.Data).ToClass<JavaXboxProfile>();
                var accountId = profileData.AccountId;
                
                var account=accounts.GetAccount(accountId);
               
                expList.Add(new UserExpiration
                {
                    UserId = profile.OwnerId,
                });
            }
            return expList;
        }

        public async Task<string> RefreshToken(Guid userId)
        {
            var integrationprofile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == userId && x.Type == "minecraft").FirstOrDefaultAsync();
            if (integrationprofile == null)
                return null;
            var profileData = ((object)integrationprofile.Data).ToClass<JavaXboxProfile>();
            var app = await MsalClientHelper.BuildApplicationWithCache(_config.ClientId);
            
            var loginHandler = JELoginHandlerBuilder.BuildDefault();       
            var accounts = loginHandler.AccountManager.GetAccounts();

            var selectedAccount = accounts.GetAccount(profileData.AccountId);
            if (selectedAccount == null)
                return null;

            var authenticator = loginHandler.CreateAuthenticator(selectedAccount, default);
            authenticator.AddMsalOAuth(app, msal => msal.Silent());
            authenticator.AddXboxAuthForJE(xbox => xbox.Basic());
            authenticator.AddJEAuthenticator();
            var session = await authenticator.ExecuteForLauncherAsync();
            return "Token Updated";
        }
        private async Task<JavaXboxProfile> GetProfileData(MSession session, JavaXboxProfile profile)
        {
            Mojang mojang = new Mojang(new HttpClient());
            var mojangData = await mojang.GetProfileUsingAccessToken(session.AccessToken);
            if (mojangData?.UUID != null)
            {

                var url = "https://api.minecraftservices.com/minecraft/profile";
                var client = new HttpClient();
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", session.AccessToken);
                var response = await client.GetAsync(url);
                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);

                profile.UUID = mojangData.UUID;
                profile.Username = mojangData.Name;
                profile.Skins = new List<JavaXboxSkin>();
                profile.Capes = new List<JavaXboxCape>();
                var dataClient = new HttpClient();
                if (json["skins"] != null)
                {
                    foreach (var skin in json["skins"])
                    {
                        var skinData = new JavaXboxSkin();
                        //get texture from url
                        var textureUrl = skin["url"].ToString();
                        var textureResponse = await dataClient.GetAsync(textureUrl);
                        var textureContent = await textureResponse.Content.ReadAsByteArrayAsync();
                        skinData.Texture = "data:image/png;base64," + Convert.ToBase64String(textureContent);
                        skinData.Id = Guid.Parse(skin["id"].ToString());
                        profile.Skins.Add(skinData);
                        if (skin["state"].ToString().ToUpper() == "ACTIVE")
                        {
                            profile.CurrentSkinId = skinData.Id;
                        }
                    }
                }
                if (json["capes"] != null)
                {
                    foreach (var cape in json["capes"])
                    {
                        var capeData = new JavaXboxCape();
                        //get texture from url
                        var textureUrl = cape["url"].ToString();
                        var textureResponse = await client.GetAsync(textureUrl);
                        var textureContent = await textureResponse.Content.ReadAsByteArrayAsync();
                        capeData.Texture = "data:image/png;base64," + Convert.ToBase64String(textureContent);
                        capeData.Id = Guid.Parse(cape["id"].ToString());
                        capeData.Name = cape["alias"].ToString();
                        profile.Capes.Add(capeData);
                        if (cape["state"].ToString().ToUpper() == "ACTIVE")
                        {
                            profile.CurrentCapeId = capeData.Id;
                        }
                    }
                }

            }
            return profile;
        }


        //helpers class
        public class UserExpiration
        {
            public Guid UserId { get; set; }
            public DateTime Expiration { get; set; }
        }
    }
}
