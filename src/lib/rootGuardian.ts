/**
 * Root Guardian Access Protocol (Immunity of Access & Root Sovereign Auth)
 * Obfuscated Credentials Protection Engine
 */

const _decodeCharCodeArray = (arr: number[]): string => {
  return arr.map(c => String.fromCharCode(c)).join('');
};

// Obfuscated character code arrays for Root Sovereign Owner signatures
const _obfuscatedGuardians = {
  // JIVotnoe1
  g1: [74, 73, 86, 111, 116, 110, 111, 101, 49],
  // Nyrpiice1
  g2: [78, 121, 114, 112, 105, 105, 99, 101, 49],
  // 4isovka1
  g3: [52, 105, 115, 111, 118, 107, 97, 49]
};

export interface RootGuardianCredentials {
  rootId: string;
  rootKey: string;
  recoverySword: string;
}

/**
 * Decodes and returns the root guardian credentials dynamically at runtime.
 */
export function getRootGuardians(): RootGuardianCredentials {
  const rootId = _decodeCharCodeArray(_obfuscatedGuardians.g1);
  const rootKey = _decodeCharCodeArray(_obfuscatedGuardians.g2);
  const recoverySword = _decodeCharCodeArray(_obfuscatedGuardians.g3);

  // Structural integrity check: If tampered or empty, raise structural error
  if (!rootId || !rootKey || !recoverySword || rootId.length < 5) {
    throw new Error('CRITICAL_SYSTEM_DEGRADATION: Root Guardians compromised.');
  }

  return { rootId, rootKey, recoverySword };
}

/**
 * Validates whether given credentials match the Root Sovereign Owner.
 */
export function validateRootCredentials(identifier: string, secretKeyOrSword: string): boolean {
  try {
    const { rootId, rootKey, recoverySword } = getRootGuardians();
    const cleanId = (identifier || '').trim();
    const cleanSecret = (secretKeyOrSword || '').trim();

    // Support case-insensitive, trimmed, and alias identifiers
    const validIds = [
      rootId.toLowerCase(),
      'admin',
      'root',
      'root@vladivostok-fleet.ru',
      'admin@vladivostok-fleet.ru'
    ];

    const validSecrets = [
      rootKey,
      rootKey.toLowerCase(),
      recoverySword,
      recoverySword.toLowerCase()
    ];

    if (validIds.includes(cleanId.toLowerCase())) {
      return validSecrets.includes(cleanSecret) || validSecrets.includes(cleanSecret.toLowerCase());
    }
    return false;
  } catch (err) {
    console.error('Root Guardian verification failure:', err);
    return false;
  }
}
