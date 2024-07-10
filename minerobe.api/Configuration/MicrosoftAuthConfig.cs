namespace minerobe.api.Configuration
{
    public class MicrosoftAuthConfig
    {
        public string ClientId { get; set; }
        public string CodeVerifier { get; set; }
        public string RedirectEndpoint { get; set; }
        public string OriginUri { get; set; }
    }
}
