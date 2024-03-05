import { IndexLandingPage } from "$lib/server/services/indexServices";


export const GET = async (event) => {
  const request = event.request;
  
  const landingPage=await IndexLandingPage();

  return new Response(
    "Generated new landing page at: " + landingPage.createdAt,
    { status: 200 }
  );
};
