using CmlLib.Core.Auth.Microsoft;
using CmlLib.Core.MojangLauncher;
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


namespace minerobe.api.Services.Integration
{

    public class JavaXboxAuthService : IJavaXboxAuthService
    {
        private readonly MicrosoftAuthConfig _config;
        private readonly IUserSettingsService _userSettingsService;
        private readonly BaseDbContext _ctx;
        public JavaXboxAuthService(IOptions<MicrosoftAuthConfig> options, BaseDbContext ctx,, IUserSettingsService userSettingsService)
        {
            _config = options.Value;
            _ctx = ctx;
            _userSettingsService = userSettingsService;
        }
        public async Task<JavaXboxProfile> GetProfile(MinerobeUser user)
        {
            var app = await MsalClientHelper.BuildApplicationWithCache(_config.ClientId);
            var profileMatch = await _ctx.Set<UserXboxAccountMatching>().Where(x => x.UserId == user.Id).FirstOrDefaultAsync();
            if (profileMatch == null)
                return null;
            var integrationprofile = await _ctx.Set<JavaXboxProfile>().Where(x => x.Id == profileMatch.XboxUserId).FirstOrDefaultAsync();

            var loginHandler = JELoginHandlerBuilder.BuildDefault();

            var accounts = loginHandler.AccountManager.GetAccounts();
            var selectedAccount = accounts.GetAccount(integrationprofile.AccountId);
            if (selectedAccount == null)
                return null;

            var session = await loginHandler.Authenticate(selectedAccount);
            var profile = await GetProfileData(session, integrationprofile);

            _ctx.Set<JavaXboxProfile>().Update(profile);
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

                var matchings = new UserXboxAccountMatching
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    XboxUserId = profile.Id
                };
                _ctx.Set<UserXboxAccountMatching>().Add(matchings);
                _ctx.Set<JavaXboxProfile>().Add(profile);

                await _ctx.SaveChangesAsync();
               await  _userSettingsService.AddIntegration(user.Id,"minecraft");


                return profile;
            }

            return null;
        }
        public async Task<bool> UnLinkAccount(MinerobeUser user)
        {
            var match = await _ctx.Set<UserXboxAccountMatching>().Where(x => x.UserId == user.Id).FirstOrDefaultAsync();
            JavaXboxProfile profile= null;
            if (match == null)
                return false;
            profile = await _ctx.Set<JavaXboxProfile>().Where(x => x.Id == match.XboxUserId).FirstOrDefaultAsync();

            var app = await MsalClientHelper.BuildApplicationWithCache(_config.ClientId);
            var loginHandler = JELoginHandlerBuilder.BuildDefault();
            var accounts = loginHandler.AccountManager.GetAccounts();

            var selectedAccount = accounts.GetAccount(profile.AccountId);
            if (selectedAccount == null)
                return false;

            await loginHandler.Signout(selectedAccount);

            if (match != null)
                _ctx.Set<UserXboxAccountMatching>().Remove(match);
            if (profile != null)
                _ctx.Set<JavaXboxProfile>().Remove(profile);
            await _ctx.SaveChangesAsync();
            await  _userSettingsService.RemoveIntegration(user.Id,"minecraft");
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
                if (json["skins"] != null)
                {
                    foreach (var skin in json["skins"])
                    {
                        var skinData = new JavaXboxSkin();
                        //get texture from url
                        var textureUrl = skin["url"].ToString();
                        var textureResponse = await client.GetAsync(textureUrl);
                        var textureContent = await textureResponse.Content.ReadAsByteArrayAsync();
                        skinData.Texture = textureContent;
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
                        capeData.Texture = textureContent;
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
    }

}
