namespace minerobe.api.Helpers.Model
{
    public class EntityPermitModel
    {
        public Guid EntityId { get; set; }
        public EntityType Type { get; set; }
        public Guid PublisherId { get; set; }
        public bool IsShared { get; set; }
    }
}
