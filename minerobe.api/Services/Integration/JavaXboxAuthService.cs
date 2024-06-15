
using CmlLib.Core.Auth;
using CmlLib.Core.Auth.Microsoft;
using Microsoft.Identity.Client;
using minerobe.api.Services.Interface;
using XboxAuthNet.Game;
using XboxAuthNet.Game.Accounts;
using XboxAuthNet.Game.Authenticators;
using XboxAuthNet.Game.Msal;
using XboxAuthNet.Game.SessionStorages;
using XboxAuthNet.XboxLive;


namespace minerobe.api.Services.Integration
{
    public class JavaXboxAuthService : IJavaXboxAuthService
    {
        public JavaXboxAuthService()
        {

        }
        public async void Authenticate()
        {
            IPublicClientApplication? app = null;
            app = await MsalClientHelper.BuildApplicationWithCache("");
            IPublicClientApplication getApp() =>
                app ?? throw new InvalidOperationException("MSAL was not initialized yet. Set useMsal = true;");
            MSession session;

            var loginhandler= new JELoginHandlerBuilder().Build();
            var auth= loginhandler.CreateAuthenticatorWithNewAccount();
            auth.AddMsalOAuth(getApp(), msal => msal.DeviceCode(code =>
            {
                Console.WriteLine(code.Message);
                Console.WriteLine(code.VerificationUrl);
                Console.WriteLine(code.UserCode);
                return Task.CompletedTask;
            }));
            auth.AddXboxAuthForJE(xbox => xbox.Sisu(XboxGameTitles.MinecraftJava));
            auth.AddJEAuthenticator();
            session = await auth.ExecuteForLauncherAsync();

            var user = session.Username;

        }
    }
}
