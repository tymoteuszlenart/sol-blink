import {
  getActionBySlug,
  optionsResponse,
  postActionBySlug,
} from "../../../../lib/blink/action-handler";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export const OPTIONS = async () => optionsResponse();

export const GET = async (_req: Request, context: RouteContext) => {
  const { slug } = await context.params;
  return getActionBySlug(slug);
};

export const POST = async (req: Request, context: RouteContext) => {
  const { slug } = await context.params;
  return postActionBySlug(req, slug);
};
