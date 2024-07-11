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


namespace minerobe.api.Services.Integration
{

    public class JavaXboxAuthService : IJavaXboxAuthService
    {
        private readonly MicrosoftAuthConfig _config;
        private readonly BaseDbContext _ctx;
        public JavaXboxAuthService(IOptions<MicrosoftAuthConfig> options,BaseDbContext ctx)
        {
            _config = options.Value;
            _ctx = ctx;
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
        public async Task<JavaXboxProfile> LinkAccount(MinerobeUser user)
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
            //get user profgfile
           Mojang mojang = new Mojang(new HttpClient());
           var profile = await mojang.GetProfileUsingAccessToken(session.AccessToken);
            //add support for capes

            var integrationprofile = new JavaXboxProfile();

            if(profile?.UUID != null )
            {
                integrationprofile.AccountId = Guid.NewGuid();
                integrationprofile.Username = profile.Name;
                //add skins and capes

                _ctx.Set<JavaXboxProfile>().Add(integrationprofile);

                var matchings = new UserXboxAccountMatching
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    XboxUserId = integrationprofile.AccountId
                };
                _ctx.Set<UserXboxAccountMatching>().Add(matchings);
                await _ctx.SaveChangesAsync();
            }

            return integrationprofile;
        }
    }
}
