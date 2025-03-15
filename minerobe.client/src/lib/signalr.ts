let signalRws = null;
export const SIGNAL_R = {
  getUserWebSocket: async function (userId) {
    if (signalRws) return signalRws;
    const { HubConnectionBuilder, HttpTransportType } = await import(
      "@microsoft/signalr"
    );
    signalRws = new HubConnectionBuilder()
      .withUrl("/api/ws?userId=" + userId, HttpTransportType.ServerSentEvents)
      .withKeepAliveInterval(15000)
      .withAutomaticReconnect()
      .build();
    return signalRws;
  },
};
