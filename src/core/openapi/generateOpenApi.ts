import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { getConfiguredPublicBaseUrl } from '../../config/publicBaseUrl';
import { generateOpenApiDocument } from './openapi';
import { registerAllOpenApi } from './registerAll';

function main(): void {
  const outPath = resolve(process.cwd(), 'openapi.json');

  registerAllOpenApi();

  const baseUrl = getConfiguredPublicBaseUrl() ?? 'http://localhost:3000';

  const openapi = generateOpenApiDocument({
    title: 'BeeHome Planner API (MVP)',
    version: '0.1.0',
    baseUrl,
  });

  writeFileSync(outPath, JSON.stringify(openapi, null, 2), 'utf8');
  console.log(`Wrote ${outPath}`);
}

main();
