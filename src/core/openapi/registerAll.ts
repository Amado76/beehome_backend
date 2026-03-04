/**
 * Central registry for all OpenAPI schemas and paths.
 *
 * This file imports OpenAPI registration modules from each feature.
 * Each module's OpenAPI file (e.g., auth.openapi.ts) registers its endpoints
 * and schemas against the global registry when imported.
 *
 * The registry is later read by generateOpenApi() to produce the complete
 * OpenAPI specification served at GET /docs/spec.json
 */

// Import module OpenAPI registrations here.
// Each imported file should register its schemas/paths against the shared registry.
// The actual registration happens as a side effect during module import.

import '../../modules/auth/auth.openapi'; // Auth endpoints: POST /auth/signup, /auth/login
import '../../modules/families/families.openapi'; // Family endpoints: POST /families

/**
 * Trigger OpenAPI registration from all modules.
 * This function is intentionally empty; the real work happens via imports above.
 * Called at application startup to ensure all schemas are registered before
 * the OpenAPI spec is generated.
 */
export function registerAllOpenApi(): void {
  // Intentionally empty: imports above execute registration side effects.
}
