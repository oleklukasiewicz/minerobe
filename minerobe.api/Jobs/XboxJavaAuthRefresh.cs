using minerobe.api.Services.Interface;

namespace minerobe.api.Jobs
{
    public interface IXboxJavaAuthRefresh
    {
        public Task<string> Refresh();
    }
    public class XboxJavaAuthRefresh : IXboxJavaAuthRefresh
    {
        IJavaXboxAuthService _javaXboxAuthService;
        public XboxJavaAuthRefresh(IJavaXboxAuthService javaXboxAuthService)
        {
            _javaXboxAuthService = javaXboxAuthService;
        }
        public async Task<string> Refresh()
        {
            var list = await _javaXboxAuthService.GetUsersExpirationsDates();
            foreach (var user in list)
            {
                await _javaXboxAuthService.RefreshToken(user.UserId);
            }
            return "Refreshed";
        }
    }
}
