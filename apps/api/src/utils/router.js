export function route(method, path, handler) {
  return {
    method,
    path,
    handler,
    segments: path.split('/').filter(Boolean),
  };
}

export function matchRoute(routes, method, pathname) {
  const pathSegments = pathname.split('/').filter(Boolean);

  for (const currentRoute of routes) {
    if (currentRoute.method !== method) continue;
    if (currentRoute.segments.length !== pathSegments.length) continue;

    const params = {};
    let matches = true;

    for (let index = 0; index < currentRoute.segments.length; index += 1) {
      const routeSegment = currentRoute.segments[index];
      const pathSegment = pathSegments[index];

      if (routeSegment.startsWith(':')) {
        params[routeSegment.slice(1)] = decodeURIComponent(pathSegment);
        continue;
      }

      if (routeSegment !== pathSegment) {
        matches = false;
        break;
      }
    }

    if (matches) return { route: currentRoute, params };
  }

  return null;
}
