using Hangfire;

namespace minerobe.api
{
    public static class JobsConfig
    {
        public static void StartJobs(this IApplicationBuilder app)
        {
            RecurringJob.AddOrUpdate<minerobe.api.Jobs.IXboxJavaAuthRefresh>("xboxJavaRefresh", x => x.Refresh(), "*/30 * * * *");
        }
    }
}
