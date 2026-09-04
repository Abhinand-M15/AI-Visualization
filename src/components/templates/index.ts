import type { ComponentType } from "react";
import EditorialTemplate from "./EditorialTemplate";
import ClarityTemplate from "./ClarityTemplate";
import CinematicTemplate from "./CinematicTemplate";
import SpaceTemplate from "./SpaceTemplate";
import LunarTemplate from "./LunarTemplate";
import AirlockTemplate from "./AirlockTemplate";
import type { TemplateProps } from "./types";

export const TEMPLATE_COMPONENTS: Record<string, ComponentType<TemplateProps>> = {
  editorial: EditorialTemplate,
  clarity: ClarityTemplate,
  cinematic: CinematicTemplate,
  space: SpaceTemplate,
  lunar: LunarTemplate,
  airlock: AirlockTemplate,
};
