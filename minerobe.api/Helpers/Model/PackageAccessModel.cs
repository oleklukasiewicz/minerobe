namespace minerobe.api.Helpers.Model
{
    public class PackageAccessModel
    {
        public Guid PackageId { get; set; }
        public Guid UserId { get; set; }
        public bool IsShared { get; set; }
    }
}
