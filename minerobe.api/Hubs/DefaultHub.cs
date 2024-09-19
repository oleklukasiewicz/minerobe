using Microsoft.AspNetCore.SignalR;

namespace minerobe.api.Hubs
{
    public class ConnectionMapping<T>
    {
        private readonly Dictionary<T, HashSet<string>> _connections =
            new Dictionary<T, HashSet<string>>();

        public void Add(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    connections = new HashSet<string>();
                    _connections.Add(key, connections);
                }

                lock (connections)
                {
                    connections.Add(connectionId);
                }
            }
        }

        public IEnumerable<string> GetConnections(T key)
        {
            HashSet<string> connections;
            if (_connections.TryGetValue(key, out connections))
            {
                return connections;
            }

            return Enumerable.Empty<string>();
        }

        public void Remove(T key, string connectionId)
        {
            lock (_connections)
            {
                HashSet<string> connections;
                if (!_connections.TryGetValue(key, out connections))
                {
                    return;
                }

                lock (connections)
                {
                    connections.Remove(connectionId);

                    if (connections.Count == 0)
                    {
                        _connections.Remove(key);
                    }
                }
            }
        }
    }
    public class DefaultHub : Hub, IDefaultHub
    {
        private readonly static ConnectionMapping<string> _connections =
            new ConnectionMapping<string>();
        private readonly IHubContext<DefaultHub> _context;

        public DefaultHub(IHubContext<DefaultHub> context)
        {
            _context = context;
        }

        public async Task SendMessage(Guid userId, string messageType, object message)
        {
            IEnumerable<string> connections = _connections.GetConnections(userId.ToString());

            foreach (var connection in connections)
            {
                await _context.Clients.Client(connection).SendAsync(messageType, message);
            }
        }

        public override Task OnConnectedAsync()
        {
            string userId = Context.GetHttpContext().Request.Query["userId"];

            _connections.Add(userId, Context.ConnectionId);

            return base.OnConnectedAsync();
        }

        public override Task OnDisconnectedAsync(Exception? exception)
        {
            string userId = Context.GetHttpContext().Request.Query["userId"];

            _connections.Remove(userId, Context.ConnectionId);

            return base.OnDisconnectedAsync(exception);
        }
    }
}
