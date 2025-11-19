/**
 * Central reference to all internal documentation links.
 * Update these when reference slugs change.
 */
export const REFERENCES = {
  repoSetup: "/references/01-repo-setup",
  tsconfig: "/references/02-tsconfig",
  servicesAndLayers: "/references/03-services-and-layers",
  effectStyle: "/references/04-effect-style",
  dataTypes: "/references/05-data-types",
  errorHandling: "/references/06-error-handling",
  config: "/references/07-config",
} as const;

export type ReferenceKey = keyof typeof REFERENCES;
