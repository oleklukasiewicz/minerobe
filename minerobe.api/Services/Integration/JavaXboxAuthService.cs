using CmlLib.Core.Auth.Microsoft;
using Microsoft.Extensions.Options;
using Microsoft.Identity.Client;
using minerobe.api.Configuration;
using minerobe.api.Services.Interface;
using XboxAuthNet.Game;
using XboxAuthNet.Game.Msal;
using XboxAuthNet.Game.OAuth;


namespace minerobe.api.Services.Integration
{
   
    public class JavaXboxAuthService : IJavaXboxAuthService
    {
        private readonly MicrosoftAuthConfig _config;
        public JavaXboxAuthService(IOptions<MicrosoftAuthConfig> options)
        {
            _config = options.Value;
        }
        public async void Authenticate()
        {
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
        }
    }
}
