namespace minerobe.api.Services.Interface
{
    public interface IJavaXboxAuthAltService
    {
        Task<dynamic> Authenticate(string code, string state);
        string BeginFlow();
        Task<dynamic> Refresh(string token);
    }
}