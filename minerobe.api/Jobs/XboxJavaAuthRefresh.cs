using Hangfire;
using minerobe.api.Modules.Integration.Minecraft.Interface;

namespace minerobe.api.Jobs
{
    [Queue("integration")]
    public interface IXboxJavaAuthRefresh
    {
        public Task<string> Refresh();
    }
    public class XboxJavaAuthRefresh : IXboxJavaAuthRefresh
    {
        IMinecraftService _javaXboxAuthService;
        public XboxJavaAuthRefresh(IMinecraftService javaXboxAuthService)
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
