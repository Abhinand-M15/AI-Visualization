import type { ComponentType } from "react";
import SpaceTemplate from "./SpaceTemplate";
import LunarTemplate from "./LunarTemplate";
import AirlockTemplate from "./AirlockTemplate";
import VoyageTemplate from "./VoyageTemplate";
import ShowcaseTemplate from "./ShowcaseTemplate";
import type { TemplateProps } from "./types";

/** Preview components by template id. Availability (hidden/removed) is decided by the registry in src/lib/templates.ts. */
export const TEMPLATE_COMPONENTS: Record<string, ComponentType<TemplateProps>> = {
  space: SpaceTemplate,
  lunar: LunarTemplate,
  airlock: AirlockTemplate,
  voyage: VoyageTemplate,
  showcase: ShowcaseTemplate,
};
