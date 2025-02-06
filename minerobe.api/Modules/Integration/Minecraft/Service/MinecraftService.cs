using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using Microsoft.Identity.Client.Extensions.Msal;
using minerobe.api.Configuration;
using minerobe.api.Database;
using minerobe.api.Helpers;
using minerobe.api.Hubs;
using minerobe.api.Modules.Core.Package.Entity;
using minerobe.api.Modules.Core.Package.Interface;
using minerobe.api.Modules.Core.Settings.Entity;
using minerobe.api.Modules.Core.Settings.Interface;
using minerobe.api.Modules.Core.User.Entity;
using minerobe.api.Modules.Integration.Minecraft.Entity;
using minerobe.api.Modules.Integration.Minecraft.Helpers;
using minerobe.api.Modules.Integration.Minecraft.Interface;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Png;
using System.Net.Http.Headers;
using System.Text;
namespace minerobe.api.Modules.Integration.Minecraft.Service
{
    public enum MojangAuthStatus
    {
        Failed,
        Success,
        ConnectingToMojang,
        AuthorizedInMs,
        ConnectingToXbox,
        ConnectingToMs,
        AwaitingUserInput
    }
    public class MinecraftService : IMinecraftService
    {
        private readonly MicrosoftAuthConfig _config;
        private readonly IUserSettingsService _userSettingsService;
        private readonly IPackageService _packageService;
        private readonly BaseDbContext _ctx;
        private readonly IDefaultHub _defaultHub;
        private readonly HttpClient _http;
        private const string authMessageHeader = "linkToMc";
        public MinecraftService(IOptions<MicrosoftAuthConfig> options, BaseDbContext ctx, IUserSettingsService userSettingsService, IPackageService packageService, IDefaultHub defaultHub, IHttpClientFactory httpClientFactory)
        {
            _config = options.Value;
            _ctx = ctx;
            _userSettingsService = userSettingsService;
            _packageService = packageService;
            _defaultHub = defaultHub;
            _http = httpClientFactory.CreateClient();
        }
        public async Task<MinecraftAccount> LinkAccount(MinerobeUser user)
        {
            await UnLinkAccount(user);
            var auth = await Authenticate(user.Id);

            if (auth != null)
            {
                var profile = new MinecraftAccount();
                profile.Id = Guid.NewGuid();
                profile.AccountId = auth.AccountId;
                profile.Profile = await GetProfileData(auth.Token);


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

            var profileData = ((object)profile.Data).ToClass<MinecraftAccount>();
            if (profile != null)
                _ctx.Set<IntegrationItem>().Remove(profile);

            await _ctx.SaveChangesAsync();
            await _userSettingsService.RemoveIntegration(user.Id, "minecraft");

            var pca = await GetPca();
            var selectedAccount = await pca.GetAccountAsync(profileData.AccountId);
            if (selectedAccount == null)
                return false;

            await pca.RemoveAsync(selectedAccount);
            return true;
        }
        public async Task<string> RefreshAllTokens()
        {
            var pca = await GetPca();
            var accountsEnum = await pca.GetAccountsAsync();
            var accounts = accountsEnum.ToList();
            var result = "";
            for (int i = 0; i < accounts.Count; i++)
            {
                var account = accounts.ElementAt(i);
                result += await Refresh(account.HomeAccountId.Identifier) + ", ";
            }
            return $"Refreshed: ({accounts.Count}) - {result}";
        }

        //requests
        private async Task<MinecraftProfile> GetProfileData(string token)
        {
            var profile = new MinecraftProfile();
            try
            {
                var url = "https://api.minecraftservices.com/minecraft/profile";

                var request = new HttpRequestMessage(HttpMethod.Get, url);

                request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
                var response = await _http.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);

                if (json["id"] == null)
                    return profile;

                profile.UUID = json["id"].ToString();
                profile.Username = json["name"].ToString();
                profile.Skins = new List<MinecraftSkin>();
                profile.Capes = new List<MinecraftCape>();

                if (json["skins"] != null)
                {
                    for (var i = 0; i < json["skins"].Count(); i++)
                    {
                        var skin = json["skins"][i];
                        var skinData = new MinecraftSkin();
                        //get texture from url
                        var textureUrl = skin["url"].ToString();
                        var textureRequest = new HttpRequestMessage(HttpMethod.Get, textureUrl);

                        var textureResponse = await _http.SendAsync(textureRequest);
                        var textureContent = await textureResponse.Content.ReadAsByteArrayAsync();
                        skinData.Texture = "data:image/png;base64," + Convert.ToBase64String(textureContent);
                        skinData.Id = Guid.Parse(skin["id"].ToString());
                        skinData.Model = (skin["variant"].ToString().ToUpper() == "CLASSIC" ? ModelType.Steve : ModelType.Alex).ToString();
                        profile.Skins.Add(skinData);
                        if (skin["state"].ToString().ToUpper() == "ACTIVE")
                        {
                            profile.CurrentSkinId = skinData.Id;
                        }
                    }
                }
                if (json["capes"] != null)
                {
                    for (var i = 0; i < json["capes"].Count(); i++)
                    {
                        var cape = json["capes"][i];
                        var capeData = new MinecraftCape();
                        //get texture from url
                        var textureUrl = cape["url"].ToString();
                        var textureResponse = await _http.GetAsync(textureUrl);
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
            catch (Exception)
            {
                return profile;
            }
            return profile;
        }
        public async Task<MinecraftAccount> GetProfile(MinerobeUser user, bool keepFresh = true)
        {
            var integrationprofile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == user.Id && x.Type == "minecraft").FirstOrDefaultAsync();
            if (integrationprofile == null)
                return null;

            var data = ((object)integrationprofile.Data).ToClass<MinecraftAccount>();

            if (!keepFresh)
                return data;
            try
            {
                var token = await GetTokenFromCache(data.AccountId);
                if (token == null)
                    return data;
                var profile = await GetProfileData(token);

                data.Profile = profile;
                integrationprofile.Data = data;

                _ctx.Set<IntegrationItem>().Update(integrationprofile);
                var settings = await _ctx.UserSettings.Where(x => x.OwnerId == user.Id).FirstOrDefaultAsync();
                if (settings.CurrentTexture != null)
                    settings.CurrentTexture.CapeId = profile.CurrentCapeId;
                _ctx.UserSettings.Update(settings);
                await _ctx.SaveChangesAsync();
            }
            catch (Exception)
            {
                return data;
            }
            return data;
        }
        public async Task<bool> SetUserSkin(Guid userId, OutfitPackageConfig config)
        {
            var token = await GetTokenFromCacheByUserId(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/skins";
            var settings = await _userSettingsService.GetSettings(userId);
            if (settings.CurrentTexture == null)
                return false;

            var currentpackage = await _packageService.GetById(settings.CurrentTexture.PackageId);
            var mergedtexture = await ImageMerger.MergeFromConfig(currentpackage, settings.CurrentTexture, settings.BaseTexture.Layers[0]);
            //convert into bytes
            byte[] mergedTextureBytes;
            using (var ms = new MemoryStream())
            {
                await mergedtexture.SaveAsPngAsync(ms);
                mergedTextureBytes = ms.ToArray();
            }

            var form = new MultipartFormDataContent();

            var file = new ByteArrayContent(mergedTextureBytes);
            file.Headers.ContentType = new MediaTypeHeaderValue("image/png");

            form.Add(file, "file", currentpackage.Name + ".png");
            form.Add(new StringContent(config.Model == ModelType.Steve ? "classic" : "slim"), "variant");

            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = form;

            var response = await _http.SendAsync(request);
            var responseString = await response.Content.ReadAsStringAsync();

            return response.IsSuccessStatusCode;
        }
        public async Task<bool> SetUserCape(Guid userId, Guid capeId)
        {
            var token = await GetTokenFromCacheByUserId(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/capes/active";
            var body = new
            {
                capeId
            };
            var request = new HttpRequestMessage(HttpMethod.Put, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            request.Content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");

            var response = await _http.SendAsync(request);
            return response.IsSuccessStatusCode;
        }
        public async Task<bool> HideUserCape(Guid userId)
        {
            var token = await GetTokenFromCacheByUserId(userId);
            var url = "https://api.minecraftservices.com/minecraft/profile/capes/active";
            var request = new HttpRequestMessage(HttpMethod.Delete, url);
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
            var response = await _http.SendAsync(request);
            return response.IsSuccessStatusCode;
        }

        //helpers class
        public class FlowAuthentication
        {
            public string Token { get; set; }
            public string MsalToken { get; set; }
            public string AccountId { get; set; }
            public DateTime RetrievedAt { get; set; }
            public FlowStatus Status { get; set; }
        }
        public class FlowStatus
        {
            public MojangAuthStatus Status { get; set; }
            public bool IsSuccess { get; set; }
        }
        public class FlowStep
        {
            public FlowStatus Status { get; set; }
            public dynamic Data { get; set; }
            public FlowStep(FlowStatus status, dynamic data = null)
            {

                Status = status;
                Data = data;
            }
            public FlowStep()
            {

            }
            public FlowStepResponseModel ToResponseModel()
            {
                return new FlowStepResponseModel()
                {
                    Status = Status.Status.ToString(),
                    IsSuccess = Status.IsSuccess,
                    Data = Data
                };
            }
        }
        public class FlowStepResponseModel
        {
            public string Status { get; set; }
            public bool IsSuccess { get; set; }
            public dynamic Data { get; set; }
        }

        //authorize flow
        public async Task<FlowAuthentication> Authenticate(Guid userId)
        {
            var status = new FlowStatus() { Status = MojangAuthStatus.ConnectingToMs, IsSuccess = true };
            try
            {
                //connecting to ms
                IPublicClientApplication pca = await GetPca();
                await _defaultHub.SendMessage(userId, authMessageHeader, new FlowStep(status).ToResponseModel());

                var msalTokenRequest = await pca.AcquireTokenWithDeviceCode(new string[] { "XboxLive.SignIn", "XboxLive.offline_access" }, fallback =>
                {
                    status.Status = MojangAuthStatus.AwaitingUserInput;

                    var message = new { fallback.UserCode, fallback.VerificationUrl };
                    _defaultHub.SendMessage(userId, authMessageHeader, new FlowStep(status, message).ToResponseModel());

                    return Task.FromResult(0);
                }).ExecuteAsync();

                var accountId = msalTokenRequest.Account.HomeAccountId.Identifier;
                var msalToken = msalTokenRequest.AccessToken;
                var msalTokenExpireOn = msalTokenRequest.ExpiresOn;
                if (msalToken == null)
                    throw new Exception("Failed to authorize to ms");

                //connecting to xbox
                status.Status = MojangAuthStatus.ConnectingToXbox;
                await _defaultHub.SendMessage(userId, authMessageHeader, new FlowStep(status).ToResponseModel());
                var xstsToken = await AuthorizeToXbox(msalToken);
                if (xstsToken == null)
                    throw new Exception("Failed to authorize to xbox");

                var token = xstsToken.token.ToString();
                var uhs = xstsToken.uhs.ToString();

                //connecting to mojang
                status.Status = MojangAuthStatus.ConnectingToMojang;
                await _defaultHub.SendMessage(userId, authMessageHeader, new FlowStep(status).ToResponseModel());
                var accessToken = await AuthorizeToMinecraftServices(token, uhs);
                if (accessToken == null)
                    throw new Exception("Failed to authorize to mojang");

                status.Status = MojangAuthStatus.Success;
                await _defaultHub.SendMessage(userId, authMessageHeader, new FlowStep(status).ToResponseModel());

                return new FlowAuthentication() { Token = accessToken, MsalToken = msalToken, RetrievedAt = DateTime.Now, AccountId = accountId, Status = status };
            }
            catch (Exception)
            {
                status.IsSuccess = false;
                await _defaultHub.SendMessage(userId, authMessageHeader, new FlowStep(status).ToResponseModel());
                return new FlowAuthentication() { Status = status };
            }
        }
        private async Task<dynamic> AuthorizeToXbox(string token)
        {

            var xstsUrl = "https://user.auth.xboxlive.com/user/authenticate";
            var xtstBody = new
            {
                RelyingParty = "http://auth.xboxlive.com",
                TokenType = "JWT",
                Properties = new
                {
                    AuthMethod = "RPS",
                    SiteName = "user.auth.xboxlive.com",
                    RpsTicket = "d=" + token
                }
            };
            var xstsRequest = new HttpRequestMessage(HttpMethod.Post, xstsUrl);
            xstsRequest.Content = new StringContent(JsonConvert.SerializeObject(xtstBody), Encoding.UTF8, "application/json");
            var xstsResponse = await _http.SendAsync(xstsRequest);
            var xstsContent = await xstsResponse.Content.ReadAsStringAsync();
            var xstsJson = JObject.Parse(xstsContent);
            var xstsToken = xstsJson["Token"].ToString();

            //aquire xsts token
            var xstsAuthorizeUrl = "https://xsts.auth.xboxlive.com/xsts/authorize";
            var xstsAuthorizeBody = new
            {
                RelyingParty = "rp://api.minecraftservices.com/",
                TokenType = "JWT",
                Properties = new
                {
                    SandboxId = "RETAIL",
                    UserTokens = new string[] { xstsToken }
                }
            };
            var xstsTokenRequest = new HttpRequestMessage(HttpMethod.Post, xstsAuthorizeUrl);
            xstsTokenRequest.Content = new StringContent(JsonConvert.SerializeObject(xstsAuthorizeBody), Encoding.UTF8, "application/json");
            var xstsTokenResponse = await _http.SendAsync(xstsTokenRequest);
            var xstsTokenContent = await xstsTokenResponse.Content.ReadAsStringAsync();
            var xstsTokenJson = JObject.Parse(xstsTokenContent);

            var xstsAuthorizeToken = xstsTokenJson["Token"];
            if (xstsAuthorizeToken == null)
                return null;

            var uhs = xstsTokenJson["DisplayClaims"]["xui"][0]["uhs"].ToString();

            return new { token = xstsAuthorizeToken, uhs };
        }
        private async Task<string> AuthorizeToMinecraftServices(string token, string uhs)
        {
            var url = "https://api.minecraftservices.com/authentication/login_with_xbox";
            var body = new
            {
                identityToken = "XBL3.0 x=" + uhs + ";" + token
            };
            var request = new HttpRequestMessage(HttpMethod.Post, url);
            request.Content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");
            var response = await _http.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();
            var json = JObject.Parse(content);

            var accessToken = json["access_token"];
            if (accessToken == null)
                return null;

            return accessToken.ToString();
        }

        //refresh flow
        public async Task<string> Refresh(string accountId)
        {
            var pca = await GetPca();
            var account = await pca.GetAccountAsync(accountId);
            if (account == null)
                return null;
            var token = await pca.AcquireTokenSilent(new string[] { "XboxLive.SignIn", "XboxLive.offline_access" }, account).ExecuteAsync();
            return token.ExpiresOn.ToString();
        }

        //token cache
        public async Task<string> GetTokenFromCache(string accountId)
        {
            var pca = await GetPca();
            var account = await pca.GetAccountAsync(accountId);
            if (account == null)
                return null;
            var token = await pca.AcquireTokenSilent(new string[] { "XboxLive.SignIn", "XboxLive.offline_access" }, account).ExecuteAsync();

            var msalToken = token.AccessToken;
            var msalTokenExpireOn = token.ExpiresOn;

            var xstsToken = await AuthorizeToXbox(msalToken);
            if (xstsToken == null)
                return null;

            var xsts = xstsToken.token.ToString();
            var uhs = xstsToken.uhs.ToString();
            var accessToken = await AuthorizeToMinecraftServices(xsts, uhs);
            return accessToken;
        }
        public async Task<string> GetTokenFromCacheByUserId(Guid userId)
        {
            var profile = await _ctx.Set<IntegrationItem>().Where(x => x.OwnerId == userId && x.Type == "minecraft").FirstOrDefaultAsync();
            if (profile == null)
                return null;
            var profileData = ((object)profile.Data).ToClass<MinecraftAccount>();
            return await GetTokenFromCache(profileData.AccountId);
        }

        //pca helper
        public async Task<IPublicClientApplication> GetPca()
        {
            var pca = PublicClientApplicationBuilder
                .Create(_config.ClientId)
                .WithAuthority("https://login.microsoftonline.com/consumers")
                .WithDefaultRedirectUri()
                .Build();

            var storage = new StorageCreationPropertiesBuilder(_config.CacheFileName, Path.Combine(".cache", _config.CacheDirectory))
               .WithCacheChangedEvent(_config.ClientId, "https://login.microsoftonline.com/consumers")
               .WithLinuxUnprotectedFile()
               .Build();
            var cacheHelper = await MsalCacheHelper.CreateAsync(storage);

            cacheHelper.RegisterCache(pca.UserTokenCache);

            return pca;
        }
    }
}
