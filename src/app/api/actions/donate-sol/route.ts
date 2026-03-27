import {
  getActionBySlug,
  optionsResponse,
  postActionBySlug,
} from "../../../../lib/blink/action-handler";

const LEGACY_SLUG = "donate-sol";

export const OPTIONS = async () => optionsResponse();
export const GET = async () => getActionBySlug(LEGACY_SLUG);
export const POST = async (req: Request) => postActionBySlug(req, LEGACY_SLUG);