export const GET = async (event) => {
  const request = event.request;
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }
	return new Response(JSON.stringify(event), { status: 200 });
};