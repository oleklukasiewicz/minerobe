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
            var state = await _javaXboxAuthService.RefreshAllTokens();
            return state;
        }
    }
}
