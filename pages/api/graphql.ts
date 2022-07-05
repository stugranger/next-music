import {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  sendResult,
  shouldRenderGraphiQL,
  Request
} from 'graphql-helix';
import { NextApiRequest, NextApiResponse } from 'next';

import { schema } from 'lib/graphql/schema';

async function graphql(request: NextApiRequest, response: NextApiResponse) {
  const normalisedRequest: Request = {
    body: request.body,
    headers: request.headers,
    method: request.method ?? '',
    query: request.query
  }

  if (shouldRenderGraphiQL(normalisedRequest)) {
    return response.send(renderGraphiQL({ endpoint: '/api/graphql' }));
  }

  const { operationName, query, variables } = getGraphQLParameters(normalisedRequest);
  const result = await processRequest({
    operationName,
    query,
    request: normalisedRequest,
    schema,
    variables
  });

  await sendResult(result, response);
}

export default graphql;
