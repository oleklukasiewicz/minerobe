import { LandingPageData } from "$src/data/common";
import { SetDocumentAnonymous } from "$src/data/firebase";

export const GET = async (event) => {
  const request = event.request;
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}` && authHeader !== `Bearer ${import.meta.env.VITE_CRON_SECRET}` ) {
    return new Response('Unauthorized' , {
      status: 401,
    });
  }

  const landingPage = new LandingPageData(new Date(),"banner",[],[]);

  await SetDocumentAnonymous("public","landing",landingPage)
	return new Response("Generated new landing page at: "+landingPage.createdAt, { status: 200 });
};