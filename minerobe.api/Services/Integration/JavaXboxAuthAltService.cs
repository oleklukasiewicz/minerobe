using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.Extensions.Options;
using minerobe.api.Configuration;
using minerobe.api.Services.Interface;
using Newtonsoft.Json.Linq;
using System.Text;
using System.Text.Json;

namespace minerobe.api.Services.Integration
{
    public class JavaXboxAuthAltService : IJavaXboxAuthAltService
    {
        private readonly MicrosoftAuthConfig _config;
        public JavaXboxAuthAltService(IOptions<MicrosoftAuthConfig> config)
        {
            _config = config.Value;
        }
        public string BeginFlow()
        {

            var url = $"https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize?client_id={_config.ClientId}&response_type=code&redirect_uri={_config.RedirectEndpoint}&response_mode=query&scope=XboxLive.signin&state=12345&prompt=select_account&code_challenge={_config.CodeVerifier}";

            return url;
        }
        public async Task<dynamic> Authenticate(string code, string state)
        {
            var url = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
            var body = $"client_id={_config.ClientId}&code={code}&grant_type=authorization_code&redirect_uri={_config.RedirectEndpoint}&code_verifier={_config.CodeVerifier}&scope=XboxLive.signin";


            var httpClient = new System.Net.Http.HttpClient();

            httpClient.BaseAddress = new System.Uri(url);
            HttpRequestMessage request = new HttpRequestMessage(HttpMethod.Post, "");
            request.Headers.Add("Origin", _config.OriginUri);
            request.Content = new StringContent(body, Encoding.UTF8, "application/x-www-form-urlencoded");

            var response = await httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();
            var bearerToken = JObject.Parse(content);
            var token = bearerToken["access_token"];

            var profile = await AuthorizeToXboxServices(token.ToString());

            return profile;
        }

        private async Task<dynamic> AuthorizeToXboxServices(string token)
        {
            //xtst tokens
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

            var xstsHttpClient = new System.Net.Http.HttpClient();
            var xstxResponse = await xstsHttpClient.PostAsync(xstsUrl, new StringContent(JsonSerializer.Serialize(xtstBody), Encoding.UTF8, "application/json"));
            var xstsContent = await xstxResponse.Content.ReadAsStringAsync();
            var xstsToken = JObject.Parse(xstsContent)["Token"];

            //xsts authorize
            var xstsAuthorizeUrl = "https://xsts.auth.xboxlive.com/xsts/authorize";
            var xstsAuthorizeBody = new
            {
                RelyingParty = "rp://api.minecraftservices.com/",
                TokenType = "JWT",
                Properties = new
                {
                    SandboxId = "RETAIL",
                    UserTokens = new string[] { xstsToken.ToString() }
                }
            };
            var xstsAuthorizeHttpClient = new System.Net.Http.HttpClient();
            var xstsAuthorizeResponse = await xstsAuthorizeHttpClient.PostAsync(xstsAuthorizeUrl, new StringContent(JsonSerializer.Serialize(xstsAuthorizeBody), Encoding.UTF8, "application/json"));
            var xstsAuthorizeContent = await xstsAuthorizeResponse.Content.ReadAsStringAsync();
            var xstsAuthorizeToken = JObject.Parse(xstsAuthorizeContent)["Token"];
            var uhs = JObject.Parse(xstsAuthorizeContent)["DisplayClaims"]["xui"][0]["uhs"];

            //logging into minecraftservices
            var minecraftLoginUrl = "https://api.minecraftservices.com/authentication/login_with_xbox";
            var minecraftLoginBody = new
            {
                identityToken = "XBL3.0 x=" + uhs+";"+ xstsAuthorizeToken,
            };
            var minecraftLoginHttpClient = new System.Net.Http.HttpClient();
            minecraftLoginHttpClient.DefaultRequestHeaders.Add("Origin", _config.OriginUri);
            var minecraftLoginResponse = await minecraftLoginHttpClient.PostAsync(minecraftLoginUrl, new StringContent(JsonSerializer.Serialize(minecraftLoginBody), Encoding.UTF8, "application/json"));
            var minecraftLoginContent = await minecraftLoginResponse.Content.ReadAsStringAsync();
            var minecraftLoginToken = JObject.Parse(minecraftLoginContent)["access_token"];

            //getting profile
            var profileUrl = "https://api.minecraftservices.com/minecraft/profile";
            var profileHttpClient = new System.Net.Http.HttpClient();
            profileHttpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {minecraftLoginToken}");
            var profileResponse = await profileHttpClient.GetAsync(profileUrl);
            var profileContent = await profileResponse.Content.ReadAsStringAsync();

            return JObject.Parse(profileContent);
        }

        public async Task<dynamic> Refresh(string token)
        {
            var urlRefersh = "https://login.microsoftonline.com/consumers/oauth2/v2.0/token";
            var bodyRefresh = $"client_id={_config.ClientId}&refresh_token={token}&grant_type=refresh_token";
            var httpClient = new System.Net.Http.HttpClient();
            httpClient.DefaultRequestHeaders.Add("Origin", _config.OriginUri);
            var response = await httpClient.PostAsync(urlRefersh, new StringContent(bodyRefresh, Encoding.UTF8, "application/x-www-form-urlencoded"));
            var content = await response.Content.ReadAsStringAsync();
            var bearerToken = JObject.Parse(content);
            var newToken = bearerToken["access_token"];

            var profile = await AuthorizeToXboxServices(newToken.ToString());
            return profile;
        }
    }
}
