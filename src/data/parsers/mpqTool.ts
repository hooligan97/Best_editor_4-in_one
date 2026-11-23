export interface MpqHeaderInfo {
  signature: string;
  headerSize: number;
  archiveSize: number;
  formatVersion: number;
  sectorSize: number;
  hashTableOffset: number;
  blockTableOffset: number;
  hashTableEntries: number;
  blockTableEntries: number;
  isValidMpq: boolean;
  detectedInternalFiles: string[];
}

export const MPQ_MAGIC = 0x1a51504d; // "MPQ\x1a" in Little Endian

function isRawHeroFile(bytes: Uint8Array): boolean {
  if (bytes.length < 64) return false;
  const firstChar = String.fromCharCode(bytes[0]);
  const hasPrintableAscii = /^[a-zA-Z0-9]$/.test(firstChar);
  const classByte = bytes[16] ?? -1;
  return hasPrintableAscii && classByte >= 0 && classByte <= 5;
}

export function analyzeMpqHeader(bytes: Uint8Array): MpqHeaderInfo {
  if (bytes.length < 32) {
    return {
      signature: 'Too small',
      headerSize: 0,
      archiveSize: bytes.length,
      formatVersion: 0,
      sectorSize: 0,
      hashTableOffset: 0,
      blockTableOffset: 0,
      hashTableEntries: 0,
      blockTableEntries: 0,
      isValidMpq: false,
      detectedInternalFiles: [],
    };
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const magic = view.getUint32(0, true);

  if (magic !== MPQ_MAGIC) {
    const isHero = isRawHeroFile(bytes);
    return {
      signature: isHero ? 'RAW_HERO' : 'UNKNOWN',
      headerSize: 0,
      archiveSize: bytes.length,
      formatVersion: 0,
      sectorSize: 0,
      hashTableOffset: 0,
      blockTableOffset: 0,
      hashTableEntries: 0,
      blockTableEntries: 0,
      isValidMpq: false,
      detectedInternalFiles: isHero ? ['hero'] : [],
    };
  }

  const headerSize = view.getInt32(4, true);
  const archiveSize = view.getInt32(8, true);
  const formatVersion = view.getInt16(12, true);
  const sectorSizeShift = view.getInt16(14, true);
  const sectorSize = 512 << Math.max(0, Math.min(12, sectorSizeShift));
  const hashTableOffset = view.getUint32(16, true);
  const blockTableOffset = view.getUint32(20, true);
  const hashTableEntries = view.getInt32(24, true);
  const blockTableEntries = view.getInt32(28, true);

  return {
    signature: 'MPQ\\x1a',
    headerSize,
    archiveSize,
    formatVersion,
    sectorSize,
    hashTableOffset,
    blockTableOffset,
    hashTableEntries,
    blockTableEntries,
    isValidMpq: true,
    detectedInternalFiles: ['hero', 'game', 'quests'],
  };
}

export function formatHexDump(bytes: Uint8Array, maxLines = 16): string {
  const lines: string[] = [];
  const totalBytes = Math.min(bytes.length, maxLines * 16);

  for (let i = 0; i < totalBytes; i += 16) {
    const lineOffset = i.toString(16).toUpperCase().padStart(4, '0') + '  ';
    let hexPart = '';
    let asciiPart = '';

    for (let j = 0; j < 16; j++) {
      const idx = i + j;
      if (idx < bytes.length) {
        const b = bytes[idx] & 0xff;
        hexPart += b.toString(16).toUpperCase().padStart(2, '0') + ' ';
        asciiPart += b >= 0x20 && b <= 0x7e ? String.fromCharCode(b) : '.';
      } else {
        hexPart += '   ';
      }
      if (j === 7) hexPart += ' ';
    }

    lines.push(`${lineOffset}${hexPart} |${asciiPart}|`);
  }

  if (bytes.length > totalBytes) {
    lines.push(`... (${bytes.length - totalBytes} more bytes)`);
  }

  return lines.join('\n');
}
