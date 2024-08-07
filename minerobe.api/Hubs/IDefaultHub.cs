
namespace minerobe.api.Hubs
{
    public interface IDefaultHub
    {
        Task OnConnectedAsync();
        Task OnDisconnectedAsync(Exception exception);
        Task SendMessage(Guid userId, string messageType, object message);
    }
}