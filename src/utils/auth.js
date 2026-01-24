const KNOWN_PREFIXES = ['Bearer', 'Token', 'JWT', 'Basic'];
const OWNER_ID_KEYS = ['owner_id', 'candidat_id', 'candidate_id', 'id', 'user_id'];

const collapsePrefixes = (parts) => {
  if (parts.length <= 1) {
    return parts;
  }

  if (KNOWN_PREFIXES.includes(parts[0]) && KNOWN_PREFIXES.includes(parts[1])) {
    return collapsePrefixes(parts.slice(1));
  }

  return parts;
};

export const normalizeAuthToken = (rawToken = '', tokenType = '') => {
  const tokenValue = String(rawToken || '').trim();
  if (!tokenValue) {
    return '';
  }

  const segments = tokenValue.split(/\s+/).filter(Boolean);
  if (segments.length === 0) {
    return '';
  }

  if (KNOWN_PREFIXES.includes(segments[0])) {
    const collapsed = collapsePrefixes(segments);
    if (collapsed.length < 2) {
      return '';
    }
    return `${collapsed[0]} ${collapsed.slice(1).join(' ')}`.trim();
  }

  const normalizedType = String(tokenType || '').trim();
  if (normalizedType) {
    const [typePrefix] = normalizedType.split(/\s+/);
    if (typePrefix && KNOWN_PREFIXES.includes(typePrefix)) {
      return `${typePrefix} ${segments.join(' ')}`.trim();
    }
  }

  return `Bearer ${segments.join(' ')}`.trim();
};

const tryNormalizeId = (value) => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return numeric;
    }

    return trimmed;
  }

  return null;
};

const scanForOwnerId = (source, visited = new Set()) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  if (visited.has(source)) {
    return null;
  }
  visited.add(source);

  for (const key of OWNER_ID_KEYS) {
    const normalized = tryNormalizeId(source[key]);
    if (normalized !== null) {
      return normalized;
    }
  }

  const nestedCandidates = [
    source.candidat,
    source.candidate,
    source.data,
    source.user,
    source.profile,
  ];

  for (const nested of nestedCandidates) {
    const nestedId = scanForOwnerId(nested, visited);
    if (nestedId !== null) {
      return nestedId;
    }
  }

  return null;
};

export const extractOwnerId = (payload) => {
  if (Array.isArray(payload)) {
    for (const entry of payload) {
      const found = scanForOwnerId(entry);
      if (found !== null) {
        return found;
      }
    }
    return null;
  }

  return scanForOwnerId(payload);
};
